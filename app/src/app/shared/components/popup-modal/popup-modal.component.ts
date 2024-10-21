import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { PopupModalService } from '../../../core/services/popup-modal.service';

@Component({
  selector: 'app-popup-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './popup-modal.component.html',
})
export class PopupModalComponent implements OnInit, OnDestroy {
  @ViewChild('dialogElement') dialogTag!: ElementRef<HTMLDialogElement>;
  @Input() id?: string;
  @Input() heading: string = 'Error';
  message: string = 'Something went wrong';
  isOpen = false;

  constructor(private popupModalService: PopupModalService) {}

  ngOnInit(): void {
    this.popupModalService.add(this);
  }

  ngOnDestroy(): void {
    this.popupModalService.remove(this);
  }

  open(message?: string): void {
    if (message) {
      this.message = message;
    }
    this.isOpen = true;
    this.dialogTag.nativeElement.showModal();
  }

  close(): void {
    this.isOpen = false;
    this.dialogTag.nativeElement.close();
  }
}
