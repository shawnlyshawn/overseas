import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';
import {
    Application,
    CreateApplicationRequest,
    ReviewStatus,
    UpdateApplicationRequest
} from '../models/application.model';

@Injectable({
    providedIn: 'root'
})
export class ApplicationService {
    private readonly apiUrl = 'http://localhost:3000/api/v1/applications';

    constructor(private readonly http: HttpClient) {}

    getApplications(reviewStatus?: ReviewStatus): Observable<PaginatedApiResponse<Application>> {
        let params = new HttpParams();

        if (reviewStatus) {
            params = params.set('reviewStatus', reviewStatus);
        }

        return this.http.get<PaginatedApiResponse<Application>>(this.apiUrl, { params });
    }

    getApplicationById(applicationId: string): Observable<ApiResponse<Application>> {
        return this.http.get<ApiResponse<Application>>(`${this.apiUrl}/${applicationId}`);
    }

    createApplication(body: FormData): Observable<ApiResponse<Application>> {
        return this.http.post<ApiResponse<Application>>(this.apiUrl, body);
    }

    updateApplication(applicationId: string, formData: FormData) {
        return this.http.patch(
            `${this.apiUrl}/${applicationId}/`,
            formData
        );
    }

    uploadLearningAgreement(applicationId: string, file: File): Observable<ApiResponse<Application>> {
        const formData = new FormData();
        formData.append('learningAgreement', file);

        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/learning-agreement`,
            formData
        );
    }

    uploadTranscriptOfRecords(applicationId: string, file: File): Observable<ApiResponse<Application>> {
        const formData = new FormData();
        formData.append('transcriptOfRecords', file);

        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/transcript-of-records`,
            formData
        );
    }
    
    completePreDepartureVerification(applicationId: string): Observable<ApiResponse<Application>> {
        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/pre-departure-verification`,
            {
                verified: true
            }
        );
    }

    closeApplication(applicationId: string): Observable<ApiResponse<Application>> {
        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/closure`,
            {
                closed: true
            }
        );
    }

    reviewApplication(applicationId: string, body: {
        decision: 'approved' | 'rejected';
        rejectionReason?: string;
    }): Observable<ApiResponse<Application>> {
        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/application-review`,
            body
        );
    }

    reviewExamResults(applicationId: string, body: {
        decision: 'approved' | 'rejected';
        rejectionReason?: string;
    }): Observable<ApiResponse<Application>> {
        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/exam-review`,
            body
        );
    }
}