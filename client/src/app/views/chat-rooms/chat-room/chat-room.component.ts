import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit {
  public chatId: string | null = '';
  public userCount = 0;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('chatId') || '';

    this.chatService.sendMessage({
      target: 'websocket',
      type: 'users',
      room: this.chatId,
      data: {
        msg: '',
        socketId: '',
      },
    });

    this.chatService.getConnectedUsers().subscribe((users) => {
      this.userCount = users.length;
    });
  }
}
