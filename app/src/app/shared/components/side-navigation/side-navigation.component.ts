import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { logout } from '../../../core/store/auth/auth.actions';
import { AuthState } from '../../../core/store/auth/auth.reducer';

@Component({
  selector: 'app-side-navigation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './side-navigation.component.html',
  styleUrls: ['./side-navigation.component.scss'],
})
export class SideNavigationComponent {
  closed = false;
  assetsDropdownOpen = false;
  translationsDropdownOpen = false;

  constructor(private store: Store<{ auth: AuthState }>) {}

  public toggleSideNav() {
    this.closed = !this.closed;
  }

  public onLogoutButtonClicked() {
    this.store.dispatch(logout());
  }
}
