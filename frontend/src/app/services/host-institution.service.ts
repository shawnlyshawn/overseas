import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { HostInstitution } from '../models/host-institution.model';

@Injectable({
    providedIn: 'root'
})
export class HostInstitutionService {
    private readonly apiUrl = 'http://localhost:3000/api/v1/host-institutions';

    constructor(private readonly http: HttpClient) {}

    getHostInstitutions(): Observable<ApiResponse<HostInstitution[]>> {
        return this.http.get<ApiResponse<HostInstitution[]>>(this.apiUrl);
    }
}