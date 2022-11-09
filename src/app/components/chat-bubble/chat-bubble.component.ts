import { Component, Input, OnInit } from '@angular/core';
import { Conversation } from 'src/app/interfaces/chat.interface';

@Component({
  selector: 'app-chat-bubble',
  templateUrl: './chat-bubble.component.html',
  styleUrls: ['./chat-bubble.component.scss'],
})
export class ChatBubbleComponent implements OnInit {
  @Input() data: Conversation = {
    picture: '',
    text: '',
    date: 1231983217,
    incoming: false,
  };

  constructor() {}

  ngOnInit(): void {}
}
