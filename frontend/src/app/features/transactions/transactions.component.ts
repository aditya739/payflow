import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatTableModule, MatPaginatorModule, MatIconModule, MatTabsModule, RouterModule],
  template: `
  <div class="page-container">
    <div class="header">
      <button mat-icon-button routerLink="/dashboard"><mat-icon>arrow_back</mat-icon></button>
      <h2>Transactions</h2>
    </div>

    <mat-tab-group animationDuration="0ms">
      <mat-tab label="Send Money">
        <div class="tab-content">
          <mat-card class="form-card">
            <mat-card-header>
              <mat-card-title>Transfer Funds</mat-card-title>
              <mat-card-subtitle>Send money instantly to anyone</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="transferForm" (ngSubmit)="onTransfer()">
                
                <mat-form-field appearance="outline" class="full-width mt-3">
                  <mat-label>Receiver UUID</mat-label>
                  <input matInput formControlName="receiverId" required placeholder="e.g. 123e4567-e89b-12d3...">
                  <mat-icon matSuffix color="placeholder">person</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Amount ($)</mat-label>
                  <input matInput formControlName="amount" type="number" step="0.01" min="1" required>
                  <mat-icon matSuffix color="placeholder">attach_money</mat-icon>
                </mat-form-field>

                <div class="actions mt-4">
                  <button mat-flat-button color="primary" type="submit" [disabled]="transferForm.invalid || loading" class="full-width submit-btn">
                    {{ loading ? 'SENDING...' : 'SEND MONEY' }}
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-tab>
      
      <mat-tab label="History">
        <div class="tab-content">
          <mat-card class="form-card">
            <table mat-table [dataSource]="transactions">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef> Date </th>
                <td mat-cell *matCellDef="let tx"> {{tx.created_at | date:'MMM d, y, h:mm a'}} </td>
              </ng-container>

              <ng-container matColumnDef="details">
                <th mat-header-cell *matHeaderCellDef> Details </th>
                <td mat-cell *matCellDef="let tx"> 
                  <span class="tx-id">ID: {{ tx.id.substring(0,8) }}...</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef> Flow </th>
                <td mat-cell *matCellDef="let tx"> 
                  <span [class]="getTxType(tx) === 'CREDIT' ? 'credit-badge' : 'debit-badge'">
                    {{ getTxType(tx) }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef> Amount </th>
                <td mat-cell *matCellDef="let tx" [class]="getAmountClass(tx)"> 
                  {{ getTxType(tx) === 'CREDIT' ? '+' : '-' }}{{tx.amount | currency:'USD'}} 
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let tx"> 
                  <span class="status-badge" [class.status-success]="tx.status === 'SUCCESS'" [class.status-failed]="tx.status === 'FAILED'">
                    {{tx.status}}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <mat-paginator [length]="totalItems"
                          [pageSize]="pageSize"
                          [pageSizeOptions]="[5, 10, 25]"
                          (page)="onPageChange($event)">
            </mat-paginator>

            <div class="text-center p-4 text-muted" *ngIf="transactions.length === 0">
              No transactions found.
            </div>
          </mat-card>
        </div>
      </mat-tab>
    </mat-tab-group>
  </div>
  `,
  styles: [`
  .page-container { padding: 32px; max-width: 900px; margin: 0 auto; }
  .header { display: flex; align-items: center; margin-bottom: 24px; gap: 16px; }
  .header h2 { margin: 0; font-weight: 600; font-size: 24px; color: #333; }
  .tab-content { padding-top: 24px; }
  .form-card { border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
  .full-width { width: 100%; margin-bottom: 8px; }
  .mt-3 { margin-top: 16px; }
  .mt-4 { margin-top: 24px; }
  .p-4 { padding: 24px; }
  .submit-btn { height: 48px; font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
  mat-card-title { font-size: 20px; font-weight: 600; color: #1e293b; }
  
  .credit-badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
  .debit-badge { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
  .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0e0e0; color: #555; }
  .status-success { background: #e8f5e9; color: #2e7d32; }
  .status-failed { background: #ffebee; color: #c62828; }
  .text-success { color: #166534; font-weight: 600; }
  .text-danger { color: #991b1b; font-weight: 600; }
  .text-center { text-align: center; }
  .text-muted { color: #64748b; }
  .tx-id { font-family: monospace; color: #64748b; font-size: 13px; }
  
  table { width: 100%; box-shadow: none; border: none; }
  th.mat-header-cell { background: #f8fafc; color: #475569; font-weight: 600; font-size: 13px; text-transform: uppercase; }
  `]
})
export class TransactionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private txService = inject(TransactionService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  userId = '';

  transferForm: FormGroup = this.fb.group({
    receiverId: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(1)]]
  });

  loading = false;

  transactions: any[] = [];
  displayedColumns = ['date', 'details', 'type', 'amount', 'status'];
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.userId = user.id;
    }
    this.loadHistory();
  }

  onTransfer() {
    if (this.transferForm.invalid) return;

    this.loading = true;
    const { receiverId, amount } = this.transferForm.value;
    const idempotencyKey = crypto.randomUUID();

    this.txService.transferMoney(receiverId, amount, idempotencyKey).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(`Successfully sent $${amount}!`, 'Close', { duration: 3000 });
        this.transferForm.reset();

        Object.keys(this.transferForm.controls).forEach(key => {
          this.transferForm.controls[key].setErrors(null);
        });

        this.loadHistory();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.error || 'Transfer failed.', 'Close', { duration: 4000 });
      }
    });
  }

  loadHistory() {
    this.txService.getTransactions(this.currentPage, this.pageSize).subscribe(res => {
      this.transactions = res.data || [];
      this.totalItems = res.total || 0;
    });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadHistory();
  }

  getTxType(tx: any) {
    if (!tx.sender_id) return 'CREDIT';
    if (tx.receiver_id === this.userId) return 'CREDIT';
    return 'DEBIT';
  }

  getAmountClass(tx: any) {
    return this.getTxType(tx) === 'CREDIT' ? 'text-success' : 'text-danger';
  }
}
