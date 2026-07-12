import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';
import { Application, ApplicationDetailResponse, ReviewStatus } from '../models/application.model';

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

        return this.http.get<PaginatedApiResponse<Application>>(
            this.apiUrl,
            { params }
        );
    }

    getApplicationById(applicationId: string): Observable<ApiResponse<ApplicationDetailResponse>> {
        return this.http.get<ApiResponse<ApplicationDetailResponse>>(
            `${this.apiUrl}/${applicationId}`
        );
    }

    createApplication(body: FormData): Observable<ApiResponse<Application>> {
        return this.http.post<ApiResponse<Application>>(
            this.apiUrl,
            body
        );
    }

    updateMobilityDates(
        applicationId: string,
        body: {
            hostUniversityArrivalDate?: string | null;
            hostUniversityDepartureDate?: string | null;
        }
    ): Observable<ApiResponse<Application>> {
        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/mobility-dates`,
            body
        );
    }

    submitExamResults(
        applicationId: string,
        formData: FormData
    ): Observable<ApiResponse<Application>> {
        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/exam-results`,
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

    reviewApplication(
        applicationId: string,
        body: {
            decision: 'approved' | 'rejected';
            rejectionReason?: string;
        }
    ): Observable<ApiResponse<Application>> {
        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/application-review`,
            body
        );
    }

    reviewExamResults(
        applicationId: string,
        body: {
            decision: 'approved' | 'rejected';
            rejectionReason?: string;
        }
    ): Observable<ApiResponse<Application>> {
        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}/exam-review`,
            body
        );
    }
    updateApplication(
        applicationId: string,
        formData: FormData
    ): Observable<ApiResponse<Application>> {
        return this.http.patch<ApiResponse<Application>>(
            `${this.apiUrl}/${applicationId}`,
            formData
        );
    }
}