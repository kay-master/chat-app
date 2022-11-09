import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ChatRoomsRoutingModule } from './chat-rooms-routing.module';
import { ChatRoomComponent } from './chat-room/chat-room.component';
import { ChatSectionComponent } from 'src/app/components/chat-section/chat-section.component';
import { MediaComponent } from 'src/app/components/media/media.component';
import { ChatBubbleComponent } from '../../components/chat-bubble/chat-bubble.component';
import { ChatFormComponent } from '../../components/chat-form/chat-form.component';
import { ButtonComponent } from '../../components/button/button.component';

@NgModule({
  declarations: [
    ChatRoomComponent,
    ChatSectionComponent,
    MediaComponent,
    ChatBubbleComponent,
    ChatFormComponent,
    ButtonComponent,
  ],
  imports: [CommonModule, ChatRoomsRoutingModule, ReactiveFormsModule],
})
export class ChatRoomsModule {}
