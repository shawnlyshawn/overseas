import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ApiResponse } from '../../models/api-response.model';
import { Application, ApplicationStatus, ExpectedMobilityPeriod } from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';

type StaffReviewType =
    | 'bm_staff_verification'
    | 'am_application_closure';

@Component({
    selector: 'app-phase-update-list',
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './phase-update-list.html',
    styleUrl: './phase-update-list.css'
})
export class PhaseUpdateList implements OnInit {
    applications: Application[] = [];
    isLoading = false;
    errorMessage = '';

    constructor(
        private readonly applicationService: ApplicationService
    ) {}

    ngOnInit(): void {
        this.loadApplications();
    }

    getFullName(firstName: string, lastName: string): string {
        return `${this.capitalize(firstName)} ${lastName.toUpperCase()}`;
    }

    getMobilityPeriodLabel(period: ExpectedMobilityPeriod): string {
        const labels: Record<ExpectedMobilityPeriod, string> = {
            first_semester: 'First Semester',
            second_semester: 'Second Semester',
            full_year: 'Full Year'
        };

        return labels[period] ?? period;
    }

    getApplicationStatusLabel(status: ApplicationStatus): string {
        const labels: Record<ApplicationStatus, string> = {
            bm_awaiting_lecturer_review: 'Before Mobility: Awaiting Lecturer Review',
            bm_awaiting_staff_verification: 'Before Mobility: Awaiting Staff Verification',
            bm_completed: 'Before Mobility: Completed',
            dm_in_progress: 'During Mobility',
            am_awaiting_transcript_upload: 'After Mobility: Awaiting Transcript Upload',
            am_awaiting_lecturer_review: 'After Mobility: Awaiting Lecturer Review',
            am_awaiting_staff_verification: 'After Mobility: Awaiting Staff Verification',
            closed: 'Closed'
        };

        return labels[status] ?? status;
    }

    getReviewType(application: Application): StaffReviewType {
        if (application.status === 'bm_awaiting_staff_verification') {
            return 'bm_staff_verification';
        }

        return 'am_application_closure';
    }

    private loadApplications(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.applicationService.getApplications().subscribe({
            next: (response: ApiResponse<Application[]>) => {
                this.applications = response.data.filter((application) => {
                    return (
                        application.status === 'bm_awaiting_staff_verification'
                        || application.status === 'am_awaiting_staff_verification'
                    );
                });

                this.isLoading = false;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage =
                    error.error?.message
                    ?? 'Failed to load applications.';

                this.isLoading = false;
            }
        });
    }

    private capitalize(value: string): string {
        if (!value) {
            return '';
        }

        return (
            value.charAt(0).toUpperCase()
            + value.slice(1).toLowerCase()
        );
    }
}