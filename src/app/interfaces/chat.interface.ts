export interface Conversation {
  picture: string;
  text: string;
  date: number;
  incoming: boolean;
}

export interface SocketData {
  target: 'websocket' | 'webrtc';
  type: string;
  data: {
    msg: any;
    socketId: string;
  };
  date?: number;
  room: string;
}

export type SocketDataMsg = SocketData & {
  socketId: string;
  room: string;
};

export type RTCMessageType =
  | 'offer'
  | 'answer'
  | 'call-request'
  | 'call-accepted'
  | 'ice-candidate'
  | 'end-call';
