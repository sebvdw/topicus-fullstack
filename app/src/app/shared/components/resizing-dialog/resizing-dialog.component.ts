import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { ImageResizerService } from '../../../core/services/image-resizer.service';

@Component({
  selector: 'app-resizing-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './resizing-dialog.component.html',
  styleUrls: ['./resizing-dialog.component.scss'],
})
export class ResizingDialogComponent implements AfterViewInit {
  @Input() title!: string;
  @Input() requiredWidth!: number;
  @Input() requiredHeight!: number;
  @Input() file!: File;
  @Output() dialogClose = new EventEmitter<void>();
  @Output() resized = new EventEmitter<File>();
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageContainer') imageContainer!: ElementRef<HTMLDivElement>;

  private resizedFile?: File;
  private context!: CanvasRenderingContext2D;
  private img = new Image();
  private zoomLevel = 1;
  private panX = 0;
  private panY = 0;
  private startX = 0;
  private startY = 0;
  private isPanning = false;

  constructor(private imageResizerService: ImageResizerService) {}

  ngAfterViewInit() {
    if (!this.dialog) {
      return;
    }
    this.dialog.nativeElement.showModal();
    this.context = this.canvas.nativeElement.getContext('2d')!;
    this.loadImage();
  }

  private loadImage() {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && e.target.result) {
        this.img.src = e.target.result as string;
        this.img.onload = () => {
          this.drawCanvas();
        };
      }
    };
    reader.readAsDataURL(this.file);
  }

  private drawCanvas() {
    const canvas = this.canvas.nativeElement;
    canvas.width = this.img.width;
    canvas.height = this.img.height;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.context.drawImage(this.img, 0, 0, canvas.width, canvas.height);
    this.drawExpectedBox();
  }

  private drawExpectedBox() {
    this.context.strokeStyle = 'red';
    this.context.lineWidth = 2;
    this.context.setLineDash([5, 5]);
    this.context.strokeRect(
      (this.canvas.nativeElement.width - this.requiredWidth) / 2,
      (this.canvas.nativeElement.height - this.requiredHeight) / 2,
      this.requiredWidth,
      this.requiredHeight
    );
  }

  zoomIn() {
    this.zoomLevel *= 1.1;
    this.applyTransform();
  }

  zoomOut() {
    this.zoomLevel /= 1.1;
    this.applyTransform();
  }

  applyTransform() {
    this.canvas.nativeElement.style.transform = `scale(${this.zoomLevel}) translate(${this.panX}px, ${this.panY}px)`;
  }

  onMouseDown(event: MouseEvent) {
    this.startX = event.clientX - this.panX;
    this.startY = event.clientY - this.panY;
    this.isPanning = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!this.isPanning) return;
      this.panX = (moveEvent.clientX - this.startX) / this.zoomLevel;
      this.panY = (moveEvent.clientY - this.startY) / this.zoomLevel;
      this.applyTransform();
    };

    const onMouseUp = () => {
      this.isPanning = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  onClose() {
    if (this.dialog) {
      this.dialog.nativeElement.close();
      this.dialogClose.emit();
    }
  }

  onOpen() {
    if (this.dialog) {
      this.dialog.nativeElement.showModal();
    }
  }

  async onResize() {
    this.resizedFile = await this.imageResizerService.resizeImage(
      this.file,
      this.requiredWidth,
      this.requiredHeight
    );

    this.displayResizedImage(this.resizedFile);
  }

  private displayResizedImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const target = e.target as FileReader;
      if (target && target.result) {
        const resizedImage = new Image();
        resizedImage.src = target.result as string;
        resizedImage.onload = () => {
          const canvas = this.canvas.nativeElement;
          canvas.width = this.requiredWidth;
          canvas.height = this.requiredHeight;
          this.context.clearRect(0, 0, canvas.width, canvas.height);
          this.context.drawImage(
            resizedImage,
            0,
            0,
            canvas.width,
            canvas.height
          );
          this.drawExpectedBox();
        };
      }
    };
    reader.readAsDataURL(file);
  }

  onSave() {
    if (!this.resizedFile) {
      return;
    }
    this.resized.emit(this.resizedFile!);
    this.onClose();
  }
}
