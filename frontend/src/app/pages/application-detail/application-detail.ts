import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

import { Application, ApplicationStatus, ExpectedMobilityPeriod, ReviewStatus,  ApplicationHistoryItem } from '../../models/application.model';
import { UserRole } from '../../models/user.model';
import { ApplicationService } from '../../services/application.service';

import { ModificationHistory } from './modification-history/modification-history';

type ReviewType =
    | 'bm_create_application'
    | 'dm_exam_info_update'
    | 'am_exam_result_upload'
    | 'bm_staff_verification'
    | 'am_application_closure';

@Component({
    selector: 'app-application-detail',
    imports: [
        CommonModule,
        RouterLink,
        ReactiveFormsModule,
        ModificationHistory
    ],
    templateUrl: './application-detail.html',
    styleUrl: './application-detail.css'
})
export class ApplicationDetail implements OnInit {
    application: Application | null = null;
    applicationHistory: ApplicationHistoryItem[] = [];

    currentUserRole: UserRole | null = null;

    isLoading = false;
    isLoadingModifications = false;
    isSubmitting = false;
    isSubmittingStaffAction = false;
    isSubmittingReview = false;

    errorMessage = '';
    modificationErrorMessage = '';
    staffActionErrorMessage = '';
    reviewErrorMessage = '';

    isReviewMode = false;
    reviewType: ReviewType | null = null;
    selectedDecision: 'approved' | 'rejected' | null = null;

    rejectionReason = new FormControl('', {
        nonNullable: true
    });

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly applicationService: ApplicationService,
        private readonly authService: AuthService
    ) {}

    ngOnInit(): void {
        this.currentUserRole =
            this.authService.getCurrentUser()?.role ?? null;

        const applicationId =
            this.route.snapshot.paramMap.get('applicationId');

        this.isReviewMode =
            this.route.snapshot.queryParamMap.get('reviewMode') === 'true';

        const reviewType =
            this.route.snapshot.queryParamMap.get('reviewType');

        if (
            reviewType === 'bm_create_application'
            || reviewType === 'dm_exam_info_update'
            || reviewType === 'am_exam_result_upload'
            || reviewType === 'bm_staff_verification'
            || reviewType === 'am_application_closure'
        ) {
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
        this.isLoadingModifications = true;
        this.errorMessage = '';
        this.modificationErrorMessage = '';

        this.applicationService.getApplicationById(applicationId).subscribe({
            next: (response) => {
                this.application = response.data;

                this.applicationHistory = response.data.applicationHistory ?? [];

                this.isLoading = false;
                this.isLoadingModifications = false;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage =
                    error.error?.message
                    ?? 'Failed to load application.';

                this.modificationErrorMessage =
                    error.error?.message
                    ?? 'Failed to load modification history.';

                this.isLoading = false;
                this.isLoadingModifications = false;
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
            this.reviewErrorMessage = 'Select Approve or Reject.';
            return;
        }

        if (this.selectedDecision === 'rejected') {
            this.rejectionReason.markAsTouched();

            if (this.rejectionReason.invalid) {
                return;
            }
        }

        this.isSubmittingReview = true;
        this.reviewErrorMessage = '';

        const body = {
            decision: this.selectedDecision,
            ...(this.selectedDecision === 'rejected'
                ? {
                    rejectionReason:
                        this.rejectionReason.value.trim()
                }
                : {})
        };

        const request$ =
            this.reviewType === 'am_exam_result_upload'
                ? this.applicationService.reviewExamResults(
                    this.application._id,
                    body
                )
                : this.applicationService.reviewApplication(
                    this.application._id,
                    body
                );

        request$.subscribe({
            next: () => {
                this.isSubmittingReview = false;
                this.router.navigate(['/modifications']);
            },
            error: (error: HttpErrorResponse) => {
                this.reviewErrorMessage =
                    error.error?.message
                    ?? 'Failed to submit review.';

                this.isSubmittingReview = false;
            }
        });
    }

    completePreDepartureVerification(): void {
        if (
            !this.application
            || this.currentUserRole !== 'office_staff'
            || !this.isReviewMode
            || this.reviewType !== 'bm_staff_verification'
            || this.application.status !== 'bm_awaiting_staff_verification'
        ) {
            return;
        }

        const confirmed = window.confirm(
            'Complete the pre-departure verification for this application?'
        );

        if (!confirmed) {
            return;
        }

        this.isSubmittingStaffAction = true;
        this.staffActionErrorMessage = '';

        this.applicationService
            .completePreDepartureVerification(this.application._id)
            .subscribe({
                next: () => {
                    this.isSubmittingStaffAction = false;
                    this.router.navigate(['/phase-updates']);
                },
                error: (error: HttpErrorResponse) => {
                    this.staffActionErrorMessage =
                        error.error?.message
                        ?? 'Failed to complete pre-departure verification.';

                    this.isSubmittingStaffAction = false;
                }
            });
    }

    closeApplication(): void {
        if (
            !this.application
            || this.currentUserRole !== 'office_staff'
            || !this.isReviewMode
            || this.reviewType !== 'am_application_closure'
            || this.application.status !== 'am_awaiting_staff_verification'
        ) {
            return;
        }

        const confirmed = window.confirm(
            'Close this application? This action completes the mobility process.'
        );

        if (!confirmed) {
            return;
        }

        this.isSubmittingStaffAction = true;
        this.staffActionErrorMessage = '';

        this.applicationService
            .closeApplication(this.application._id)
            .subscribe({
                next: () => {
                    this.isSubmittingStaffAction = false;
                    this.router.navigate(['/phase-updates']);
                },
                error: (error: HttpErrorResponse) => {
                    this.staffActionErrorMessage =
                        error.error?.message
                        ?? 'Failed to close application.';

                    this.isSubmittingStaffAction = false;
                }
            });
    }

    cancelReview(): void {
        if (this.currentUserRole === 'office_staff') {
            this.router.navigate(['/phase-updates']);
            return;
        }

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

    onModify(): void {
        if (!this.application || !this.currentUserRole) {
            return;
        }

        if (
            this.currentUserRole === 'lecturer'
            || this.currentUserRole === 'office_staff'
        ) {
            this.router.navigate([
                '/applications',
                this.application._id,
                'edit'
            ]);

            return;
        }

        const status = this.application.status;

        if (status.startsWith('bm_')) {
            window.alert(
                'This application cannot be modified during the Before Mobility phase.'
            );

            return;
        }

        if (
            status === 'am_awaiting_staff_verification'
            || status === 'closed'
        ) {
            window.alert(
                'This application can no longer be modified.'
            );

            return;
        }

        this.router.navigate([
            '/applications',
            this.application._id,
            'edit'
        ]);
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