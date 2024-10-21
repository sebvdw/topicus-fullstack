import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preview-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-preview-modal.component.html',
})
export class PreviewModalComponent {
  @Input() imageUrl!: string;
  @Input() isVisible!: boolean;
  @Output() previewClose = new EventEmitter<void>();

  closeModal() {
    this.previewClose.emit();
  }
}
