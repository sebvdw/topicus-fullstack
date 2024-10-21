import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() {}

  showToast(type: 'success' | 'error', message: string) {
    const toast = document.createElement('div');
    toast.className = `toast fixed top-4 right-4 z-50`;
    const alertTypeClass = type === 'success' ? 'alert-success' : 'alert-error';
    toast.innerHTML = `
      <div class="alert ${alertTypeClass} shadow-lg">
        <div>
          <span>${message}</span>
        </div>
      </div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}
