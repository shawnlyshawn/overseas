import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { ApplicationModificationDetail, ApplicationModificationListItem, ReviewModificationRequest } from '../models/application-modification-log.model';

@Injectable({
    providedIn: 'root'
})
export class ApplicationModificationLogService {
    private readonly apiUrl = 'http://localhost:3000/api/v1/application-modifications';

    constructor(private readonly http: HttpClient) {}

    getModificationLogs(): Observable<ApiResponse<ApplicationModificationListItem[]>> {
        return this.http.get<ApiResponse<ApplicationModificationListItem[]>>(this.apiUrl);
    }

    getModificationLogById(logId: string): Observable<ApiResponse<ApplicationModificationDetail>> {
        return this.http.get<ApiResponse<ApplicationModificationDetail>>(`${this.apiUrl}/${logId}`);
    }

    reviewModificationLog(logId: string, body: ReviewModificationRequest): Observable<ApiResponse<ApplicationModificationDetail>> {
        return this.http.patch<ApiResponse<ApplicationModificationDetail>>(`${this.apiUrl}/${logId}/review`, body);
    }
}