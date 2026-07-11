import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiResponse } from '../../models/api-response.model';
import { ApplicationModificationDetail, ReviewModificationRequest } from '../../models/application-modification-log.model';
import { ApplicationModificationLogService } from '../../services/application-modification-log.service';

@Component({
    selector: 'app-modification-review',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './modification-review.html',
    styleUrl: './modification-review.css'
})
export class ModificationReview implements OnInit {
    modificationLog: ApplicationModificationDetail | null = null;
    isLoading = false;
    isSubmitting = false;
    errorMessage = '';
    selectedDecision: 'approved' | 'rejected' | null = null;

    rejectionReason = new FormControl('', {
        nonNullable: true
    });

    private logId: string | null = null;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly modificationLogService: ApplicationModificationLogService
    ) {}

    ngOnInit(): void {
        this.logId = this.route.snapshot.paramMap.get('logId');

        if (!this.logId) {
            this.errorMessage = 'Modification ID is missing.';
            return;
        }

        this.loadModificationLog(this.logId);
    }

    selectDecision(decision: 'approved' | 'rejected'): void {
        this.selectedDecision = decision;
        this.errorMessage = '';

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
        if (!this.logId || !this.selectedDecision) {
            this.errorMessage = 'Select Approve or Reject.';
            return;
        }

        if (this.selectedDecision === 'rejected') {
            this.rejectionReason.markAsTouched();

            if (this.rejectionReason.invalid) {
                return;
            }
        }

        const body: ReviewModificationRequest = {
            decision: this.selectedDecision,
            ...(this.selectedDecision === 'rejected'
                ? { rejectionReason: this.rejectionReason.value.trim() }
                : {})
        };

        this.isSubmitting = true;
        this.errorMessage = '';

        this.modificationLogService.reviewModificationLog(this.logId, body).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.router.navigate(['/modifications']);
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message ?? 'Failed to review modification.';
                this.isSubmitting = false;
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/modifications']);
    }

    getFullName(firstName: string, lastName: string): string {
        return `${this.capitalize(firstName)} ${lastName.toUpperCase()}`;
    }

    private loadModificationLog(logId: string): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.modificationLogService.getModificationLogById(logId).subscribe({
            next: (response: ApiResponse<ApplicationModificationDetail>) => {
                this.modificationLog = response.data;
                this.isLoading = false;
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message ?? 'Failed to load modification.';
                this.isLoading = false;
            }
        });
    }

    private capitalize(value: string): string {
        if (!value) {
            return '';
        }

        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
}