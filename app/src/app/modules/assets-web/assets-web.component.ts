import { Component, OnInit } from '@angular/core';
import { AssetUploadSectionComponent } from '../../shared/components/asset-upload-section/asset-upload-section.component';
import { AssetService } from '../../core/api/v1';
import { ConfigurationFactory } from '../../core/factories/configuration.factory';
import { Asset } from '../../shared/components/asset-upload-section/asset.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assets-web',
  standalone: true,
  imports: [AssetUploadSectionComponent, CommonModule],
  templateUrl: './assets-web.component.html',
})
export class AssetsWebComponent implements OnInit {
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
