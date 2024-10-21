import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  createComponent,
} from '@angular/core';
import { ResizingDialogComponent } from '../../shared/components/resizing-dialog/resizing-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private componentRef!: ComponentRef<ResizingDialogComponent>;

  constructor(private appRef: ApplicationRef) {}

  openDialog(
    title: string,
    requiredWidth: number,
    requiredHeight: number,
    file: File,
    callback: (resizedAsset: File) => void
  ) {
    if (this.componentRef) {
      this.closeDialog();
    }

    this.componentRef = createComponent(ResizingDialogComponent, {
      environmentInjector: this.appRef.injector,
    });

    this.componentRef.instance.title = title;
    this.componentRef.instance.requiredWidth = requiredWidth;
    this.componentRef.instance.requiredHeight = requiredHeight;
    this.componentRef.instance.file = file;
    this.componentRef.instance.dialogClose.subscribe(() => {
      this.closeDialog();
    });
    this.componentRef.instance.resized.subscribe((resizedAsset: File) => {
      callback(resizedAsset);
    });

    this.appRef.attachView(this.componentRef.hostView);
    const domElem = (
      this.componentRef.hostView as unknown as { rootNodes: HTMLElement[] }
    ).rootNodes[0];
    document.body.appendChild(domElem);

    this.componentRef.instance.onOpen();
  }

  closeDialog() {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null!;
    }
  }
}
