import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private api = inject(ApiService);

    transferMoney(receiverId: string, amount: number, idempotencyKey: string) {
        return this.api.post('/transactions/transfer', { receiver_id: receiverId, amount, idempotency_key: idempotencyKey });
    }

    getTransactions(page = 1, limit = 10) {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.api.get<{ data: any[], total: number, page: number, limit: number }>('/transactions/', params);
    }
}
