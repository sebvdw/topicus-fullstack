import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { ThemeInput, ThemeService } from '../../core/api/v1';
import { ConfigurationFactory } from '../../core/factories/configuration.factory';
import { ColorPickerComponent } from '../../shared/components/color-picker/color-picker.component';
import { DropdownSelectComponent } from '../../shared/components/dropdown-select/dropdown-select.component';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { PopupModalService } from '../../core/services/popup-modal.service';
import { ThemeResponse } from '../../core/models/theme-response.model';
import { ThemeFileService } from '../../core/services/theme-file.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [
    ButtonComponent,
    FormsModule,
    NgForOf,
    NgIf,
    ColorPickerComponent,
    DropdownSelectComponent,
    LoaderComponent,
  ],
  templateUrl: './theme.component.html',
})
export class ThemeComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private configurationFactory: ConfigurationFactory,
    private popupModalService: PopupModalService,
    private toastService: ToastService
  ) {
    this.themeService.configuration =
      this.configurationFactory.createConfiguration();
  }

  ngOnInit(): void {
    this.loadingWebTheme = true;
    this.fetchTheme();
  }

  webTheme: ThemeInput = {
    primaryColor: '#000000',
    secondaryColor: '#000000',
    fontName: null,
  };
  webFileName: string = 'themeWeb.css';
  fontsArray: string[] = ['Helvetica', 'Arial', 'Times New Roman'];
  loadingWebTheme: boolean = true;
  submittingWebTheme: boolean = false;

  submitTheme() {
    this.submittingWebTheme = true;
    const upload$: Observable<File> = this.themeService.apiThemeCssPost(
      ThemeFileService.createCSSThemeFile(this.webTheme, this.webFileName)
    );
    if (ThemeFileService.correctHexCode(this.webTheme)) {
      upload$.subscribe({
        next: () => {
          this.submittingWebTheme = false;
          this.toastService.showToast('success', 'Updated theme successfully');
        },
        error: (error: Response) => {
          this.submittingWebTheme = false;
          this.popupModalService.open(
            'error_modal',
            `Uploading theme did not succeed: ${error.status}`
          );
        },
      });
    } else {
      this.submittingWebTheme = false;
      this.popupModalService.open(
        'error_modal',
        `${this.webTheme.primaryColor} or ${this.webTheme.secondaryColor} is not a valid hex code.`
      );
    }
  }

  fetchTheme() {
    this.themeService.apiThemeCssGet(this.webFileName).subscribe({
      next: (data: ThemeResponse) => {
        if (data) {
          this.webTheme = ThemeFileService.getThemeInputJsonStyle(data);
        }
      },
      error: (error: Response) => {
        this.popupModalService.open(
          'error_modal',
          `Fetching theme went wrong: ${error.status}`
        );
      },
    });
    this.loadingWebTheme = false;
  }
}
