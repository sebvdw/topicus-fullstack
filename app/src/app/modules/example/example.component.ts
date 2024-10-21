/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { AssetService, ExampleService } from '../../core/api/v1';
import { ConfigurationFactory } from '../../core/factories/configuration.factory';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgFor, NgIf, LoaderComponent],
  templateUrl: './example.component.html',
})
export class ExampleComponent implements OnInit {
  constructor(
    private exampleService: ExampleService,
    private assetService: AssetService,
    private configurationFactory: ConfigurationFactory
  ) {
    exampleService.configuration =
      this.configurationFactory.createConfiguration();
    assetService.configuration =
      this.configurationFactory.createConfiguration();
  }
  status: 'waiting...' | 'uploading' | 'success' | 'fail' = 'waiting...'; // Variable to store file status
  file: File | null | Blob = null; // Variable to store file
  files: File[] = []; // Variable to store files
  images: any[] = [];
  testResponse: Promise<unknown> | undefined;
  loading: boolean = false;
  loadingImages: boolean = false;
  ngOnInit(): void {
    this.onRefresh();
  }
  onTest() {
    //   this.exampleService.apiExampleGet().subscribe( => {
    //   });
  }

  onUpload() {
    const upload$ = this.assetService.apiAssetPost(this.file as Blob);

    this.status = 'uploading';

    upload$.subscribe({
      next: () => {
        this.status = 'success';
        this.onRefresh();
        setTimeout(() => {
          this.status = 'waiting...';
        });
      },
      error: (error: Response) => {
        this.status = 'fail';
        return new Error(error.statusText);
      },
    });
  }

  onRefresh() {
    this.getAssets();
    this.getImages();
  }

  getImages() {
    this.loadingImages = true;
    this.exampleService.apiExampleImagesGet().subscribe((images: any) => {
      this.images = images;
      this.loadingImages = false;
    });
  }

  getAssets() {
    this.loading = true;
    this.assetService.apiAssetGet(true).subscribe((files: Array<File>) => {
      this.files = files;
      this.loading = false;
    });
  }

  onChange(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input && input.files && input.files.length > 0) {
      const file: File = input.files[0];
      this.file = file;
    }
  }
}
