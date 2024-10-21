import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { TranslationComponent } from './modules/translation/translation.component';
import { TranslationPDFComponent } from './modules/translation-pdf/translation-pdf.component';
import { PageNotFoundComponent } from './modules/page-not-found/page-not-found.component';
import { AssetsWebComponent } from './modules/assets-web/assets-web.component';
import { authGuard } from './core/guards/auth.guard';
import { ThemeComponent } from './modules/theme/theme.component';
import { HomePageComponent } from './modules/home-page/home-page.component';
import { ForgotPasswordComponent } from './modules/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './modules/reset-password/reset-password.component';
import { AssetsPdfComponent } from './modules/assets-pdf/assets-pdf.component';
import { ThemePDFComponent } from './modules/theme-pdf/theme-pdf.component';
import { ExampleComponent } from './modules/example/example.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // DONT FREAKING REMOVE IT, COMMENT IT OUT IF YOU WANT TO DISABLE IT OR ELSE
  // I WILL MAKE THE ENTIRE APP DEPEND ON THIS ROUTE
  {
    path: 'example',
    component: ExampleComponent,
    canActivate: [authGuard],
  },

  {
    path: 'assets-web',
    component: AssetsWebComponent,
    canActivate: [authGuard],
  },
  {
    path: 'assets-pdf',
    component: AssetsPdfComponent,
    canActivate: [authGuard],
  },
  {
    path: 'home',
    component: HomePageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'translate',
    component: TranslationComponent,
    canActivate: [authGuard],
  },
  {
    path: 'translatepdf',
    component: TranslationPDFComponent,
    canActivate: [authGuard],
  },
  {
    path: 'theme',
    component: ThemeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'theme-pdf',
    component: ThemePDFComponent,
    canActivate: [authGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'password-reset',
    component: ResetPasswordComponent,
  },
  { path: '**', component: PageNotFoundComponent },
];
