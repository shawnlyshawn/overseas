import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ApplicationHistoryItem, DirectUpdateHistoryItem } from '../../../models/application.model';

@Component({
    selector: 'app-modification-history',
    imports: [CommonModule],
    templateUrl: './modification-history.html',
    styleUrl: './modification-history.css'
})
export class ModificationHistory {
    @Input() applicationHistory: ApplicationHistoryItem[] = [];
    @Input() isLoading = false;
    @Input() errorMessage = '';

    expandedModificationId: string | null = null;

    toggleModificationMappings(historyId: string): void {
        this.expandedModificationId =
            this.expandedModificationId === historyId
                ? null
                : historyId;
    }

    getReviewStatusLabel(status: string): string {
        switch (status) {
            case 'pending':
                return 'Pending';

            case 'approved':
                return 'Approved';

            case 'rejected':
                return 'Rejected';

            default:
                return status;
        }
    }

    getRoleLabel(role: string): string {
        switch (role) {
            case 'student':
                return 'Student';

            case 'lecturer':
                return 'Lecturer';

            case 'office_staff':
                return 'Office Staff';

            default:
                return role;
        }
    }

    getDirectUpdateExamMappings(history: DirectUpdateHistoryItem): any[] {
        const examMappings = history.updatedData['examMappings'];

        return Array.isArray(examMappings)
            ? examMappings
            : [];
    }

    getDirectUpdateLearningAgreement(history: DirectUpdateHistoryItem): any | null {
        const learningAgreement =
            history.updatedData['learningAgreement'];

        return (
            learningAgreement
            && typeof learningAgreement === 'object'
        )
            ? learningAgreement
            : null;
    }

    getDirectUpdateTranscript(history: DirectUpdateHistoryItem): any | null {
        const transcript =
            history.updatedData['transcriptOfRecords'];

        return (
            transcript
            && typeof transcript === 'object'
        )
            ? transcript
            : null;
    }

    hasDirectUpdateExamMappings(history: DirectUpdateHistoryItem): boolean {
        return this.getDirectUpdateExamMappings(history).length > 0;
    }
}