export interface SocketData {
	target: "websocket" | "webrtc";
	type: string;
	room: string;
	data: {
		msg: string;
		socketId: string;
	};
}

export type SocketDataMsg = SocketData & {
	socketId: string;
};
