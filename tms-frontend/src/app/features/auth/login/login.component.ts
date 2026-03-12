import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  loading = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        if (user.role === 'ADMIN' || user.role === 'MANAGER') {
          this.router.navigate(['/admin']);
        } else if (user.role === 'DRIVER') {
          this.router.navigate(['/driver']);
        } else {
          this.router.navigate(['/customer']);
        }
      },
      error: (err) => {
        this.error = 'Invalid email or password';
        this.loading = false;
      }
    });
  }

  loginWithGoogle() {
    this.loading = true;
    this.error = '';

    this.authService.loginWithGoogle().subscribe({
      next: (user) => {
        if (user.role === 'ADMIN' || user.role === 'MANAGER') {
          this.router.navigate(['/admin']);
        } else if (user.role === 'DRIVER') {
          this.router.navigate(['/driver']);
        } else {
          this.router.navigate(['/customer']);
        }
      },
      error: (err) => {
        this.error = 'Google Sign-In failed';
        this.loading = false;
      }
    });
  }
}
