import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Application, ApplicationStatus, ExpectedMobilityPeriod, ReviewStatus } from '../../models/application.model';
import { UserRole } from '../../models/user.model';
import { ApplicationService } from '../../services/application.service';

@Component({
    selector: 'app-application-list',
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './application-list.html',
    styleUrl: './application-list.css'
})
export class ApplicationList implements OnInit {
    applications: Application[] = [];
    currentUserRole: UserRole | null = null;
    isLoading = false;
    errorMessage = '';

    constructor(
        private readonly applicationService: ApplicationService,
        private readonly authService: AuthService
    ) {}

    ngOnInit(): void {
        this.currentUserRole = this.authService.getCurrentUser()?.role ?? null;
        this.loadApplications();
    }

    isStudent(): boolean {
        return this.currentUserRole === 'student';
    }

    isLecturer(): boolean {
        return this.currentUserRole === 'lecturer';
    }

    isOfficeStaff(): boolean {
        return this.currentUserRole === 'office_staff';
    }

    loadApplications(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.applicationService.getApplications().subscribe({
            next: (response) => {
                console.log('Applications response:', response.data);
                this.applications = response.data;
                this.isLoading = false;
            },
            error: (error) => {
                this.errorMessage = error.error?.message ?? 'Failed to load applications.';
                this.isLoading = false;
            }
        });
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

    getReviewStatusLabel(status: ReviewStatus): string {
        const labels: Record<ReviewStatus, string> = {
            not_submitted: 'Not Submitted',
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected'
        };

        return labels[status] ?? status;
    }

    getApplicationStatusLabel(status: ApplicationStatus): string {
        const labels: Record<ApplicationStatus, string> = {
            bm_awaiting_lecturer_review: 'Before Mobility: Awaiting Lecturer Review',
            bm_awaiting_staff_verification: 'Before Mobility: Awaiting Staff Verification',
            bm_completed: 'Before Mobility: Completed',
            dm_in_progress: 'During Mobility',
            am_awaiting_transcript_upload: 'After Mobility: No Transtript Upload',
            am_awaiting_lecturer_review: 'After Mobility: Awaiting Lecturer Review',
            am_awaiting_staff_verification: 'After Mobility: Awaiting Staff Verification',
            closed: 'Closed'
        };

        return labels[status] ?? status;
    }

    getCurrentReviewStatus(application: Application): ReviewStatus {
        if (
            application.status === 'am_awaiting_transcript_upload'
            || application.status === 'am_awaiting_lecturer_review'
            || application.status === 'am_awaiting_staff_verification'
            || application.status === 'closed'
        ) {
            return application.examReview.status;
        }

        return application.applicationReview.status;
    }

    getCurrentRejectionReason(application: Application): string | null {
        if (
            application.status === 'am_awaiting_transcript_upload'
            || application.status === 'am_awaiting_lecturer_review'
            || application.status === 'am_awaiting_staff_verification'
            || application.status === 'closed'
        ) {
            return application.examReview.rejectionReason;
        }

        return application.applicationReview.rejectionReason;
    }

    private capitalize(value: string): string {
        if (!value) {
            return '';
        }

        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
}