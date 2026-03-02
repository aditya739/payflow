import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private api = inject(ApiService);
    private router = inject(Router);

    currentUser = signal<any>(null);

    constructor() {
        this.checkToken();
    }

    login(credentials: any) {
        return this.api.post<{ token: string, user: any }>('/auth/login', credentials).pipe(
            tap(res => {
                this.setSession(res.token, res.user);
            })
        );
    }

    register(userData: any) {
        return this.api.post<{ message: string, user: any }>('/auth/register', userData);
    }

    logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    private setSession(token: string, user: any) {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        this.currentUser.set(user);
    }

    getToken(): string | null {
        return localStorage.getItem('jwt_token');
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded: any = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
                this.logout();
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }

    isAdmin(): boolean {
        const user = this.currentUser() || JSON.parse(localStorage.getItem('user_data') || '{}');
        return user?.role === 'ADMIN';
    }

    private checkToken() {
        if (this.isLoggedIn()) {
            const user = JSON.parse(localStorage.getItem('user_data') || '{}');
            this.currentUser.set(user);
        }
    }
}
