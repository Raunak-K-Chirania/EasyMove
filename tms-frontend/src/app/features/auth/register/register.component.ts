import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FirebaseStorageService } from '../../../core/services/firebase-storage.service';
import { FirebaseAuthService } from '../../../core/services/firebase-auth.service';
import { MessagingService } from '../../../core/services/messaging.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';
  loading = false;
  success = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private firebaseStorageService = inject(FirebaseStorageService);
  private firebaseAuthService = inject(FirebaseAuthService);
  private messagingService = inject(MessagingService);
  private router = inject(Router);

  isOtpStep = false;
  otp = '';
  otpSent = false;
  otpError = '';
  selectedFile: File | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['CUSTOMER', Validators.required]
    });
  }

  sendOtp() {
    if (this.registerForm.get('email')?.invalid) {
      this.error = 'Please enter a valid email first.';
      return;
    }
    this.loading = true;
    this.authService.sendOtp(this.registerForm.value.email).subscribe({
      next: () => {
        this.isOtpStep = true;
        this.otpSent = true;
        this.loading = false;
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to send OTP. Please try again.';
        this.loading = false;
      }
    });
  }

  verifyOtp() {
    if (!this.otp || this.otp.length !== 6) {
      this.otpError = 'Enter a valid 6-digit OTP.';
      return;
    }
    this.loading = true;
    this.authService.verifyOtp(this.registerForm.value.email, this.otp).subscribe({
      next: () => {
        this.onSubmit(); // Proceed to actual registration
      },
      error: () => {
        this.otpError = 'Invalid OTP. Please check and try again.';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.error = '';

    const { name, email, password } = this.registerForm.value;

    try {
      // 1. Firebase Auth Registration
      const user = await this.firebaseAuthService.completeRegistration(email, password, name);

      // 2. Backend Registration (Syncing with MySQL)
      const registerData = {
        ...this.registerForm.value,
        role: 'CUSTOMER',
        profileImageUrl: ''
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          // 4. Requesting push permission for FCM
          this.messagingService.requestPermission();

          this.success = true;
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err: any) => {
          this.error = 'Backend registration failed. Account created in Firebase but not in MySQL.';
          this.loading = false;
        }
      });

    } catch (firebaseErr: any) {
      this.error = firebaseErr.message || 'Firebase registration failed';
      this.loading = false;
    }
  }
}
