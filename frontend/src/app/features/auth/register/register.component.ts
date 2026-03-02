import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatSelectModule, RouterModule],
    template: `
  <div class="auth-container">
    <mat-card class="auth-card">
      <mat-card-header>
        <mat-card-title>Join PayFlow</mat-card-title>
        <mat-card-subtitle>Create your account</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" required>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" type="password" required>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="USER">User (Standard)</mat-option>
              <mat-option value="ADMIN">Admin</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="error-message" *ngIf="error">{{ error }}</div>

          <div class="actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="registerForm.invalid || loading" class="full-width log-btn">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">REGISTER</span>
            </button>
          </div>
          <div class="register-link">
            Already have an account? <a routerLink="/login">Login here</a>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  </div>
  `,
    styles: [`
  .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f5f5f5; padding: 20px; }
  .auth-card { width: 100%; max-width: 400px; padding: 20px; box-sizing: border-box; }
  .full-width { width: 100%; margin-bottom: 10px; }
  .log-btn { height: 48px; font-size: 16px; margin-top: 10px; }
  .error-message { color: red; margin-bottom: 15px; text-align: center; }
  .register-link { margin-top: 20px; text-align: center; font-size: 14px; }
  mat-card-header { justify-content: center; margin-bottom: 20px; }
  mat-card-title { font-size: 24px; font-weight: bold; }
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
