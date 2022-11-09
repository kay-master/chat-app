import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './components/nav/nav.component';
import { ChatRoomsModule } from './views/chat-rooms/chat-rooms.module';
import { DashboardModule } from './views/dashboard/dashboard.module';
import { SharedModule } from './shared/shared.module';
import { TitleService } from './shared/services/title.service';

@NgModule({
  declarations: [AppComponent, NavComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DashboardModule,
    SharedModule,
    ChatRoomsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(public titleService: TitleService) {}
}
