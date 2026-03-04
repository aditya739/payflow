import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatSelectModule, RouterModule, MatIconModule],
  template: `
  <div class="auth-wrapper">
    <div class="brand">
      <mat-icon class="brand-icon">payments</mat-icon>
      <span class="brand-text">PayFlow</span>
    </div>

    <mat-card class="auth-card">
      <mat-card-header>
        <mat-card-title>Create an account</mat-card-title>
        <mat-card-subtitle>Start accepting payments today.</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <mat-label class="custom-label">Full Name</mat-label>
            <mat-form-field appearance="outline" class="full-width custom-field">
              <input matInput formControlName="name" placeholder="John Doe" required>
            </mat-form-field>
          </div>

          <div class="form-group">
            <mat-label class="custom-label">Email</mat-label>
            <mat-form-field appearance="outline" class="full-width custom-field">
              <input matInput formControlName="email" type="email" placeholder="john@example.com" required>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
            </mat-form-field>
          </div>
          
          <div class="form-group">
            <mat-label class="custom-label">Password</mat-label>
            <mat-form-field appearance="outline" class="full-width custom-field">
              <input matInput formControlName="password" type="password" placeholder="Create a password" required>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
            </mat-form-field>
          </div>

          <div class="form-group">
            <mat-label class="custom-label">Account Role</mat-label>
            <mat-form-field appearance="outline" class="full-width custom-field">
              <mat-select formControlName="role">
                <mat-option value="USER">Standard User</mat-option>
                <mat-option value="ADMIN">Administrator</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="error-message" *ngIf="error">
            <mat-icon>error_outline</mat-icon>
            <span>{{ error }}</span>
          </div>

          <div class="actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="registerForm.invalid || loading" class="full-width log-btn">
              <mat-spinner diameter="20" *ngIf="loading" class="btn-spinner"></mat-spinner>
              <span *ngIf="!loading">Create Account</span>
            </button>
          </div>
          <div class="register-link">
            Already have an account? <a routerLink="/login">Sign in</a>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  </div>
  `,
  styles: [`
  .auth-wrapper { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background-color: var(--bg-light); padding: 40px 20px; }
  .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; color: var(--primary-color); }
  .brand-icon { font-size: 32px; height: 32px; width: 32px; }
  .brand-text { font-size: 28px; font-weight: 700; font-family: 'Inter', sans-serif; letter-spacing: -0.5px; color: var(--text-main); }
  
  .auth-card { width: 100%; max-width: 420px; padding: 40px 32px; box-sizing: border-box; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.03); }
  mat-card-header { justify-content: flex-start; margin-bottom: 24px; padding: 0; display: block; }
  mat-card-title { font-size: 24px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; }
  mat-card-subtitle { font-size: 15px; color: var(--text-muted); }
  
  .form-group { margin-bottom: 16px; }
  .custom-label { display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px; }
  .full-width { width: 100%; }
  ::ng-deep .custom-field .mat-mdc-text-field-wrapper { padding: 0 !important; }
  ::ng-deep .custom-field .mdc-notched-outline__leading, ::ng-deep .custom-field .mdc-notched-outline__notch, ::ng-deep .custom-field .mdc-notched-outline__trailing { border-color: #d1d5db !important; }
  
  .log-btn { height: 48px; font-size: 16px; margin-top: 16px; font-weight: 600; }
  .btn-spinner { margin: 0 auto; }
  .error-message { display: flex; align-items: center; gap: 8px; color: #dc2626; background: #fef2f2; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 24px; }
  .error-message mat-icon { font-size: 20px; height: 20px; width: 20px; }
  .register-link { margin-top: 24px; text-align: center; font-size: 14px; color: var(--text-muted); }
  .register-link a { font-weight: 600; color: var(--primary-color); text-decoration: none; }
  .register-link a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['USER']
  });

  loading = false;
  error = '';

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        // Auto-login after registration
        this.authService.login({
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        }).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed. Please try again.';
      }
    });
  }
}
