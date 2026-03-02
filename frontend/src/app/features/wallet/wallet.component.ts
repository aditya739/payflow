import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { WalletService } from '../../core/services/wallet.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule, RouterModule],
  template: `
  <div class="page-container">
    <div class="header">
      <button mat-icon-button routerLink="/dashboard"><mat-icon>arrow_back</mat-icon></button>
      <h2>Add Funds to Wallet</h2>
    </div>

    <mat-card class="form-card">
      <mat-card-header>
        <mat-card-title>Deposit Money</mat-card-title>
        <mat-card-subtitle>Funds will be added instantly</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="depositForm" (ngSubmit)="onSubmit()">
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Amount ($)</mat-label>
            <input matInput formControlName="amount" type="number" step="0.01" min="1" required>
            <mat-error *ngIf="depositForm.get('amount')?.hasError('min')">Minimum amount is $1</mat-error>
          </mat-form-field>

          <div class="quick-amounts">
            <button type="button" mat-stroked-button (click)="setAmount(10)">$10</button>
            <button type="button" mat-stroked-button (click)="setAmount(50)">$50</button>
            <button type="button" mat-stroked-button (click)="setAmount(100)">$100</button>
            <button type="button" mat-stroked-button (click)="setAmount(500)">$500</button>
          </div>

          <div class="actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="depositForm.invalid || loading" class="full-width submit-btn">
              {{ loading ? 'PROCESSING...' : 'ADD FUNDS' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  </div>
  `,
  styles: [`
  .page-container { padding: 32px; max-width: 600px; margin: 0 auto; }
  .header { display: flex; align-items: center; margin-bottom: 24px; gap: 16px; }
  .header h2 { margin: 0; font-weight: 600; font-size: 24px; color: #333; }
  .form-card { padding: 24px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
  .full-width { width: 100%; margin-bottom: 8px; }
  .quick-amounts { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .submit-btn { height: 48px; font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
  mat-card-title { font-size: 20px; font-weight: 600; color: #1e293b; }
  `]
})
export class WalletComponent {
  private fb = inject(FormBuilder);
  private walletService = inject(WalletService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  depositForm: FormGroup = this.fb.group({
    amount: ['', [Validators.required, Validators.min(1)]]
  });

  loading = false;

  setAmount(amt: number) {
    this.depositForm.patchValue({ amount: amt });
  }

  onSubmit() {
    if (this.depositForm.invalid) return;

    this.loading = true;
    const amount = this.depositForm.value.amount;

    this.walletService.addMoney(amount).subscribe({
      next: (res) => {
        this.loading = false;
        this.snackBar.open(`Successfully added $${amount} to your wallet!`, 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.error || 'Failed to add funds.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
