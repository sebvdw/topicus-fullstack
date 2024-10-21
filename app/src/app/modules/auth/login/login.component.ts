import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store, select } from '@ngrx/store';
import { login, validateToken } from '../../../core/store/auth/auth.actions';
import { AuthState } from '../../../core/store/auth/auth.reducer';
import {
  selectAuthError,
  selectAuthToken,
} from '../../../core/store/auth/auth.selectors';
import { User } from '../../../core/api/v1';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoaderComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  waiting = false;

  constructor(
    private fb: FormBuilder,
    private store: Store<{ auth: AuthState }>,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLoginButtonClicked(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.waiting = true;

    const user: User = {
      email: this.loginForm.value.email,
      hashPassword: this.loginForm.value.password,
    };

    this.store.dispatch(login({ user }));
  }

  ngOnInit() {
    this.store.dispatch(validateToken());
    this.store.pipe(select(selectAuthToken)).subscribe(token => {
      if (token) {
        this.waiting = false;
        this.router.navigate(['/home']);
      }
    });
    this.store.pipe(select(selectAuthError)).subscribe(error => {
      if (error) {
        this.waiting = false;
        this.errorMessage = error;
      }
    });
  }
}
