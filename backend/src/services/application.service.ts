import Application from "../models/application.model";

type UserRole = 'student' | 'lecturer' | 'office_staff';
type ApplicationStatus =
    | 'bm_awaiting_lecturer_review'
    | 'bm_awaiting_staff_verification'
    | 'bm_completed'
    | 'dm_in_progress'
    | 'am_awaiting_transcript_upload'
    | 'am_awaiting_lecturer_review'
    | 'am_awaiting_staff_verification'
    | 'closed';

export const findApplications = async (userId: string, role: UserRole, status?: ApplicationStatus) => {
    const filter: Record<string, unknown> = {};

    if (role === 'student') {
        filter.student = userId;
    } else if (role === 'lecturer') {
        filter.referentLecturer = userId;
    } else if (role !== 'office_staff') {
        throw new Error('Invalid user role.');
    }

    if (status) {
        filter.status = status;
    }

    return Application.find(filter)
        .populate('student', '-password')
        .populate('referentLecturer', '-password')
        .populate('hostInstitution')
        .sort({ createdAt: -1 });
};

export const findApplicationById = async (applicationId: string, userId: string, role: UserRole) => {
    const filter: Record<string, unknown> = {
        _id: applicationId,
    };

    if (role === 'student') {
        filter.student = userId;
    } else if (role === 'lecturer') {
        filter.referentLecturer = userId;
    } else if (role !== 'office_staff') {
        throw new Error('Invalid user role.');
    }

    return Application.findOne(filter)
        .populate('student', '-password')
        .populate('referentLecturer', '-password')
        .populate('hostInstitution');
};

// model has default values!
// export const createApplication = async (studentId: string, applicationData: Record<string, unknown>) => {
//     return Application.create({
//         ...applicationData,
//         student: studentId,
//         status: 'bm_awaiting_lecturer_review',
//         applicationReview: {
//             status: 'pending',
//             reviewedBy: null,
//             reviewedAt: null,
//             rejectionReason: null,
//         },
//         examReview: {
//             status: 'not_submitted',
//             reviewedBy: null,
//             reviewedAt: null,
//             rejectionReason: null,
//         },
//     });
// };
export const createApplication = async (studentId: string, applicationData: Record<string, unknown>) => {
    return Application.create({
        ...applicationData,
        student: studentId,
    });
};


export const updateApplicationById = async (applicationId: string, updateData: Record<string, unknown>) => {
    return Application.findByIdAndUpdate(applicationId, { $set: updateData }, { new: true, runValidators: true });
};