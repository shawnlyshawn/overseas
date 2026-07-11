import { HostInstitution } from './host-institution.model';
import { UserSummary } from './user.model';

export type ReviewStatus =
    | 'not_submitted'
    | 'pending'
    | 'approved'
    | 'rejected';

export type ApplicationStatus =
    | 'bm_awaiting_lecturer_review'
    | 'bm_awaiting_staff_verification'
    | 'bm_completed'
    | 'dm_in_progress'
    | 'am_awaiting_transcript_upload'
    | 'am_awaiting_lecturer_review'
    | 'am_awaiting_staff_verification'
    | 'closed';

export type ExpectedMobilityPeriod =
    | 'first_semester'
    | 'second_semester'
    | 'full_year';

export interface HostInstitutionSummary {
    _id: string;
    name: string;
    country: string;
    city: string;
    availableSlots: number;
    applicationDeadline: string;
}

export interface UploadedFile {
    filename: string;
    path: string;
    uploadedAt: string;
}

export interface ExamMapping {
    _id?: string;
    foreignCourseCode: string;
    foreignCourseName: string;
    foreignCourseCredits: number;
    caFoscariCourseCode: string;
    caFoscariCourseName: string;
    caFoscariCourseCredits: number;
    examDate?: string | null;
    score?: number | null;
}

export interface ReviewInfo {
    status: ReviewStatus;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
}

export interface Application {
    _id: string;
    academicYear: string;
    expectedMobilityPeriod: ExpectedMobilityPeriod;
    student: UserSummary;
    hostInstitution: HostInstitution;
    referentLecturer: UserSummary;
    examMappings: ExamMapping[];
    learningAgreement: UploadedFile | null;
    transcriptOfRecords: UploadedFile | null;
    hostUniversityArrivalDate: string | null;
    hostUniversityDepartureDate: string | null;
    applicationReview: ReviewInfo;
    examReview: ReviewInfo;
    status: ApplicationStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateApplicationRequest {
    academicYear: string;
    hostInstitutionId: string;
    expectedMobilityPeriod: ExpectedMobilityPeriod;
    referentLecturerId: string;
    examMappings: ExamMapping[];
}

export interface UpdateApplicationRequest {
    academicYear?: string;
    hostInstitutionId?: string;
    expectedMobilityPeriod?: ExpectedMobilityPeriod;
    referentLecturerId?: string;
    examMappings?: ExamMapping[];
    mobilityDates?: {
        arrivalDate: string | null;
        departureDate: string | null;
    };
}