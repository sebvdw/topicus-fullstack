import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { SideNavigationComponent } from './shared/components/side-navigation/side-navigation.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { validateToken } from './core/store/auth/auth.actions';
import { RouterLink } from '@angular/router';
import { PopupModalComponent } from './shared/components/popup-modal/popup-modal.component';
@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styles: [],
  imports: [
    RouterOutlet,
    SideNavigationComponent,
    CommonModule,
    RouterLink,
    PopupModalComponent,
  ],
})
export class AppComponent implements OnInit {
  showNavigationBar: boolean = false;

  constructor(
    private router: Router,
    private store: Store
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const basePath = event.url.split('?')[0];
        const skipRoutes = [
          '/login',
          '/forgot-password',
          '/password-reset',
          '/',
        ];
        this.showNavigationBar = !skipRoutes.includes(event.url);
        this.showNavigationBar = !skipRoutes.includes(basePath);
      }
    });
  }
  ngOnInit(): void {
    const currentUrl = this.router.url;
    const skipRoutes = ['/forgot-password', '/password-reset', '/'];
    if (!skipRoutes.includes(currentUrl)) {
      this.store.dispatch(validateToken());
    }
  }
}
