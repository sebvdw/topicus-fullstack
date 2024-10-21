import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordResetService } from '../../core/api/v1';
import { ConfigurationFactory } from '../../core/factories/configuration.factory';
import { tap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  passwordsDoNotMatch = false;
  email: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private configurationFactory: ConfigurationFactory,
    private passwordService: PasswordResetService
  ) {
    this.passwordService.configuration =
      this.configurationFactory.createConfiguration();
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.email = params.get('user');
    });
  }

  onResetPassword() {
    if (this.resetPasswordForm.valid) {
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;
      const confirmPassword =
        this.resetPasswordForm.get('confirmPassword')?.value;

      if (newPassword !== confirmPassword) {
        this.passwordsDoNotMatch = true;
      } else {
        this.passwordsDoNotMatch = false;
        if (this.email) {
          this.passwordService
            .apiPasswordResetSetNewPasswordPut(this.email, newPassword)
            .pipe(
              tap(() => {
                this.router.navigate(['/login']);
              }),
              catchError(error => {
                console.error('Error resetting password', error);
                this.router.navigate(['/login']);
                return of(null);
              })
            )
            .subscribe();
        }
      }
    }
  }
}
