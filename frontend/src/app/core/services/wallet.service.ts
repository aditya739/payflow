import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    private api = inject(ApiService);

    getBalance() {
        return this.api.get<{ wallet: any }>('/wallet/balance');
    }

    addMoney(amount: number) {
        return this.api.post<{ message: string, wallet: any }>('/wallet/add-money', { amount });
    }
}
