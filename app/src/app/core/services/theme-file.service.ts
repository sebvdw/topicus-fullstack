import { Injectable } from '@angular/core';
import { ThemeInput } from '../api/v1';
import { ThemeResponse } from '../models/theme-response.model';

@Injectable({ providedIn: 'root' })
export class ThemeFileService {
  static regExpHexCode: RegExp = new RegExp('^#[0-9A-Fa-f]{6}$');

  static correctHexCode(themeInput: ThemeInput): boolean {
    return (
      this.regExpHexCode.test(<string>themeInput.secondaryColor) &&
      this.regExpHexCode.test(<string>themeInput.primaryColor)
    );
  }

  static createCSSThemeFile(input: ThemeInput, fileName: string): File {
    const stringify = JSON.stringify(input).replace(/"/g, '');
    const stringWithoutRoot = stringify
      .replace(/{/, '{--')
      .replace(/,/g, ';--');
    const jsonFileString = ':root' + stringWithoutRoot;
    const blob: Blob = new Blob([jsonFileString], { type: 'text/plain' });
    return new File([blob], `${fileName}`);
  }

  static getThemeInputJsonStyle(themeResponse: ThemeResponse): ThemeInput {
    const fileString: string = atob(themeResponse.content);
    const jsonString: string = fileString
      .replace(':root', '')
      .replace(/--/g, '"')
      .replace(/:/g, '":"')
      .replace(/;/g, '",')
      .replace(/}/, '"}');
    return JSON.parse(jsonString);
  }
}
