import { ExamMapping, UploadedFile } from './application.model';
import { HostInstitution } from './host-institution.model';
import { User } from './user.model';

export type ModificationReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ModificationReview {
    status: ModificationReviewStatus;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
}

export interface ModificationStudentSummary {
    _id: string;
    firstName: string;
    lastName: string;
    matriculationNumber: string;
}

export interface ModificationApplicationSummary {
    _id: string;
    student: ModificationStudentSummary;
    referentLecturer: string;
    hostInstitution: Pick<HostInstitution, '_id' | 'name' | 'country' | 'city'>;
    academicYear: string;
    expectedMobilityPeriod: string;
    status: string;
    examMappings: ExamMapping[];
    learningAgreement: UploadedFile | null;
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationModificationListItem {
    _id: string;
    application: ModificationApplicationSummary;
    requestedBy: string;
    description: string;
    proposedExamMappings: ExamMapping[];
    proposedLearningAgreement: UploadedFile | null;
    review: ModificationReview;
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationModificationDetail {
    _id: string;
    application: string;
    requestedBy: User;
    description: string;
    proposedExamMappings: ExamMapping[];
    proposedLearningAgreement: UploadedFile | null;
    review: ModificationReview;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewModificationRequest {
    decision: 'approved' | 'rejected';
    rejectionReason?: string;
}