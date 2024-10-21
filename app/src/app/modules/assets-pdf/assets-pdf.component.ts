import { Component, OnInit } from '@angular/core';
import { AssetUploadSectionComponent } from '../../shared/components/asset-upload-section/asset-upload-section.component';
import { Asset } from '../../shared/components/asset-upload-section/asset.model';
import { AssetService } from '../../core/api/v1';
import { ConfigurationFactory } from '../../core/factories/configuration.factory';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assets-pdf',
  standalone: true,
  imports: [AssetUploadSectionComponent, CommonModule],
  templateUrl: './assets-pdf.component.html',
})
export class AssetsPdfComponent implements OnInit {
  assets: Asset[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  constructor(
    private assetService: AssetService,
    private configuration: ConfigurationFactory
  ) {
    this.assetService.configuration = this.configuration.createConfiguration();
  }
  ngOnInit(): void {
    this.fetchAssets();
  }

  fetchAssets() {
    this.assetService.apiAssetGet().subscribe({
      next: (assets: Asset[]) => {
        this.assets = assets;
        this.isLoading = false;
      },

      error: (error: Response) => {
        this.isLoading = false;
        this.error = 'Error fetching assets. Please try again later.';
        console.error('Error fetching assets', error);
      },
    });
  }
}
