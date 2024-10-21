import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './color-picker.component.html',
})
export class ColorPickerComponent {
  @Input() name: string = 'Color';
  @Input() color: string | null | undefined = '#000000';
  @Output() colorChange = new EventEmitter<string | null | undefined>();

  onChange() {
    this.colorChange.emit(this.color);
  }
}
