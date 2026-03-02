import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { WalletService } from '../../core/services/wallet.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, RouterModule, BaseChartDirective],
    providers: [provideCharts(withDefaultRegisterables())],
    template: `
  <div class="dashboard-container">
    <div class="header">
      <h2>Welcome back, {{ userName }}</h2>
      <div>
        <button *ngIf="isAdmin" mat-stroked-button color="primary" class="mr-2" routerLink="/admin">Admin Panel</button>
        <button mat-flat-button color="warn" (click)="logout()">Logout</button>
      </div>
    </div>

    <div class="metrics-row">
      <mat-card class="metric-card balance-card">
        <mat-card-header>
          <mat-card-title>Current Balance</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h1 class="balance-amount">{{ balance | currency:'USD' }}</h1>
          <div class="actions mt-3">
            <button mat-raised-button style="background: white; color: #1976d2" routerLink="/wallet">Add Money</button>
            <button mat-stroked-button style="border-color: rgba(255,255,255,0.5); color: white" class="ml-2" routerLink="/transactions">Send Money</button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="metric-card chart-card">
        <mat-card-header>
          <mat-card-title>Activity Trend</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div style="display: block; height: 160px">
            <canvas baseChart
              [data]="chartData"
              [options]="chartOptions"
              [type]="'line'">
            </canvas>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="recent-transactions">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Recent Transactions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="recentTx">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef> Date </th>
              <td mat-cell *matCellDef="let tx"> {{tx.created_at | date:'MMM d, y, h:mm a'}} </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef> Flow </th>
              <td mat-cell *matCellDef="let tx"> 
                <span [class]="getTxType(tx) === 'CREDIT' ? 'credit-badge' : 'debit-badge'">
                  {{ getTxType(tx) }}
                </span>
                <span style="display: block; font-size: 11px; color: #777; margin-top: 4px;">{{ tx.idempotency_key }}</span>
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
                <span class="status-badge" [class.status-success]="tx.status === 'SUCCESS'" [class.status-pending]="tx.status === 'PENDING'">
                  {{tx.status}}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div class="mt-3 text-center" *ngIf="recentTx.length === 0" style="padding: 24px; color: #666;">
            No recent transactions found. Add some money to your wallet!
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  </div>
  `,
    styles: [`
  .dashboard-container { padding: 32px; max-width: 1200px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
  .header h2 { margin: 0; font-weight: 600; font-size: 28px; color: #333; }
  .metrics-row { display: flex; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
  .metric-card { flex: 1; min-width: 320px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .balance-card { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; }
  .balance-card mat-card-title { color: #bfdbfe; font-size: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; }
  .balance-amount { font-size: 56px; margin: 16px 0 0 0; font-weight: 800; }
  .chart-card { background: #fff; }
  .chart-card mat-card-title { color: #555; font-size: 16px; font-weight: 500; }
  .mt-3 { margin-top: 16px; }
  .ml-2 { margin-left: 12px; }
  .mr-2 { margin-right: 12px; }
  .credit-badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
  .debit-badge { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
  .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0e0e0; color: #555; }
  .status-success { background: #e8f5e9; color: #2e7d32; }
  .status-pending { background: #fff8e1; color: #f57f17; }
  .text-success { color: #166534; font-weight: 600; }
  .text-danger { color: #991b1b; font-weight: 600; }
  .text-center { text-align: center; }
  table { width: 100%; box-shadow: none; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; }
  th.mat-header-cell { background: #f8fafc; color: #475569; font-weight: 600; font-size: 13px; text-transform: uppercase; }
  td.mat-cell { color: #334155; }
  `]
})
export class DashboardComponent implements OnInit {
    private walletService = inject(WalletService);
    private txService = inject(TransactionService);
    private authService = inject(AuthService);

    userName = '';
    userId = '';
    isAdmin = false;
    balance = 0;
    recentTx: any[] = [];
    displayedColumns = ['date', 'type', 'amount', 'status'];

    chartData: any = {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
        datasets: [{
            label: 'Activity',
            data: [0, 50, 150, 100, 200, 180, 250],
            fill: true,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
        }]
    };
    chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, display: false },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
    };

    ngOnInit() {
        const user = this.authService.currentUser();
        if (user) {
            this.userName = user.name;
            this.userId = user.id;
            this.isAdmin = user.role === 'ADMIN';
        }

        this.loadData();
    }

    loadData() {
        this.walletService.getBalance().subscribe(res => {
            this.balance = res.wallet.balance;
        });

        this.txService.getTransactions(1, 6).subscribe(res => {
            this.recentTx = res.data || [];
            if (this.recentTx.length > 0) {
                // Mock chart logic for dynamic activity look
                const volume = this.recentTx.reduce((acc, tx) => acc + tx.amount, 0);
                this.chartData.datasets[0].data[6] = volume;
                this.chartData = { ...this.chartData };
            }
        });
    }

    getTxType(tx: any) {
        if (!tx.sender_id) return 'CREDIT'; // System Deposit
        if (tx.receiver_id === this.userId) return 'CREDIT';
        return 'DEBIT';
    }

    getAmountClass(tx: any) {
        return this.getTxType(tx) === 'CREDIT' ? 'text-success' : 'text-danger';
    }

    logout() {
        this.authService.logout();
    }
}
