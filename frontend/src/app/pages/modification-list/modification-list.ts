import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Application, ApplicationStatus, ExpectedMobilityPeriod } from '../../models/application.model';
import { ApplicationModificationListItem } from '../../models/application-modification-log.model';
import { ApplicationModificationLogService } from '../../services/application-modification-log.service';
import { ApplicationService } from '../../services/application.service';

type ReviewRequestType = 'initial_application' | 'mobility_modification' | 'exam_results';

interface ReviewRequestRow {
    id: string;
    applicationId: string;
    type: ReviewRequestType;
    createdAt: string;
    student: {
        firstName: string;
        lastName: string;
        matriculationNumber: string | null;
    };
    academicYear: string;
    expectedMobilityPeriod: ExpectedMobilityPeriod;
    hostInstitutionName: string;
    applicationStatus: ApplicationStatus;
    description: string | null;
    reviewLink: string[];
    reviewQueryParams: {
        reviewMode: string;
        reviewType: ReviewRequestType;
    } | null;
}

@Component({
    selector: 'app-modification-list',
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './modification-list.html',
    styleUrl: './modification-list.css'
})
export class ModificationList implements OnInit {
    reviewRequests: ReviewRequestRow[] = [];
    isLoading = false;
    errorMessage = '';

    constructor(
        private readonly applicationService: ApplicationService,
        private readonly modificationService: ApplicationModificationLogService
    ) {}

    ngOnInit(): void {
        this.loadReviewRequests();
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

    getReviewTypeLabel(type: ReviewRequestType): string {
        const labels: Record<ReviewRequestType, string> = {
            initial_application: 'Initial Application',
            mobility_modification: 'Mobility Modification',
            exam_results: 'Exam Results'
        };

        return labels[type];
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

    private loadReviewRequests(): void {
        this.isLoading = true;
        this.errorMessage = '';

        forkJoin({
            applicationsResponse: this.applicationService.getApplications(),
            modificationsResponse: this.modificationService.getModificationLogs()
        }).subscribe({
            next: ({ applicationsResponse, modificationsResponse }) => {
                const applicationRequests = this.mapApplicationRequests(
                    applicationsResponse.data
                );

                const modificationRequests = this.mapModificationRequests(
                    modificationsResponse.data
                );

                this.reviewRequests = [
                    ...applicationRequests,
                    ...modificationRequests
                ].sort((first, second) => {
                    return (
                        new Date(second.createdAt).getTime()
                        - new Date(first.createdAt).getTime()
                    );
                });

                this.isLoading = false;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage =
                    error.error?.message
                    ?? 'Failed to load review requests.';

                this.isLoading = false;
            }
        });
    }

    private mapApplicationRequests(applications: Application[]): ReviewRequestRow[] {
        return applications
            .filter((application) => {
                const isPendingInitialReview =
                    application.status === 'bm_awaiting_lecturer_review'
                    && application.applicationReview.status === 'pending';

                const isPendingExamReview =
                    application.status === 'am_awaiting_lecturer_review'
                    && application.examReview.status === 'pending';

                return isPendingInitialReview || isPendingExamReview;
            })
            .map((application) => {
                const type: ReviewRequestType =
                    application.status === 'bm_awaiting_lecturer_review'
                        ? 'initial_application'
                        : 'exam_results';

                return {
                    id: application._id,
                    applicationId: application._id,
                    type,
                    createdAt: application.updatedAt,
                    student: {
                        firstName: application.student.firstName,
                        lastName: application.student.lastName,
                        matriculationNumber:
                            application.student.matriculationNumber ?? null
                    },
                    academicYear: application.academicYear,
                    expectedMobilityPeriod: application.expectedMobilityPeriod,
                    hostInstitutionName: application.hostInstitution.name,
                    applicationStatus: application.status,
                    description: null,
                    reviewLink: ['/applications', application._id],
                    reviewQueryParams: {
                        reviewMode: 'true',
                        reviewType: type
                    }
                };
            });
    }

    private mapModificationRequests(modifications: ApplicationModificationListItem[]): ReviewRequestRow[] {
        return modifications
            .filter((modification) => {
                return modification.review.status === 'pending';
            })
            .map((modification) => ({
                id: modification._id,
                applicationId: modification.application._id,
                type: 'mobility_modification',
                createdAt: modification.createdAt,
                student: {
                    firstName: modification.application.student.firstName,
                    lastName: modification.application.student.lastName,
                    matriculationNumber:
                        modification.application.student.matriculationNumber ?? null
                },
                academicYear: modification.application.academicYear,
                expectedMobilityPeriod:
                    modification.application.expectedMobilityPeriod as ExpectedMobilityPeriod,
                hostInstitutionName: modification.application.hostInstitution.name,
                applicationStatus:
                    modification.application.status as ApplicationStatus,
                description: modification.description,
                reviewLink: ['/modification-logs', modification._id],
                reviewQueryParams: null
            }));
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