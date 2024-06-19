import { Injectable } from '@angular/core';
import { NotificationService } from '@app/three/service/notification.service';
import { UserService } from '@app/user/service/user.service';
import { WebSocketService } from '@app/utils/service/websocket.service';
import { ExamService } from '@app/three/service/exam.service';
import * as THREE from 'three';
import { CarcontrolService } from '@app/three/service/carcontrol.service';
import { LoadResourcePart } from './load-resource';

@Injectable({
  providedIn: 'root',
})
export class RemotePart {
  io: WebSocketService = new WebSocketService();
  socketId: string = '';
  remoteCars: Map<string, any> = new Map<string, any>();
  scene: any;
  roomId: string = '';
  chatSocket: WebSocket | null = null;
  carcontrol: any;
  checkInterval: number = 1000;
  lastBeepTime: number = 0;
  lastLastBeepTime: number = 0;
  model: any;
  constructor(
    private loadResourcePart: LoadResourcePart,
    private notification: NotificationService,
    private userService: UserService,
    private examService: ExamService,
  ) { }

  setRoom(roomId: string, scene: THREE.Scene, carcontrol: CarcontrolService, model: any) {
    this.carcontrol = carcontrol;
    this.roomId = roomId;
    this.scene = scene;
    this.model = model;
  }

  init_websocket() {
    let self = this;
    this.io.connect('ws://10.117.245.17:53000/room');
    // this.io.connect('wss://p.jingyijun.xyz/room');
    this.io.onMessage('online').subscribe((obj: any) => {
      // console.log(obj);
      self.socketId = obj.id;
    });

    this.io.onMessage('update').subscribe((obj: any) => {
      // console.log("update", obj);
      self.handleUpdate(obj);
    });

    this.io.onMessage('offline').subscribe((obj: any) => {
      // console.log(obj);
      self.handleOffline(obj.id);
    });

    this.io.onMessage('message').subscribe((obj: any) => {
      // console.log(obj);
      self.handleChat(obj.id, obj.message);
    });

    this.io.onMessage('event').subscribe((obj: any) => {
      // console.log(obj);
      self.handleEvent(obj);
    });
  }

  handleUpdate(remoteDataList: any[]) {
    let self = this;
    for (let remoteData of remoteDataList) {
      let remoteId = remoteData.id;
      if (remoteId == this.socketId) {
        continue;
      }
      let centerPosition = remoteData.position;
      let quaternion = remoteData.rotation;
      if (!this.remoteCars.has(remoteId)) {
        console.log('load remote car' + remoteId);
        self.remoteCars.set(remoteId, {
          obj: 'default',
        });
        this.loadResourcePart.loadCarResouce(remoteData.model, (carObj) => {
          carObj.position.set(
            centerPosition.x,
            centerPosition.y,
            centerPosition.z
          );
          carObj.quaternion.set(
            quaternion.x,
            quaternion.y,
            quaternion.z,
            quaternion.w
          );

          self.scene.add(carObj);
          self.remoteCars.set(remoteId, {
            obj: carObj,
          });
        });
      } else {
        let carObj = this.remoteCars.get(remoteId).obj;
        carObj.position.set(
          centerPosition.x,
          centerPosition.y,
          centerPosition.z
        );
        carObj.quaternion.set(
          quaternion.x,
          quaternion.y,
          quaternion.z,
          quaternion.w
        );
      }
    }
  }

  handleOffline(socketId) {
    if (this.remoteCars.has(socketId)) {
      this.scene.remove(this.remoteCars.get(socketId).obj);
      this.remoteCars.delete(socketId);
    }
  }

  handleChat(fromId, message) {
    this.notification.showNotification(`${fromId}: ${message}`);
  }

  sendInit(model_name: string) {
    console.log('sendInit', this.roomId);
    let self = this;

    let UserID = 0;
    UserID = +this.userService.getUserId();
    this.io.sendMsg('init', {
      user_id: UserID,
      roomID: self.roomId,
      model: model_name,
      position: {
        x: self.model.obj.position.x,
        y: self.model.obj.position.y,
        z: self.model.obj.position.z,
      },
      rotation: {
        w: self.model.obj.quaternion.w,
        x: self.model.obj.quaternion.x,
        y: self.model.obj.quaternion.y,
        z: self.model.obj.quaternion.z,
      },
    });
  }

  sendChatMsg(chat_msg: string, chatType: string, roomId: string, toId: string) {
    console.log('sendChatMsg', chat_msg, chatType, roomId, toId);
    // need string here
    let user_id = String(this.userService.getUserId());
    switch (chatType) {
      case 'room':
        {
          this.io.sendMsg('chat', {
            type: 'room',
            message: chat_msg,
            room_id: roomId,
            id: user_id,
          });
        }
        break;
      case 'private':
        {
          this.io.sendMsg('chat', {
            type: 'private',
            message: chat_msg,
            to_id: toId,
            id: user_id,
            room_id: roomId,
          });
        }
        break;
      case 'global':
        {
          this.io.sendMsg('chat', {
            type: 'global',
            message: chat_msg,
            id: user_id,
            room_id: roomId,
          });
        }
        break;
      case 'ai':
        {
          this.sendMessage(chat_msg);
        }
        break;
      default:
        break;
    }

  }

  sendDisconnect() {
    this.io.sendMsg('disconnection', {});
  }

  updateSocket() {
    let self = this;
    this.io.sendMsg('update', {
      position: {
        x: self.model.obj.position.x,
        y: self.model.obj.position.y,
        z: self.model.obj.position.z,
      },
      rotation: {
        w: self.model.obj.quaternion.w,
        x: self.model.obj.quaternion.x,
        y: self.model.obj.quaternion.y,
        z: self.model.obj.quaternion.z,
      },
    });
  }

  sendEvent(event: string, roomID: string) {
    let self = this;
    this.io.sendMsg('event', {
      event: event,
      room_id: roomID,
      id: this.socketId,
      position: {
        x: self.model.obj.position.x,
        y: self.model.obj.position.y,
        z: self.model.obj.position.z,
      },
      rotation: {
        w: self.model.obj.quaternion.w,
        x: self.model.obj.quaternion.x,
        y: self.model.obj.quaternion.y,
        z: self.model.obj.quaternion.z,
      },
    });
  }

  checkBeep() {

    let currentTime = new Date().getTime();

    if (currentTime - this.lastBeepTime < this.checkInterval) {
      return;
    }
    console.log(currentTime, this.lastBeepTime, this.lastLastBeepTime)
    if (this.lastLastBeepTime && currentTime - this.lastLastBeepTime < 5000) {
      this.examService.addPunishment('FREQUENTLYBEEP', '频繁鸣笛', 1, response => { }, response => { });
    }
    this.lastLastBeepTime = this.lastBeepTime;
    this.lastBeepTime = currentTime;
  }

  handleEvent(event: any) {
    switch (event.event) {
      case 'beep':
        {
          const distance = Math.sqrt(
            Math.pow(event.position.x - this.model.position.x, 2) +
            Math.pow(event.position.y - this.model.position.y, 2) +
            Math.pow(event.position.z - this.model.position.z, 2)
          );
          console.log('beep distance', distance);
          if (distance > 40) {
            return;
          }
          // beep
          this.carcontrol.beep(event.position);
          this.checkBeep();
        }
        break;
      default:
        break;
    }
  }

  createWebSocket() {
    let self = this
    this.chatSocket = new WebSocket("ws://10.117.245.17:58080/api/ws/chat?jwt=" + this.userService.getUserToken());

    this.chatSocket.onopen = function () {
      // logMessage("Connected to server");
      console.log("Connected to server");
    };

    this.chatSocket.onmessage = function (event) {
      self.notification.showNotification(`Moss: ${event.data}`);
      // console.log("Received response from server: " + event.data);
    }.bind(this);

    this.chatSocket.onclose = function () {
      // logMessage("Disconnected from server");
      console.log("Disconnected from server")
      self.chatSocket = null;
    };

    this.chatSocket.onerror = function (error) {
      // logMessage("WebSocket Error: " + error);
      console.log("WebSocket Error: " + error);
    };
  }

  sendMessage(message: string) {
    if (message) {
      this.notification.showNotification(`You: ${message}`);
      // Close any existing WebSocket connection
      if (this.chatSocket) {
        this.chatSocket.close();
      }

      // Create a new WebSocket connection
      this.createWebSocket();

      // Wait for the connection to open before sending the message
      if (this.chatSocket) {
        this.chatSocket.onopen = function () {
          // this.send(JSON.stringify({ request: message }));
          this.send(message);
          console.log("Sent message to server: " + message);
          // logMessage(message);
          // document.getElementById("message").value = '';
        };
      }
    }
  }

  // function logMessage(message) {
  //   let chatBox = document.getElementById("chat-box");
  //   let messageElement = document.createElement("div");
  //   messageElement.textContent = message;
  //   chatBox.appendChild(messageElement);
  //   chatBox.scrollTop = chatBox.scrollHeight;
  // }

  // document.getElementById("message").addEventListener("keydown", function (event) {
  //   if (event.key === "Enter") {
  //     sendMessage();
  //   }
  // });
}
