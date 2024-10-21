import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-dropdown-select',
  standalone: true,
  imports: [FormsModule, NgForOf],
  templateUrl: './dropdown-select.component.html',
})
export class DropdownSelectComponent {
  @Input() name: string = 'Dropdown';
  @Input() options: string[] = [];
  @Input() chosenOption: string | null | undefined = '';
  @Output() chosenOptionChange: EventEmitter<string | null | undefined> =
    new EventEmitter();

  onChange() {
    this.chosenOptionChange.emit(this.chosenOption);
  }
}
