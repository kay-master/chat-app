import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Conversation } from 'src/app/interfaces/chat.interface';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-section',
  templateUrl: './chat-section.component.html',
  styleUrls: ['./chat-section.component.scss'],
})
export class ChatSectionComponent implements OnInit, OnDestroy {
  public conversation: Conversation[] = [];

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const chatId = this.route.snapshot.paramMap.get('chatId') || '';

    // Register
    this.chatService.sendMessage({
      target: 'websocket',
      type: 'register',
      room: chatId,
      data: {
        msg: chatId || '',
        socketId: this.chatService.getSocketId(),
      },
    });

    this.chatService.getNewMessage().subscribe((message) => {
      console.log(message);

      if (
        message.target === 'websocket' &&
        message.type === 'msg' &&
        typeof message.data !== 'string'
      ) {
        this.conversation.unshift({
          picture: this.randomPic(),
          incoming: message.data.socketId !== message.socketId,
          text: message.data.msg,
          date: message.date || Date.now(),
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }

  private randomPic() {
    return `https://randomuser.me/api/portraits/${
      Math.floor(Math.random() * 2) === 1 ? 'men' : 'women'
    }/${Math.floor(Math.random() * 99) + 1}.jpg`;
  }
}
