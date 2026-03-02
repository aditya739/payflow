import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatTableModule, MatTabsModule, MatPaginatorModule, MatButtonModule, MatIconModule, RouterModule],
    template: `
  <div class="page-container">
    <div class="header">
      <button mat-icon-button routerLink="/dashboard"><mat-icon>arrow_back</mat-icon></button>
      <h2>Admin Dashboard</h2>
    </div>

    <div class="metrics-grid mb-4">
      <mat-card class="metric-card bg-primary">
        <mat-card-content>
          <div class="metric-title">Total Users</div>
          <div class="metric-value">{{ metrics?.total_users || 0 }}</div>
        </mat-card-content>
      </mat-card>
      
      <mat-card class="metric-card bg-success">
        <mat-card-content>
          <div class="metric-title">Total Transactions</div>
          <div class="metric-value">{{ metrics?.total_transactions || 0 }}</div>
        </mat-card-content>
      </mat-card>

      <mat-card class="metric-card bg-accent">
        <mat-card-content>
          <div class="metric-title">Total Volume</div>
          <div class="metric-value">{{ (metrics?.total_volume || 0) | currency:'USD' }}</div>
        </mat-card-content>
      </mat-card>
    </div>

    <mat-tab-group animationDuration="0ms">
      <mat-tab label="Users">
        <div class="tab-content">
          <mat-card class="data-card">
            <table mat-table [dataSource]="users">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef> ID </th>
                <td mat-cell *matCellDef="let user"> <span class="mono">{{user.id.substring(0,8)}}...</span> </td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef> Name </th>
                <td mat-cell *matCellDef="let user"> {{user.name}} </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef> Email </th>
                <td mat-cell *matCellDef="let user"> {{user.email}} </td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef> Role </th>
                <td mat-cell *matCellDef="let user"> 
                  <span class="role-badge" [class.admin-role]="user.role === 'ADMIN'">{{user.role}}</span> 
                </td>
              </ng-container>

              <ng-container matColumnDef="balance">
                <th mat-header-cell *matHeaderCellDef> Wallet Balance </th>
                <td mat-cell *matCellDef="let user"> <span class="fw-bold">{{(user.wallet?.balance || 0) | currency:'USD'}}</span> </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
            </table>
          </mat-card>
        </div>
      </mat-tab>
      
      <mat-tab label="All Transactions">
        <div class="tab-content">
          <mat-card class="data-card">
            <table mat-table [dataSource]="transactions">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef> Date </th>
                <td mat-cell *matCellDef="let tx"> {{tx.created_at | date:'short'}} </td>
              </ng-container>

              <ng-container matColumnDef="sender">
                <th mat-header-cell *matHeaderCellDef> Sender </th>
                <td mat-cell *matCellDef="let tx"> <span class="mono">{{tx.sender_id ? tx.sender_id.substring(0,8) + '...' : 'SYSTEM'}}</span> </td>
              </ng-container>

              <ng-container matColumnDef="receiver">
                <th mat-header-cell *matHeaderCellDef> Receiver </th>
                <td mat-cell *matCellDef="let tx"> <span class="mono">{{tx.receiver_id.substring(0,8)}}...</span> </td>
              </ng-container>

              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef> Amount </th>
                <td mat-cell *matCellDef="let tx" class="fw-bold"> {{tx.amount | currency:'USD'}} </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let tx"> 
                  <span class="status-badge" [class.status-success]="tx.status === 'SUCCESS'" [class.status-failed]="tx.status === 'FAILED'">
                    {{tx.status}}
                  </span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="txColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: txColumns;"></tr>
            </table>

            <mat-paginator [length]="totalTx"
                          [pageSize]="pageSize"
                          [pageSizeOptions]="[10, 25, 50]"
                          (page)="onPageChange($event)">
            </mat-paginator>
          </mat-card>
        </div>
      </mat-tab>
    </mat-tab-group>
  </div>
  `,
    styles: [`
  .page-container { padding: 32px; max-width: 1200px; margin: 0 auto; }
  .header { display: flex; align-items: center; margin-bottom: 24px; gap: 16px; }
  .header h2 { margin: 0; font-weight: 600; font-size: 28px; color: #333; }
  .mb-4 { margin-bottom: 24px; }
  .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
  .metric-card { border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .bg-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
  .bg-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
  .bg-accent { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
  .metric-title { font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
  .metric-value { font-size: 40px; font-weight: 800; margin-top: 8px; }
  
  .tab-content { padding-top: 24px; }
  .data-card { border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: auto; }
  
  .mono { font-family: monospace; color: #64748b; font-size: 13px; }
  .fw-bold { font-weight: 600; }
  .role-badge { background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  .admin-role { background: #fee2e2; color: #991b1b; }
  .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0e0e0; color: #555; }
  .status-success { background: #dcfce7; color: #166534; }
  .status-failed { background: #fee2e2; color: #991b1b; }
  
  table { width: 100%; box-shadow: none; border: none; }
  th.mat-header-cell { background: #f8fafc; color: #475569; font-weight: 600; font-size: 13px; text-transform: uppercase; }
  `]
})
export class AdminComponent implements OnInit {
    private adminService = inject(AdminService);

    metrics: any = null;
    users: any[] = [];

    transactions: any[] = [];
    totalTx = 0;
    pageSize = 10;
    currentPage = 1;

    userColumns = ['id', 'name', 'email', 'role', 'balance'];
    txColumns = ['date', 'sender', 'receiver', 'amount', 'status'];

    ngOnInit() {
        this.loadMetrics();
        this.loadUsers();
        this.loadTransactions();
    }

    loadMetrics() {
        this.adminService.getMetrics().subscribe({
            next: (res) => this.metrics = res.data,
            error: () => { }
        });
    }

    loadUsers() {
        this.adminService.getUsers().subscribe({
            next: (res) => this.users = res.data || [],
            error: () => { }
        });
    }

    loadTransactions() {
        this.adminService.getTransactions(this.currentPage, this.pageSize).subscribe({
            next: (res) => {
                this.transactions = res.data || [];
                this.totalTx = res.total || 0;
            },
            error: () => { }
        });
    }

    onPageChange(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex + 1;
        this.loadTransactions();
    }
}
