import { Socket, Server } from "socket.io";
import { SocketDataMsg } from "../interfaces/chat.interface";

function newMsg(socketId: string, msg: SocketDataMsg) {
	return {
		socketId,
		target: msg.target,
		type: msg.type,
		data: msg.data,
		date: Date.now(),
	};
}

function getUsers(io: Server) {
	const users: string[] = [];

	for (const [id] of io.of("/").sockets) {
		users.push(id);
	}

	return users;
}

function handleLogin(socket: Socket, msg: SocketDataMsg, io: Server) {
	socket.join(msg.data.msg);

	socket.in(msg.data.msg).emit("users", getUsers(io));
}

function socketHandler(socket: Socket, io: Server) {
	console.log(`User connected: ${socket.id}`);

	socket.on("message", (message: SocketDataMsg) => {
		if (message.target === "websocket") {
			if (message.type === "register") {
				handleLogin(socket, message, io);
			} else if (message.type === "users") {
				io.emit("users", getUsers(io));
			} else {
				console.log(message);

				io.in(message.room).emit("message", newMsg(socket.id, message));
			}
		} else if (message.target === "webrtc") {
			console.log("rtc", message);
			socket.in(message.room).emit("rtc", newMsg(socket.id, message));
		}
	});

	socket.on("disconnect", () => {
		console.log("a user disconnected!");
	});
}

const socketController = (io: Server) => {
	io.on("connection", (socket) => socketHandler(socket, io));

	io.on("error", (error) => {
		console.error("Socket error", error);
	});
};

export default socketController;
