import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PasswordResetService } from '../../core/api/v1';
import { ConfigurationFactory } from '../../core/factories/configuration.factory';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(
    private passwordService: PasswordResetService,
    private configurationFactory: ConfigurationFactory,
    private router: Router
  ) {
    this.passwordService.configuration =
      this.configurationFactory.createConfiguration();
  }

  onResetPassword() {
    this.passwordService.apiPasswordResetSendEmailPost(this.email).subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Error sending password reset email', error);
      }
    );
  }
}
