import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { randomStr } from 'src/app/utils/string';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public randomUsername = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.randomUsername = this.newUsername();
  }

  public newUsername() {
    return randomStr();
  }

  public navigate() {
    this.router.navigate([`/chat-rooms/${this.randomUsername}`]);
  }
}
