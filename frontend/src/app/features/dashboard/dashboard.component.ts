import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { WalletService } from '../../core/services/wallet.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatTooltipModule, RouterModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
  <div class="dashboard-wrapper">
    <!-- Top Navigation Bar -->
    <div class="top-nav">
      <div class="brand">
        <mat-icon class="brand-icon">payments</mat-icon>
        <span class="brand-text">PayFlow</span>
      </div>
      <div class="nav-actions">
        <button *ngIf="isAdmin" mat-stroked-button class="admin-btn" routerLink="/admin">
          <mat-icon>admin_panel_settings</mat-icon> Admin Panel
        </button>
        <div class="user-profile">
          <div class="avatar">{{ userName.charAt(0) | uppercase }}</div>
          <span class="user-name">{{ userName }}</span>
        </div>
        <button mat-icon-button (click)="logout()" color="warn" matTooltip="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Overview of your recent activity and balance.</p>
      </div>

      <div class="metrics-row">
        <!-- Balance Card -->
        <div class="metric-card balance-card">
          <div class="balance-header">
            <span>Available Balance</span>
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <h2 class="balance-amount">{{ balance | currency:'USD' }}</h2>
          <div class="balance-actions">
            <button class="action-btn primary" routerLink="/wallet">Add Money</button>
            <button class="action-btn secondary" routerLink="/transactions">Send</button>
          </div>
        </div>

        <!-- Chart Card -->
        <div class="metric-card chart-card">
          <div class="card-title">Activity Trend</div>
          <div class="chart-container">
            <canvas baseChart
              [data]="chartData"
              [options]="chartOptions"
              [type]="'line'">
            </canvas>
          </div>
        </div>
      </div>

      <div class="recent-transactions">
        <div class="section-header">
          <h3>Recent Transactions</h3>
          <button mat-button color="primary" routerLink="/transactions">View All</button>
        </div>
        
        <div class="table-container">
          <table mat-table [dataSource]="recentTx">
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef> Date & Time </th>
              <td mat-cell *matCellDef="let tx" class="text-muted"> {{tx.created_at | date:'MMM d, y, h:mm a'}} </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef> Transaction Details </th>
              <td mat-cell *matCellDef="let tx"> 
                <div class="tx-details">
                  <span [class]="getTxType(tx) === 'CREDIT' ? 'credit-badge' : 'debit-badge'">
                    {{ getTxType(tx) }}
                  </span>
                  <span class="tx-ref">Ref: {{ tx.idempotency_key }}</span>
                </div>
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
                  {{ tx.status | titlecase }}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="tx-row"></tr>
          </table>
          <div class="empty-state" *ngIf="recentTx.length === 0">
            <mat-icon>receipt_long</mat-icon>
            <p>No transactions yet</p>
            <span>Your recent activity will show up here.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .dashboard-wrapper { background-color: var(--bg-light); min-height: 100vh; }
  
  /* Top Nav */
  .top-nav { display: flex; justify-content: space-between; align-items: center; background: #fff; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 16px 40px; }
  .brand { display: flex; align-items: center; gap: 8px; color: var(--primary-color); }
  .brand-icon { font-size: 28px; height: 28px; width: 28px; }
  .brand-text { font-size: 22px; font-weight: 700; font-family: 'Inter', sans-serif; letter-spacing: -0.5px; color: var(--text-main); }
  
  .nav-actions { display: flex; align-items: center; gap: 20px; }
  .admin-btn { border-color: #d1d5db; color: #374151; font-weight: 500; }
  .user-profile { display: flex; align-items: center; gap: 10px; padding-left: 20px; border-left: 1px solid #e5e7eb; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 16px; }
  .user-name { font-weight: 500; color: #374151; font-size: 15px; }

  /* Content Area */
  .dashboard-content { max-width: 1100px; margin: 0 auto; padding: 40px; }
  .page-header { margin-bottom: 32px; }
  .page-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px 0; color: var(--text-main); letter-spacing: -0.5px; }
  .subtitle { color: var(--text-muted); font-size: 16px; margin: 0; }

  /* Metrics Row */
  .metrics-row { display: grid; grid-template-columns: 1.2fr 2fr; gap: 24px; margin-bottom: 40px; }
  
  .metric-card { background: #fff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04); padding: 32px; box-sizing: border-box; }
  
  .balance-card { background: linear-gradient(135deg, var(--primary-color) 0%, #0d47a1 100%); color: white; border: none; box-shadow: 0 12px 24px rgba(26, 115, 232, 0.25); display: flex; flex-direction: column; justify-content: space-between; }
  .balance-header { display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 500; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px; }
  .balance-amount { font-size: 48px; font-weight: 700; margin: 24px 0 32px 0; letter-spacing: -1px; }
  
  .balance-actions { display: flex; gap: 12px; }
  .action-btn { flex: 1; padding: 12px; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; border: none; transition: transform 0.2s, background 0.2s; font-family: 'Inter', sans-serif; }
  .action-btn.primary { background: #fff; color: var(--primary-color); }
  .action-btn.primary:hover { background: #f8f9fa; transform: translateY(-1px); }
  .action-btn.secondary { background: rgba(255,255,255,0.15); color: #fff; }
  .action-btn.secondary:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }

  .chart-card { display: flex; flex-direction: column; }
  .card-title { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 16px; }
  .chart-container { flex: 1; min-height: 180px; position: relative; }

  /* Recent Transactions */
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .section-header h3 { font-size: 18px; font-weight: 600; margin: 0; color: #111827; }

  .table-container { background: #fff; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04); overflow: hidden; }
  table { width: 100%; }
  th.mat-header-cell { background: #f9fafb; color: #6b7280; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; padding: 16px 24px; border-bottom: 1px solid #f3f4f6; }
  td.mat-cell { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px; font-weight: 500; }
  .tx-row:last-child td { border-bottom: none; }
  .tx-row:hover { background: #f9fafb; }
  
  .text-muted { color: #6b7280 !important; font-weight: 400 !important; }
  
  .tx-details { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
  .tx-ref { font-size: 12px; color: #9ca3af; font-family: monospace; }
  
  .credit-badge { background: #d1fae5; color: #047857; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
  .debit-badge { background: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
  
  .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; background: #f3f4f6; color: #4b5563; }
  .status-success { background: #dcfce7; color: #15803d; }
  .status-pending { background: #fef3c7; color: #b45309; }
  
  .text-success { color: #047857 !important; font-weight: 600 !important; font-size: 15px !important; }
  .text-danger { color: #b91c1c !important; font-weight: 600 !important; font-size: 15px !important; }

  .empty-state { text-align: center; padding: 48px 24px; color: #6b7280; }
  .empty-state mat-icon { font-size: 48px; height: 48px; width: 48px; color: #d1d5db; margin-bottom: 16px; }
  .empty-state p { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #374151; }
  .empty-state span { font-size: 14px; }

  @media screen and (max-width: 900px) {
    .metrics-row { grid-template-columns: 1fr; }
    .top-nav { padding: 16px 24px; }
    .dashboard-content { padding: 24px; }
  }
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
