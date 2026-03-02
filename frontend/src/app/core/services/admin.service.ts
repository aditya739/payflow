import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private api = inject(ApiService);

    getMetrics() {
        return this.api.get<{ data: any }>('/admin/metrics');
    }

    getUsers() {
        return this.api.get<{ data: any[] }>('/admin/users');
    }

    getTransactions(page = 1, limit = 10) {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.api.get<{ data: any[], total: number, page: number, limit: number }>('/admin/transactions', params);
    }
}
