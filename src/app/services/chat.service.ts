import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SocketData, SocketDataMsg } from '../interfaces/chat.interface';

const initMsg = {
  socketId: '',
  room: '',
  target: 'webrtc',
  type: '',
  data: {
    msg: '',
    socketId: '',
  },
  date: 112,
};

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  public chatId = '';

  public message$: BehaviorSubject<SocketDataMsg> =
    new BehaviorSubject<SocketDataMsg>({
      ...initMsg,
      target: 'websocket',
    });

  public users$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public rtc$: BehaviorSubject<SocketDataMsg> =
    new BehaviorSubject<SocketDataMsg>({
      ...initMsg,
      target: 'webrtc',
    });

  private socket = io(environment.SOCKET_ENDPOINT);

  constructor() {}

  public sendMessage(message: SocketData) {
    this.socket.emit('message', {
      ...message,
      socketId: this.socket.id,
    });
  }

  public getNewMessage() {
    this.socket.on('message', (message: SocketData) => {
      this.message$.next({
        ...message,
        room: '',
        socketId: this.socket.id,
      });
    });

    return this.message$.asObservable();
  }

  public getRTCMessage() {
    this.socket.on('rtc', (message: SocketData) => {
      this.rtc$.next({
        ...message,
        room: '',
        socketId: this.socket.id,
      });
    });

    return this.rtc$.asObservable();
  }

  public getConnectedUsers() {
    this.socket.on('users', (message: string[]) => {
      this.users$.next(message);
    });

    return this.users$.asObservable();
  }

  public getSocketId() {
    return this.socket.id;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
