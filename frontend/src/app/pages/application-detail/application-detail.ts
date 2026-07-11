import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Application, ApplicationStatus, ExpectedMobilityPeriod, ReviewStatus } from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';

@Component({
    selector: 'app-application-detail',
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './application-detail.html',
    styleUrl: './application-detail.css'
})
export class ApplicationDetail implements OnInit {
    application: Application | null = null;
    isLoading = false;
    isSubmitting = false;
    errorMessage = '';

    isReviewMode = false;
    reviewType: 'initial_application' | 'exam_results' | null = null;
    selectedDecision: 'approved' | 'rejected' | null = null;
    isSubmittingReview = false;
    reviewErrorMessage = '';

    rejectionReason = new FormControl('', {
        nonNullable: true
    });

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly applicationService: ApplicationService
    ) {}

    ngOnInit(): void {
        const applicationId = this.route.snapshot.paramMap.get('applicationId');

        this.isReviewMode = this.route.snapshot.queryParamMap.get('reviewMode') === 'true';

        const reviewType = this.route.snapshot.queryParamMap.get('reviewType');

        if (reviewType === 'initial_application' || reviewType === 'exam_results') {
            this.reviewType = reviewType;
        }

        if (!applicationId) {
            this.errorMessage = 'Application ID is missing.';
            return;
        }

        this.loadApplication(applicationId);
    }

    loadApplication(applicationId: string): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.applicationService.getApplicationById(applicationId).subscribe({
            next: (response) => {
                this.application = response.data;
                this.isLoading = false;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message ?? 'Failed to load application.';
                this.isLoading = false;
            }
        });
    }

    selectDecision(decision: 'approved' | 'rejected'): void {
        this.selectedDecision = decision;
        this.reviewErrorMessage = '';

        if (decision === 'rejected') {
            this.rejectionReason.setValidators([
                Validators.required,
                Validators.maxLength(500)
            ]);
        } else {
            this.rejectionReason.clearValidators();
            this.rejectionReason.setValue('');
        }

        this.rejectionReason.updateValueAndValidity();
    }

        submitReview(): void {
        if (!this.application || !this.selectedDecision) {
            this.errorMessage = 'Select Approve or Reject.';
            return;
        }

        if (this.selectedDecision === 'rejected') {
            this.rejectionReason.markAsTouched();

            if (this.rejectionReason.invalid) {
                return;
            }
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        const body = {
            decision: this.selectedDecision,
            ...(this.selectedDecision === 'rejected'
                ? { rejectionReason: this.rejectionReason.value.trim() }
                : {})
        };

        const request$ = this.reviewType === 'exam_results'
            ? this.applicationService.reviewExamResults(this.application._id, body)
            : this.applicationService.reviewApplication(this.application._id, body);

        request$.subscribe({
            next: () => {
                this.isSubmitting = false;
                this.router.navigate(['/modifications']);
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message ?? 'Failed to submit review.';
                this.isSubmitting = false;
            }
        });
    }

    cancelReview(): void {
        this.router.navigate(['/modifications']);
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
            am_awaiting_transcript_upload: 'After Mobility: Awaiting Transcript Upload',
            am_awaiting_lecturer_review: 'After Mobility: Awaiting Lecturer Review',
            am_awaiting_staff_verification: 'After Mobility: Awaiting Staff Verification',
            closed: 'Closed'
        };

        return labels[status] ?? status;
    }

    private capitalize(value: string): string {
        if (!value) {
            return '';
        }

        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
}