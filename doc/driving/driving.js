var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', function (socket) {
    console.log(`${socket.id} connected`);

	socket.data = {
		position:{
			x: 0, y: 0, z: 0
		},
		rotation:{
			w: 0, x: 0, y: 0, z: 0
		}
	}

	socket.emit('online', { id: socket.id });

	socket.on('disconnect', function () {
		console.log(`${socket.id} in ${socket.roomID} disconnected`);
		io.to(socket.roomID).emit('offline', { id: socket.id });
		// socket.broadcast.emit('deletePlayer', { id: socket.id });
	});

	socket.on('init', function (data) {
		console.log(data)
		socket.join(data.roomID);
		socket.roomID = data.roomID;

		socket.data.id = data.id;
		socket.data.roomID = data.roomID;
		socket.data.model = data.model;
		socket.data.colour = data.colour;

		if(data.position === undefined)
			return;
		socket.data.position.x = data.position.x;
		socket.data.position.y = data.position.y;
		socket.data.position.z = data.position.z;
		if(data.rotation === undefined)
			return;
		socket.data.rotation.w = data.rotation.w;
		socket.data.rotation.x = data.rotation.x;
		socket.data.rotation.y = data.rotation.y;
		socket.data.rotation.z = data.rotation.z;
	});

	socket.on('update', function (data) {
		if(data.position === undefined)
			return;
		socket.data.position.x = data.position.x;
		socket.data.position.y = data.position.y;
		socket.data.position.z = data.position.z;
		if(data.rotation === undefined)
			return;
		socket.data.rotation.w = data.rotation.w;
		socket.data.rotation.x = data.rotation.x;
		socket.data.rotation.y = data.rotation.y;
		socket.data.rotation.z = data.rotation.z;
	});

	socket.on('chat', function (data) {
		// console.log(`chat message: ${data.id} ${data.message}`);
		// socket.broadcast.emit("chat message", msg);
		if (data.type === "global") {
			io.emit('message', { id: socket.id, message: data.message });
		}
		else if (data.type === "room") {
			io.to(socket.roomID).emit('message', { id: socket.id, roomID: socket.roomID,
				message: data.message });
		}
		else if (data.type === "private") {
			io.to(data.id).emit('message', { id: socket.id, message: data.message });
		}
	})
});

http.listen(3000, function () {
	console.log('listening on *:3000');
});

setInterval(function () {
	// console.log(io.of("/").adapter.rooms);
	// const nsp = io.of('/').adapter.rooms;
	const nsp = io.of('/');
	let pack = new Map();
	// let pack = [];

	for (let id in io.sockets.sockets) {
		const socket = nsp.connected[id];
		// Only push sockets that have been initialised
		// only push same room pack
		if (socket.data.model !== undefined) {
			// console.log(`roomID: ${socket.roomID} id: ${socket.id}`);
			if (!pack.has(socket.roomID))
				pack.set(socket.roomID, []);
			// pack[socket.roomID] = [];
			pack.get(socket.roomID).push({
				// pack[socket.roomID].push({
				id: socket.id,
				model: socket.data.model,
				colour: socket.data.colour,
				// roomID: socket.data.roomID,
				position: socket.data.position,
				rotation: socket.data.rotation,
			});
		}
	}
	if (pack.size > 0) {
		// console.log(pack)
		// io.emit('remoteData', pack);
		for (const roomID of pack.keys()) {
			// console.log(`roomID: ${roomID}`);
			io.to(roomID).emit('update', pack.get(roomID));
		}
	}
}, 40);
