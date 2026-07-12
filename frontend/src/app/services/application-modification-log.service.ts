import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { ApplicationModificationDetail, ApplicationModificationListItem, ReviewModificationRequest } from '../models/application-modification-log.model';

@Injectable({
    providedIn: 'root'
})
export class ApplicationModificationLogService {
    private readonly applicationsApiUrl = 'http://localhost:3000/api/v1/applications';
    private readonly modificationsApiUrl = 'http://localhost:3000/api/v1/application-modifications';

    constructor(private readonly http: HttpClient) {}

    createModification(
        applicationId: string,
        formData: FormData
    ): Observable<ApiResponse<ApplicationModificationDetail>> {
        return this.http.post<ApiResponse<ApplicationModificationDetail>>(
            `${this.applicationsApiUrl}/${applicationId}/application-modifications`,
            formData
        );
    }

    getModificationLogs(): Observable<ApiResponse<ApplicationModificationListItem[]>> {
        return this.http.get<ApiResponse<ApplicationModificationListItem[]>>(
            this.modificationsApiUrl
        );
    }

    getModificationLogById(logId: string): Observable<ApiResponse<ApplicationModificationDetail>> {
        return this.http.get<ApiResponse<ApplicationModificationDetail>>(
            `${this.modificationsApiUrl}/${logId}`
        );
    }

    reviewModificationLog(
        logId: string,
        body: ReviewModificationRequest
    ): Observable<ApiResponse<ApplicationModificationDetail>> {
        return this.http.patch<ApiResponse<ApplicationModificationDetail>>(
            `${this.modificationsApiUrl}/${logId}/review`,
            body
        );
    }

    getModificationLogsByApplicationId(applicationId: string): Observable<ApiResponse<ApplicationModificationDetail[]>> {
        return this.http.get<ApiResponse<ApplicationModificationDetail[]>>(
            `${this.applicationsApiUrl}/${applicationId}/application-modifications`
        );
    }

}