import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly apiUrl = 'http://localhost:3000/api/v1/users';

    constructor(private readonly http: HttpClient) {}

    getCurrentUser(): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`);
    }

    getLecturers(): Observable<ApiResponse<User[]>> {
        return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/lecturers`);
    }
}