import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { PreviewModalComponent } from '../asset-preview-modal/asset-preview-modal.component';
import { AssetService } from '../../../core/api/v1';
import { Asset } from './asset.model';
import { BehaviorSubject } from 'rxjs';
import { DialogService } from '../../../core/services/dialog.service';
import { ConfigurationFactory } from '../../../core/factories/configuration.factory';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-asset-upload-section',
  standalone: true,
  imports: [
    ButtonComponent,
    FontAwesomeModule,
    CommonModule,
    PreviewModalComponent,
  ],
  templateUrl: './asset-upload-section.component.html',
})
export class AssetUploadSectionComponent implements OnInit, OnChanges {
  @Input() assetType!: string;
  @Input() assetHeight!: number;
  @Input() assetWidth!: number;
  @Input() assets: Asset[] = [];
  @Input() isLoading: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  filename: string | undefined;
  assetFile!: File;
  isUploading: boolean = false;
  isUploaded: boolean = false;
  uploadedAssetUrl: string = '';
  selectedAssetUrl: string = '';
  private isPreviewModalVisibleSubject = new BehaviorSubject<boolean>(false);
  isPreviewModalVisible$ = this.isPreviewModalVisibleSubject.asObservable();
  isDragging: boolean = false;

  constructor(
    private assetService: AssetService,
    private dialogService: DialogService,
    private configuration: ConfigurationFactory,
    private toastService: ToastService
  ) {
    this.assetService.configuration = this.configuration.createConfiguration();
  }

  ngOnInit(): void {
    this.filename = this.assetType.toLowerCase().replace(' ', '-');
    this.filterAssetsByType();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assets'] && !changes['assets'].firstChange) {
      this.filterAssetsByType();
    }
  }

  normalizeAssetType(assetType: string): string {
    return assetType.toLowerCase().replace(/[- ]/g, '-');
  }

  filterAssetsByType() {
    if (this.isLoading) return;

    const normalizedAssetType = this.normalizeAssetType(this.assetType);

    const matchingAsset = this.assets.find(asset =>
      this.normalizeAssetType(asset.name).includes(normalizedAssetType)
    );

    if (matchingAsset && matchingAsset.content) {
      this.uploadedAssetUrl = matchingAsset.content;
      this.isUploaded = true;
    }
  }

  fileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];
      const fileNameWithExtension =
        this.filename + '.' + file.type.split('/').pop();
      const renamedFile = this.renameFile(file, fileNameWithExtension);

      if (renamedFile.type === 'image/png') {
        this.checkPngDimensions(renamedFile);
      } else if (renamedFile.type === 'image/svg+xml') {
        this.checkSvgDimensions(renamedFile);
      }
    }
  }

  checkPngDimensions(file: File) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const target = e.target as FileReader;
      if (target && target.result) {
        img.src = target.result as string;
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          this.assetFile = file;
          if (
            this.assetWidth &&
            this.assetHeight &&
            (width !== this.assetWidth || height !== this.assetHeight)
          ) {
            this.dialogService.openDialog(
              this.assetType,
              this.assetWidth,
              this.assetHeight,
              this.assetFile,
              (resizedAsset: File) => this.handleResizedAsset(resizedAsset)
            );
          } else {
            this.setSelectedAssetUrl(file);
            this.uploadFile();
          }
          this.resetFileInput();
        };
      }
    };
    reader.readAsDataURL(file);
  }

  handleResizedAsset(resizedAsset: File) {
    this.assetFile = resizedAsset;
    this.setSelectedAssetUrl(resizedAsset);
  }

  checkSvgDimensions(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const target = e.target as FileReader;
      if (target && target.result) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(
          target.result as string,
          'image/svg+xml'
        );
        const svgElement = svgDoc.documentElement as unknown as SVGElement;

        const width = parseInt(svgElement.getAttribute('width') || '0', 10);
        const height = parseInt(svgElement.getAttribute('height') || '0', 10);

        this.assetFile = file;

        if (
          this.assetWidth &&
          this.assetHeight &&
          (width !== this.assetWidth || height !== this.assetHeight)
        ) {
          this.resizeSvg(svgElement, this.assetWidth, this.assetHeight);
        } else {
          this.uploadFile();
        }
      }
    };
    reader.readAsText(file);
  }

  resizeSvg(svgElement: SVGElement, targetWidth: number, targetHeight: number) {
    svgElement.setAttribute('width', targetWidth.toString());
    svgElement.setAttribute('height', targetHeight.toString());

    const serializer = new XMLSerializer();
    const resizedSvgContent = serializer.serializeToString(svgElement);

    const blob = new Blob([resizedSvgContent], { type: 'image/svg+xml' });
    const fileNameWithExtension = this.filename + '.svg';
    this.assetFile = new File([blob], fileNameWithExtension, {
      type: 'image/svg+xml',
    });
    this.setSelectedAssetUrl(this.assetFile);
  }

  uploadFile() {
    if (!this.assetFile || !this.assetFile.name) {
      this.toastService.showToast(
        'error',
        'No file selected. Please select a file to upload.'
      );
      return;
    }

    if (this.assetFile.size > 500 * 1024) {
      this.toastService.showToast('error', 'File size exceeds 500KB');
      return;
    }

    this.isUploading = true;
    const uploadedAsset$ = this.assetService.apiAssetPost(this.assetFile);

    uploadedAsset$.subscribe({
      next: () => {
        this.isUploading = false;
        this.toastService.showToast(
          'success',
          `Uploaded ${this.filename} successfully`
        );
        this.setUploadedAssetUrl(this.assetFile);

        this.resetFileInput();
        this.isUploaded = true;
        this.assetFile = new File([], '');
        this.selectedAssetUrl = '';
      },
      error: (error: Response) => {
        this.isUploading = false;
        this.toastService.showToast(
          'error',
          `Uploading ${this.filename} went wrong: ${error.status}`
        );
      },
    });
  }

  setUploadedAssetUrl(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const target = e.target as FileReader;
      if (target && target.result) {
        this.uploadedAssetUrl = target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }
  setSelectedAssetUrl(file: File) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const target = e.target as FileReader;
      if (target && target.result) {
        this.selectedAssetUrl = target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  private renameFile(file: File, newName: string): File {
    return new File([file], newName, { type: file.type });
  }

  private resetFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file: File = event.dataTransfer.files[0];
      const fileNameWithExtension =
        this.filename + '.' + file.type.split('/').pop();
      const renamedFile = this.renameFile(file, fileNameWithExtension);

      if (renamedFile.type === 'image/png') {
        this.checkPngDimensions(renamedFile);
      } else if (renamedFile.type === 'image/svg+xml') {
        this.checkSvgDimensions(renamedFile);
      }

      event.dataTransfer.clearData();
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  openPreviewModal() {
    this.isPreviewModalVisibleSubject.next(true);
  }

  closePreviewModal() {
    this.isPreviewModalVisibleSubject.next(false);
  }
}
