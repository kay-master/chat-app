import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss'],
})
export class ChatFormComponent implements OnInit {
  private chatId = '';

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {}

  messageForm = new FormGroup({
    message: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('chatId') || '';
  }

  onSubmit() {
    this.chatService.sendMessage({
      target: 'websocket',
      room: this.chatId,
      type: 'msg',
      data: {
        msg: this.messageForm.value.message || '',
        socketId: this.chatService.getSocketId(),
      },
    });

    this.messageForm.reset();
  }
}
