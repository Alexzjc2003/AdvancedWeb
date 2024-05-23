package main

import (
	"encoding/json"
	"fmt"
	"github.com/zishang520/engine.io/types"
	"github.com/zishang520/socket.io/socket"
	_ "net/http/pprof"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

type Rotation struct {
	W float64 `json:"w"`
	X float64 `json:"x"`
	Y float64 `json:"y"`
	Z float64 `json:"z"`
}

type Data struct {
	Position Position `json:"position"`
	Rotation Rotation `json:"rotation"`
	SocketID string   `json:"id"`
	RoomID   string   `json:"roomID"`
	Model    string   `json:"model"`
	Colour   string   `json:"colour"`
}

//type Socket struct {
//	Data Data `json:"data"`
//}

type Chat struct {
	ID      string `json:"id"`
	RoomID  string `json:"roomID"`
	Type    string `json:"type"`
	Message string `json:"message"`
}

func socketServer() (err error) {
	httpServer := types.CreateServer(nil)
	c := socket.DefaultServerOptions()
	c.SetAllowEIO3(true)
	c.SetCors(&types.Cors{
		Origin:      "*",
		Credentials: true,
	})
	io := socket.NewServer(httpServer, c)
	err = io.On("connection", func(clients ...any) {
		// only one client in this function

		for i, client := range clients {
			if client != nil && i != 0 {
				fmt.Println("client" + client.(*socket.Socket).Id() + " connected, exceed 1")
				return
				//fmt.Println(i, client.(*socket.Socket).Id())
			}
		}
		client := clients[0].(*socket.Socket)
		id := client.Id()
		var roomID string
		fmt.Println("client" + id + " connected")

		//io.Emit()
		err = client.Emit("online", map[string]interface{}{
			"id": id,
		})
		if err != nil {
			return
		}

		err = client.On("disconnect", func(clients ...any) {
			fmt.Println("client" + id + " disconnected")
			//io.Emit("offline", map[string]interface{}{
			//	"socketid": id,
			//})
			//thisSocket, ok := io.Sockets().Sockets().Load(id)
			//if !ok {
			//	fmt.Println("socket not found")
			//	return
			//}
			if roomID == "" {
				return
			}
			err = io.Of(socket.Room(roomID), nil).Emit("offline", map[string]interface{}{
				"id": id,
			})
			////fmt.Println(client.Rooms().Len())
			//for _, room := range client.Rooms().Keys() {
			//	fmt.Println(room)
			//	err = io.Of(room, nil).Emit("offline", map[string]interface{}{
			//		//err = client.Broadcast().Emit("offline", map[string]interface{}{
			//		"id": client.Id(),
			//		// "action":   "disconnect",
			//	})
			//}

		})
		if err != nil {
			fmt.Println(err)
			return
		}

		err = client.On("init", func(requestData ...any) {
			for i, _ := range requestData {
				if i != 0 {
					fmt.Println("client" + id + " sent data")
					return
				}
			}
			requestDatum := requestData[0]
			var jsonData []byte
			var data Data
			jsonData, err = json.Marshal(requestDatum)
			if err != nil {
				return
			}
			if err = json.Unmarshal(jsonData, &data); err != nil {
				fmt.Println("Error:", err)
				return
			}
			data.SocketID = string(id)
			roomID = data.RoomID
			var room = socket.Room(data.RoomID)
			fmt.Println("client" + data.SocketID + " joined room " + data.RoomID)
			client.Join(room)
			for _, i := range client.Rooms().Keys() {
				fmt.Println(i)
			}
			client.SetData(data)
		})

		if err != nil {
			fmt.Println(err)
			return
		}

		err = client.On("update", func(requestData ...any) {
			for i, _ := range requestData {
				if i != 0 {
					fmt.Println("client" + id + " sent data")
					return
				}
			}
			requestDatum := requestData[0]
			var jsonData []byte
			var data Data
			jsonData, err = json.Marshal(requestDatum)
			if err != nil {
				return
			}
			if err = json.Unmarshal(jsonData, &data); err != nil {
				fmt.Println("Error:", err)
				return
			}
			data.SocketID = string(id)
			client.SetData(data)
		})

		if err != nil {
			fmt.Println(err)
			return
		}

		err = client.On("chat", func(requestData ...any) {
			for i := range requestData {
				if i != 0 {
					fmt.Println("client" + id + " sent data, exceed 1")
					return
				}
			}
			requestDatum := requestData[0]
			var jsonData []byte
			var chat Chat
			jsonData, err = json.Marshal(requestDatum)
			if err != nil {
				return
			}
			if err = json.Unmarshal(jsonData, &chat); err != nil {
				fmt.Println("Error:", err)
				return
			}
			chat.ID = string(id)
			if chat.Type == "global" {
				err = client.Broadcast().Emit("message", chat)
			} else if chat.Type == "room" {
				err = io.Of(socket.Room(chat.RoomID), nil).Emit("message", chat)
			} else if chat.Type == "private" {
				// TODO
				err = io.Of(socket.Room(chat.ID), nil).Emit("message", chat)
			}
			if err != nil {
				fmt.Println(err)
				return
			}
		})
	})
	if err != nil {
		return
	}
	httpServer.Listen(":3000", func() {
		fmt.Println("Listening on 3000")
	})

	ticker := time.NewTicker(400 * time.Millisecond)
	defer ticker.Stop()
	go func() {
		for range ticker.C {
			socketMap := io.Sockets().Sockets()
			roomMap := make(map[string][]Data)
			for _, socketID := range socketMap.Keys() {
				//fmt.Println("update" + socketID)
				thisSocket, ok := socketMap.Load(socketID)
				if !ok {
					fmt.Println("socket not found")
					continue
				}
				data, ok := thisSocket.Data().(Data)
				if !ok {
					fmt.Println("data not found")
					continue
				}
				if data.Model == "" {
					fmt.Println("model not found")
					return
				}
				if roomMap[data.RoomID] == nil {
					roomMap[data.RoomID] = make([]Data, 0)
				}
				roomMap[data.RoomID] = append(roomMap[data.RoomID], data)
			}
			if len(roomMap) > 0 {
				for roomID, roomData := range roomMap {
					err = io.Of(socket.Room(roomID), nil).Emit("update", roomData)
					if err != nil {
						fmt.Println(err)
						return
					}
				}
			}
		}
	}()

	exit := make(chan struct{})
	SignalC := make(chan os.Signal)

	signal.Notify(SignalC, os.Interrupt, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
	go func() {
		for s := range SignalC {
			switch s {
			case os.Interrupt, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT:
				close(exit)
				return
			}
		}
	}()

	<-exit
	err = httpServer.Close(nil)
	return
}

func main() {
	//err := ginServer()
	err := socketServer()
	if err != nil {
		fmt.Println(err)
		return
	}
	os.Exit(0)
}
