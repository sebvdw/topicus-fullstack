import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  styles: [
    `
      .container {
        @apply mx-auto max-w-7xl p-8;
      }
      .features {
        @apply flex flex-col items-center lg:items-start;
      }
      .image {
        @apply flex justify-center lg:justify-end;
      }
    `,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {}
