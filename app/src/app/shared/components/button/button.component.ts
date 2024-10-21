import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() width: string = 'w-auto';
  @Input() buttonText: string = 'Button';
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Output() clickEvent = new EventEmitter<Event>();

  handleClick() {
    if (!this.disabled) {
      this.clickEvent.emit();
    }
  }
}
