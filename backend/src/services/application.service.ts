import Application from "../models/application.model";

type UserRole = 'student' | 'lecturer' | 'office_staff';
type ReviewStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';
type Phase = 'created' | 'awaiting_application_approval' | 'pre_departure_complete' |
'in_mobility' | 'awaiting_score_approval' | 'closed' | 'canceled';
type ExpectedMobilityPeriod = 'first_semester' | 'second_semester' | 'full_year';

export const findApplications = async (userId: string, role: UserRole, reviewStatus?: ReviewStatus, phases?: Phase[]) => {
    if (role === 'student') { // student first page
        return Application.find({ student: userId } );
    } else if (role === 'lecturer') {
        if (reviewStatus) { // Application Review Requests Page
            return Application.find({
                referentLecturer: userId,
                reviewStatus: reviewStatus // pending
            });
        }
        return Application.find({ referentLecturer: userId }); // lecturer first page
    } else if (role === 'office_staff') {
        if (reviewStatus && phases) { // Update Phases Page
            return Application.find({
                reviewStatus: reviewStatus, // approved
                phase: {
                    $in: phases
                }
            });
        }
        return Application.find(); // staff first page
    }

    throw new Error('Invalid user role.');
};

export const findApplicationById = async (applicationId: string) => {
    return Application.findById(applicationId);
}

export const createApplication = async (
    studentId: string,
    applicationData: {
        academicYear: string;
        hostInstitution: string;
        expectedMobilityPeriod: ExpectedMobilityPeriod;
        referentLecturer: string;
        examMappings: any[];
        learningAgreement: {
            file: {
                filename: string;
                path: string;
                uploadedAt: Date;
            };
        };
    }
) => {
    return Application.create({
        ...applicationData,
        student: studentId,
        lastModifiedBy: studentId,
        phase: 'awaiting_application_approval',
        reviewStatus: 'pending',
    });
};

export const updateApplicationById = async (
    applicationId: string,
    updateData: Record<string, unknown>,
    userId: string
) => {
    return Application.findByIdAndUpdate(
        applicationId,
        {
            $set: {
                ...updateData,
                lastModifiedBy: userId,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );
};