import { Injectable } from '@angular/core';
import pica from 'pica';

@Injectable({
  providedIn: 'root',
})
export class ImageResizerService {
  private picaInstance: pica.Pica;

  constructor() {
    this.picaInstance = pica();
  }

  resizeImage(
    file: File,
    targetWidth: number,
    targetHeight: number
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCanvas.width = img.width;
        offscreenCanvas.height = img.height;

        if (offscreenCtx) {
          offscreenCtx.drawImage(img, 0, 0);
        }

        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = targetWidth;
        outputCanvas.height = targetHeight;

        try {
          await this.picaInstance.resize(offscreenCanvas, outputCanvas, {
            quality: 3,
          });
          outputCanvas.toBlob(blob => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject(new Error('Canvas is empty'));
            }
          }, file.type);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  }
}
