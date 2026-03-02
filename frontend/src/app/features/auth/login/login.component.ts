import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, RouterModule],
    template: `
  <div class="auth-container">
    <mat-card class="auth-card">
      <mat-card-header>
        <mat-card-title>Welcome to PayFlow</mat-card-title>
        <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" required>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" type="password" required>
          </mat-form-field>

          <div class="error-message" *ngIf="error">{{ error }}</div>

          <div class="actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="loginForm.invalid || loading" class="full-width log-btn">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">LOGIN</span>
            </button>
          </div>
          <div class="register-link">
            Don't have an account? <a routerLink="/register">Register here</a>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  </div>
  `,
    styles: [`
  .auth-container { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; }
  .auth-card { width: 100%; max-width: 400px; padding: 20px; box-sizing: border-box; }
  .full-width { width: 100%; margin-bottom: 15px; }
  .log-btn { height: 48px; font-size: 16px; margin-top: 10px; }
  .error-message { color: red; margin-bottom: 15px; text-align: center; }
  .register-link { margin-top: 20px; text-align: center; font-size: 14px; }
  mat-card-header { justify-content: center; margin-bottom: 20px; }
  mat-card-title { font-size: 24px; font-weight: bold; }
  `]
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    loading = false;
    error = '';

    onSubmit() {
        if (this.loginForm.invalid) return;

        this.loading = true;
        this.error = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                this.error = err.error?.error || 'Login failed. Please try again.';
            }
        });
    }
}
