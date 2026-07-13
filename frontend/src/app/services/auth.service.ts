import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { AuthUser, LoginRequest, LoginResponseData } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly apiUrl = 'http://localhost:3000/api/v1/auth';
    private readonly tokenKey = 'token';
    private readonly userKey = 'user';

    constructor(private readonly http: HttpClient) {}

    login(body: LoginRequest): Observable<ApiResponse<LoginResponseData>> {
        return this.http.post<ApiResponse<LoginResponseData>>(`${this.apiUrl}/login`, body).pipe(
            tap((response) => {
                localStorage.setItem(this.tokenKey, response.data.token);
                localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    getCurrentUser(): AuthUser | null {
        const storedUser = localStorage.getItem(this.userKey);

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser) as AuthUser;
        } catch {
            this.logout();
            return null;
        }
    }

    isLoggedIn(): boolean {
        return this.getToken() !== null;
    }
}