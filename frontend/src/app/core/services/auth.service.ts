import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { 
    LoginRequest, 
    LoginResponse, 
    RegisterRequest, 
    RegisterResponse, 
    User 
} from '../models/auth.model';

@Injectable({ 
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);

    private readonly tokenKey = 'auth_token';
    private readonly userKey = 'auth_user';

    readonly currentUser = signal<User | null> (
        this.getStoredUser()
    );

    constructor() {
        if (!this.isAuthenticated()) {
            this.clearSession();
        }
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        const body: LoginRequest = { email: credentials.email.trim(), password: credentials.password };

        return this.http
            .post<LoginResponse>(
                `${environment.apiUrl}/auth/login`, body
            )
            .pipe(
                tap((response) => { this.saveSession(response);
                })
            );
    }

    register(data: RegisterRequest): Observable<RegisterResponse> {
        const body: RegisterRequest = {
        nombre: data.nombre.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        };

        return this.http
            .post<RegisterResponse>(
                `${environment.apiUrl}/auth/register`, body
            );
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();

        if (!token) {
            return false;
        }

        return !this.isTokenExpired(token);
    }

    clearSession(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);

        this.currentUser.set(null);
    }

    updateCurrentUser(user: User): void {
        localStorage.setItem(
        this.userKey,
        JSON.stringify(user)
        );

        this.currentUser.set(user);
    }

    logout(): void {
        this.clearSession();
    }

    private getStoredUser(): User | null {
        const storedUser = localStorage.getItem(this.userKey);

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser) as User;
        } catch (error) {
            localStorage.removeItem(this.userKey);
            return null;
        }
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payloadPart = token.split('.')[1];

            if (!payloadPart) {
                return true;
            }

            const normalizedBase64 = payloadPart
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const paddedBase64 = normalizedBase64.padEnd(
                Math.ceil(normalizedBase64.length / 4) * 4,
                '='
            );

            const payload = JSON.parse(
                atob(paddedBase64)
            ) as { exp?: number };

            if (!payload.exp) {
                return true;
            }

            return Date.now() >= payload.exp * 1000;
        } catch (error) {
            return true;
        }
    }

    private saveSession(response: LoginResponse): void {
        localStorage.setItem(this.tokenKey, response.token);

        this.updateCurrentUser(response.user);
    }
}