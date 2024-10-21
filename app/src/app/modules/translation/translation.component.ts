import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../core/api/v1';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigurationFactory } from '../../core/factories/configuration.factory';
import { PopupModalService } from '../../core/services/popup-modal.service';

export interface Translations {
  [key: string]: {
    [subKey: string]: string;
  };
}
export interface TranslationResponse {
  content: string;
}

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  templateUrl: './translation.component.html',
})
export class TranslationComponent implements OnInit {
  translations: Translations = {};
  leftKeys: string[] = [];
  rightKeys: string[] = [];
  selectedKey: string | null = null;
  selectedSubKey: string | null = null;
  loading: boolean = false;
  submitting: boolean = false;
  bodyCharCount: number = 0;
  accordionState: { [key: string]: boolean } = {};

  constructor(
    private translationService: TranslationService,
    private configurationFactory: ConfigurationFactory,
    private popupModalService: PopupModalService
  ) {
    translationService.configuration =
      this.configurationFactory.createConfiguration();
  }

  ngOnInit() {
    this.fetchTranslations();
  }

  fetchTranslations() {
    this.loading = true;
    const fileName = 'translations.json';
    this.translationService.apiTranslationGet(fileName).subscribe({
      next: (data: TranslationResponse) => {
        if (data && data.content) {
          const decodedContent = atob(data.content);
          this.translations = JSON.parse(decodedContent);
          this.splitKeys();
        } else {
          this.loadLocalFallback();
        }
        this.loading = false;
      },
      error: () => {
        this.loadLocalFallback();
        this.loading = false;
      },
    });
  }

  loadLocalFallback() {
    import('../../shared/sample-files/translations.json').then(module => {
      const string = JSON.stringify(module.default);
      this.translations = JSON.parse(string);
      this.splitKeys();
    });
  }

  splitKeys() {
    const allKeys = this.objectKeys(this.translations);
    const midIndex = Math.ceil(allKeys.length / 2);
    this.leftKeys = allKeys.slice(0, midIndex);
    this.rightKeys = allKeys.slice(midIndex);
  }

  selectKey(key: string, subKey: string) {
    this.selectedKey = key;
    this.selectedSubKey = subKey;
    this.bodyCharCount = this.translations[key][subKey]?.length || 0;
  }

  onBodyInput(key: string, subKey: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (key && subKey) {
      this.translations[key][subKey] = input.value;
      this.bodyCharCount = input.value.length;
    }
  }

  saveAllTranslations() {
    this.submitting = true;
    const jsonContent = JSON.stringify(this.translations);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const file = new File([blob], 'translations.json');
    const formData = new FormData();
    formData.append('file', blob, 'translations.json');

    this.translationService.apiTranslationPost(file as Blob).subscribe({
      next: () => {
        this.submitting = false;
      },
      error: error => {
        this.popupModalService.open(
          'error_modal',
          `${error.status}: ${error.statusText}`
        );
        this.submitting = false;
      },
    });
  }

  objectKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  toggleAccordion(key: string) {
    this.accordionState[key] = !this.accordionState[key];
  }
}
