import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() text = '';
  @Output() click = new EventEmitter<MouseEvent>();

  constructor() {}

  ngOnInit(): void {}

  onClick(event: MouseEvent) {
    this.click.emit(event);
  }
}
