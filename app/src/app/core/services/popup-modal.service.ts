import { Injectable } from '@angular/core';
import { PopupModalComponent } from '../../shared/components/popup-modal/popup-modal.component';

@Injectable({ providedIn: 'root' })
export class PopupModalService {
  private popupModals: PopupModalComponent[] = [];

  add(popupModal: PopupModalComponent) {
    if (!popupModal.id || this.popupModals.find(m => m.id === popupModal.id)) {
      throw new Error('Alert modal already exists!');
    }

    this.popupModals.push(popupModal);
  }

  remove(popupModal: PopupModalComponent) {
    this.popupModals = this.popupModals.filter(m => m.id !== popupModal.id);
  }

  open(id: string, message?: string): void {
    const popupModal = this.popupModals.find(m => m.id === id);

    if (!popupModal) {
      throw new Error(`Modal id:${id} not found`);
    }

    popupModal.open(message);
  }

  close() {
    const popUpModal = this.popupModals.find(m => m.isOpen);
    popUpModal?.close();
  }
}
