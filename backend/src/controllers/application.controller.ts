import mongoose from 'mongoose';
import type { Request, Response } from 'express';

import { findApplications, findApplicationById, createApplication } from '../services/application.service';
import Application from '../models/application.model';

import ApplicationModification from '../models/application-modification.model';
import ApplicationChangeLog from '../models/application-change-log.model';

type ApplicationStatus =
    | 'bm_awaiting_lecturer_review'
    | 'bm_awaiting_staff_verification'
    | 'bm_completed'
    | 'dm_in_progress'
    | 'am_awaiting_transcript_upload'
    | 'am_awaiting_lecturer_review'
    | 'am_awaiting_staff_verification'
    | 'closed';

export const getApplications = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        const status = typeof req.query.status === 'string' ? req.query.status : undefined;

        const validStatuses: ApplicationStatus[] = [
            'bm_awaiting_lecturer_review',
            'bm_awaiting_staff_verification',
            'bm_completed',
            'dm_in_progress',
            'am_awaiting_transcript_upload',
            'am_awaiting_lecturer_review',
            'am_awaiting_staff_verification',
            'closed',
        ];

        if (status && !validStatuses.includes(status as ApplicationStatus)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application status.',
            });
        }

        const applications = await findApplications(user.userId, user.role, status as ApplicationStatus | undefined);

        return res.status(200).json({
            result: 'success',
            data: applications,
        });
    } catch (error: unknown) {
        console.error('Failed to retrieve applications:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const getApplicationDetail = async (req: Request<{ applicationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const applicationId = req.params.applicationId;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application ID.',
            });
        }

        const application = await findApplicationById(
            applicationId,
            user.userId,
            user.role
        );

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

const studentModifications = await ApplicationModification.find({
    application: applicationId,
})
    .populate(
        'requestedBy',
        'firstName lastName role'
    )
    .populate(
        'review.reviewedBy',
        'firstName lastName role'
    )
    .sort({
        createdAt: -1,
    })
    .limit(3)
    .lean();

const directUpdates = await ApplicationChangeLog.find({
    application: applicationId,
})
    .populate(
        'changedBy',
        'firstName lastName role'
    )
    .sort({
        createdAt: -1,
    })
    .limit(3)
    .lean();

const studentHistory = studentModifications.map(
    (modification) => ({
        historyType: 'student_modification' as const,
        _id: modification._id,
        createdAt: modification.createdAt,
        updatedAt: modification.updatedAt,
        modifiedBy: modification.requestedBy,
        description: modification.description,
        proposedExamMappings:
            modification.proposedExamMappings,
        proposedLearningAgreement:
            modification.proposedLearningAgreement,
        review: modification.review,
    })
);

const directUpdateHistory = directUpdates.map(
    (changeLog) => ({
        historyType: 'direct_update' as const,
        _id: changeLog._id,
        createdAt: changeLog.createdAt,
        updatedAt: changeLog.updatedAt,
        modifiedBy: changeLog.changedBy,
        changedByRole: changeLog.changedByRole,
        changedFields: changeLog.changedFields,
        previousData: changeLog.previousData,
        updatedData: changeLog.updatedData,
    })
);

const applicationHistory = [
    ...studentHistory,
    ...directUpdateHistory,
]
    .sort(
        (first, second) =>
            new Date(second.createdAt).getTime()
            - new Date(first.createdAt).getTime()
    )
    .slice(0, 3);

        return res.status(200).json({
            result: 'success',
            data: {
                ...application.toObject(),
                applicationHistory,
            },
        });
    } catch (error: unknown) {
        console.error(
            'Failed to retrieve application detail:',
            error
        );

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const createNewApplication = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        const academicYear = req.body.academicYear;
        const hostInstitution = req.body.hostInstitution;
        const expectedMobilityPeriod = req.body.expectedMobilityPeriod;
        const referentLecturer = req.body.referentLecturer;

        if (
            typeof academicYear !== 'string' ||
            typeof hostInstitution !== 'string' ||
            typeof expectedMobilityPeriod !== 'string' ||
            typeof referentLecturer !== 'string'
        ) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application data.',
            });
        }

        if (typeof req.body.examMappings !== 'string') {
            return res.status(400).json({
                result: 'failed',
                message: 'Exam mappings are required.',
            });
        }

        let examMappings: unknown;

        try {
            examMappings = JSON.parse(req.body.examMappings);
        } catch {
            return res.status(400).json({
                result: 'failed',
                message: 'Exam mappings must be valid JSON.',
            });
        }

        if (!Array.isArray(examMappings) || examMappings.length === 0) {
            return res.status(400).json({
                result: 'failed',
                message: 'At least one exam mapping is required.',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                result: 'failed',
                message: 'Learning Agreement file is required.',
            });
        }

        const application = await createApplication(user.userId, {
            academicYear,
            hostInstitution,
            expectedMobilityPeriod,
            referentLecturer,
            examMappings,
            learningAgreement: {
                filename: req.file.filename,
                path: req.file.path,
                uploadedAt: new Date(),
            },
        });

        return res.status(201).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error('Failed to create application:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const reviewApplication = async (req: Request<{ applicationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const applicationId = req.params.applicationId;
        const decision = req.body.decision;
        const rejectionReason = req.body.rejectionReason;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application ID.',
            });
        }

        if (decision !== 'approved' && decision !== 'rejected') {
            return res.status(400).json({
                result: 'failed',
                message: 'Decision must be approved or rejected.',
            });
        }

        if (
            decision === 'rejected' &&
            (
                typeof rejectionReason !== 'string' ||
                !rejectionReason.trim()
            )
        ) {
            return res.status(400).json({
                result: 'failed',
                message: 'Rejection reason is required.',
            });
        }

        const application = await Application.findOne({
            _id: applicationId,
            referentLecturer: user.userId,
        });

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        if (application.status !== 'bm_awaiting_lecturer_review') {
            return res.status(409).json({
                result: 'failed',
                message: 'This application is not awaiting lecturer review.',
            });
        }

        application.applicationReview.status = decision;
        application.applicationReview.reviewedBy = new mongoose.Types.ObjectId(user.userId);
        application.applicationReview.reviewedAt = new Date();
        application.applicationReview.rejectionReason =
            decision === 'rejected'
                ? rejectionReason.trim()
                : null;

        if (decision === 'approved') {
            application.status = 'bm_awaiting_staff_verification';
        }

        await application.save();

        return res.status(200).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error('Failed to review application:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const verifyPreDeparture = async (req: Request<{ applicationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const applicationId = req.params.applicationId;
        const verified = req.body.verified;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application ID.',
            });
        }

        if (verified !== true) {
            return res.status(400).json({
                result: 'failed',
                message: 'Verification confirmation is required.',
            });
        }

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        if (application.status !== 'bm_awaiting_staff_verification') {
            return res.status(409).json({
                result: 'failed',
                message: 'This application is not awaiting staff verification.',
            });
        }

        if (application.applicationReview.status !== 'approved') {
            return res.status(409).json({
                result: 'failed',
                message: 'The application has not been approved by the lecturer.',
            });
        }

        if (
            !application.academicYear ||
            !application.expectedMobilityPeriod ||
            !application.student ||
            !application.hostInstitution ||
            !application.referentLecturer ||
            application.examMappings.length === 0 ||
            !application.learningAgreement
        ) {
            return res.status(409).json({
                result: 'failed',
                message: 'The application is missing required pre-departure data.',
            });
        }

        application.status = 'bm_completed';

        await application.save();

        return res.status(200).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error('Failed to verify pre-departure application:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const updateMobilityDates = async (req: Request<{ applicationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const applicationId = req.params.applicationId;
        const hostUniversityArrivalDate = req.body.hostUniversityArrivalDate;
        const hostUniversityDepartureDate = req.body.hostUniversityDepartureDate;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application ID.',
            });
        }

        if (!hostUniversityArrivalDate && !hostUniversityDepartureDate) {
            return res.status(400).json({
                result: 'failed',
                message: 'At least one mobility date is required.',
            });
        }

        const arrivalDate = hostUniversityArrivalDate ? new Date(hostUniversityArrivalDate) : undefined;
        const departureDate = hostUniversityDepartureDate ? new Date(hostUniversityDepartureDate) : undefined;

        if (arrivalDate && Number.isNaN(arrivalDate.getTime())) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid arrival date.',
            });
        }

        if (departureDate && Number.isNaN(departureDate.getTime())) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid departure date.',
            });
        }

        const application = await Application.findOne({
            _id: applicationId,
            student: user.userId,
        });

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        if (application.status !== 'bm_completed' && application.status !== 'dm_in_progress') {
            return res.status(409).json({
                result: 'failed',
                message: 'Mobility dates cannot be updated in the current application status.',
            });
        }

        const finalArrivalDate = arrivalDate ?? application.hostUniversityArrivalDate ?? undefined;
        const finalDepartureDate = departureDate ?? application.hostUniversityDepartureDate ?? undefined;

        if (finalDepartureDate && !finalArrivalDate) {
            return res.status(400).json({
                result: 'failed',
                message: 'Arrival date is required before the departure date.',
            });
        }

        if (finalArrivalDate && finalDepartureDate && finalDepartureDate < finalArrivalDate) {
            return res.status(400).json({
                result: 'failed',
                message: 'Departure date cannot be earlier than arrival date.',
            });
        }

        if (arrivalDate) {
            application.hostUniversityArrivalDate = arrivalDate;
        }

        if (departureDate) {
            application.hostUniversityDepartureDate = departureDate;
        }

        if (finalDepartureDate) {
            application.status = 'am_awaiting_transcript_upload';
        } else if (finalArrivalDate) {
            application.status = 'dm_in_progress';
        }

        await application.save();

        return res.status(200).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error('Failed to update mobility dates:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const submitExamResults = async (req: Request<{ applicationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const applicationId = req.params.applicationId;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application ID.',
            });
        }

        if (typeof req.body.examMappings !== 'string') {
            return res.status(400).json({
                result: 'failed',
                message: 'Exam mappings are required.',
            });
        }

        let examMappings: unknown;

        try {
            examMappings = JSON.parse(req.body.examMappings);
        } catch {
            return res.status(400).json({
                result: 'failed',
                message: 'Exam mappings must be valid JSON.',
            });
        }

        if (!Array.isArray(examMappings) || examMappings.length === 0) {
            return res.status(400).json({
                result: 'failed',
                message: 'At least one exam mapping is required.',
            });
        }

        const hasIncompleteResult = examMappings.some((mapping) => {
            if (
                typeof mapping !== 'object' ||
                mapping === null ||
                !('result' in mapping)
            ) {
                return true;
            }

            const result = mapping.result;

            if (
                typeof result !== 'object' ||
                result === null
            ) {
                return true;
            }

            const score =
                'score' in result
                    ? result.score
                    : undefined;

            const examDate =
                'examDate' in result
                    ? result.examDate
                    : undefined;

            return (
                typeof score !== 'string' ||
                !score.trim() ||
                typeof examDate !== 'string' ||
                Number.isNaN(new Date(examDate).getTime())
            );
        });

        if (hasIncompleteResult) {
            return res.status(400).json({
                result: 'failed',
                message: 'Every exam mapping must include a valid score and exam date.',
            });
        }

        const application = await Application.findOne({
            _id: applicationId,
            student: user.userId,
        });

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        const canSubmit =
            application.status === 'am_awaiting_transcript_upload' ||
            (
                application.status === 'am_awaiting_lecturer_review' &&
                application.examReview.status === 'rejected'
            );

        if (!canSubmit) {
            return res.status(409).json({
                result: 'failed',
                message: 'Exam results cannot be submitted in the current application status.',
            });
        }

        if (!req.file && !application.transcriptOfRecords) {
            return res.status(400).json({
                result: 'failed',
                message: 'Transcript of Records file is required.',
            });
        }

        application.set('examMappings', examMappings);

        if (req.file) {
            application.transcriptOfRecords = {
                filename: req.file.filename,
                path: req.file.path,
                uploadedAt: new Date(),
            };
        }

        application.examReview.status = 'pending';
        application.examReview.reviewedBy = null;
        application.examReview.reviewedAt = null;
        application.examReview.rejectionReason = null;
        application.status = 'am_awaiting_lecturer_review';

        await application.save();

        return res.status(200).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error('Failed to submit exam results:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const reviewExamResults = async (req: Request<{ applicationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const applicationId = req.params.applicationId;
        const decision = req.body.decision;
        const rejectionReason = req.body.rejectionReason;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application ID.',
            });
        }

        if (decision !== 'approved' && decision !== 'rejected') {
            return res.status(400).json({
                result: 'failed',
                message: 'Decision must be approved or rejected.',
            });
        }

        if (
            decision === 'rejected' &&
            (
                typeof rejectionReason !== 'string' ||
                !rejectionReason.trim()
            )
        ) {
            return res.status(400).json({
                result: 'failed',
                message: 'Rejection reason is required.',
            });
        }

        const application = await Application.findOne({
            _id: applicationId,
            referentLecturer: user.userId,
        });

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        if (application.status !== 'am_awaiting_lecturer_review') {
            return res.status(409).json({
                result: 'failed',
                message: 'This application is not awaiting exam review.',
            });
        }

        if (application.examReview.status !== 'pending') {
            return res.status(409).json({
                result: 'failed',
                message: 'The exam results are not pending review.',
            });
        }

        if (!application.transcriptOfRecords) {
            return res.status(409).json({
                result: 'failed',
                message: 'Transcript of Records has not been uploaded.',
            });
        }

        const hasIncompleteResult = application.examMappings.some((mapping) => {
            return (
                !mapping.result?.score ||
                !mapping.result?.examDate
            );
        });

        if (hasIncompleteResult) {
            return res.status(409).json({
                result: 'failed',
                message: 'Every exam mapping must include a score and exam date.',
            });
        }

        application.examReview.status = decision;
        application.examReview.reviewedBy = new mongoose.Types.ObjectId(user.userId);
        application.examReview.reviewedAt = new Date();
        application.examReview.rejectionReason =
            decision === 'rejected'
                ? rejectionReason.trim()
                : null;

        if (decision === 'approved') {
            application.status = 'am_awaiting_staff_verification';
        }

        await application.save();

        return res.status(200).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error('Failed to review exam results:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const updateApplication = async (req: Request<{ applicationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const applicationId = req.params.applicationId;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (
            user.role !== 'lecturer'
            && user.role !== 'office_staff'
        ) {
            return res.status(403).json({
                result: 'failed',
                message: 'Only lecturers and Overseas Office staff can directly modify applications.',
            });
        }

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application ID.',
            });
        }

        const applicationQuery =
            user.role === 'lecturer'
                ? {
                    _id: applicationId,
                    referentLecturer: user.userId,
                }
                : {
                    _id: applicationId,
                };

        const application = await Application.findOne(
            applicationQuery
        );

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        const previousData = {
            academicYear:
                application.academicYear,

            expectedMobilityPeriod:
                application.expectedMobilityPeriod,

            hostInstitution:
                application.hostInstitution.toString(),

            referentLecturer:
                application.referentLecturer.toString(),

            hostUniversityArrivalDate:
                application.hostUniversityArrivalDate
                ?? null,

            hostUniversityDepartureDate:
                application.hostUniversityDepartureDate
                ?? null,

            examMappings:
                JSON.parse(
                    JSON.stringify(
                        application.examMappings
                    )
                ),

            learningAgreement:
                application.learningAgreement
                    ? JSON.parse(
                        JSON.stringify(
                            application.learningAgreement
                        )
                    )
                    : null,

            transcriptOfRecords:
                application.transcriptOfRecords
                    ? JSON.parse(
                        JSON.stringify(
                            application.transcriptOfRecords
                        )
                    )
                    : null,
        };

        const academicYear =
            req.body.academicYear;

        const expectedMobilityPeriod =
            req.body.expectedMobilityPeriod;

        const hostInstitution =
            req.body.hostInstitution;

        const referentLecturer =
            req.body.referentLecturer;

        const hostUniversityArrivalDate =
            req.body.hostUniversityArrivalDate;

        const hostUniversityDepartureDate =
            req.body.hostUniversityDepartureDate;

        if (academicYear !== undefined) {
            if (
                typeof academicYear !== 'string'
                || !/^\d{4}\/\d{4}$/.test(academicYear)
            ) {
                return res.status(400).json({
                    result: 'failed',
                    message: 'Academic year must be in YYYY/YYYY format.',
                });
            }

            application.academicYear =
                academicYear;
        }

        if (expectedMobilityPeriod !== undefined) {
            if (
                expectedMobilityPeriod !== 'first_semester'
                && expectedMobilityPeriod !== 'second_semester'
                && expectedMobilityPeriod !== 'full_year'
            ) {
                return res.status(400).json({
                    result: 'failed',
                    message: 'Invalid expected mobility period.',
                });
            }

            application.expectedMobilityPeriod =
                expectedMobilityPeriod;
        }

        if (hostInstitution !== undefined) {
            if (
                typeof hostInstitution !== 'string'
                || !mongoose.isValidObjectId(
                    hostInstitution
                )
            ) {
                return res.status(400).json({
                    result: 'failed',
                    message: 'Invalid host institution.',
                });
            }

            application.hostInstitution =
                new mongoose.Types.ObjectId(
                    hostInstitution
                );
        }

        if (referentLecturer !== undefined) {
            if (
                typeof referentLecturer !== 'string'
                || !mongoose.isValidObjectId(
                    referentLecturer
                )
            ) {
                return res.status(400).json({
                    result: 'failed',
                    message: 'Invalid referent lecturer.',
                });
            }

            application.referentLecturer =
                new mongoose.Types.ObjectId(
                    referentLecturer
                );
        }

        if (req.body.examMappings !== undefined) {
            if (
                typeof req.body.examMappings
                !== 'string'
            ) {
                return res.status(400).json({
                    result: 'failed',
                    message: 'Exam mappings must be valid JSON.',
                });
            }

            let examMappings: unknown;

            try {
                examMappings = JSON.parse(
                    req.body.examMappings
                );
            } catch {
                return res.status(400).json({
                    result: 'failed',
                    message: 'Exam mappings must be valid JSON.',
                });
            }

            if (
                !Array.isArray(examMappings)
                || examMappings.length === 0
            ) {
                return res.status(400).json({
                    result: 'failed',
                    message: 'At least one exam mapping is required.',
                });
            }

            application.set(
                'examMappings',
                examMappings
            );
        }

        let arrivalDate:
            | Date
            | null
            | undefined;

        let departureDate:
            | Date
            | null
            | undefined;

        if (
            hostUniversityArrivalDate
            !== undefined
        ) {
            if (
                hostUniversityArrivalDate === ''
                || hostUniversityArrivalDate === null
            ) {
                arrivalDate = null;
            } else {
                arrivalDate =
                    new Date(
                        hostUniversityArrivalDate
                    );

                if (
                    Number.isNaN(
                        arrivalDate.getTime()
                    )
                ) {
                    return res.status(400).json({
                        result: 'failed',
                        message: 'Invalid arrival date.',
                    });
                }
            }
        }

        if (
            hostUniversityDepartureDate
            !== undefined
        ) {
            if (
                hostUniversityDepartureDate === ''
                || hostUniversityDepartureDate === null
            ) {
                departureDate = null;
            } else {
                departureDate =
                    new Date(
                        hostUniversityDepartureDate
                    );

                if (
                    Number.isNaN(
                        departureDate.getTime()
                    )
                ) {
                    return res.status(400).json({
                        result: 'failed',
                        message: 'Invalid departure date.',
                    });
                }
            }
        }

        const finalArrivalDate =
            arrivalDate !== undefined
                ? arrivalDate
                : application.hostUniversityArrivalDate;

        const finalDepartureDate =
            departureDate !== undefined
                ? departureDate
                : application.hostUniversityDepartureDate;

        if (
            finalDepartureDate
            && !finalArrivalDate
        ) {
            return res.status(400).json({
                result: 'failed',
                message: 'Arrival date is required before the departure date.',
            });
        }

        if (
            finalArrivalDate
            && finalDepartureDate
            && finalDepartureDate
                < finalArrivalDate
        ) {
            return res.status(400).json({
                result: 'failed',
                message: 'Departure date cannot be earlier than arrival date.',
            });
        }

        if (arrivalDate !== undefined) {
            application.hostUniversityArrivalDate =
                arrivalDate;
        }

        if (departureDate !== undefined) {
            application.hostUniversityDepartureDate =
                departureDate;
        }

        const files = req.files as
            | {
                [fieldname: string]:
                    Express.Multer.File[];
            }
            | undefined;

        const learningAgreementFile =
            files?.['learningAgreement']?.[0];

        const transcriptFile =
            files?.['transcriptOfRecords']?.[0];

        if (learningAgreementFile) {
            application.learningAgreement = {
                filename:
                    learningAgreementFile.filename,
                path:
                    learningAgreementFile.path,
                uploadedAt:
                    new Date(),
            };
        }

        if (transcriptFile) {
            application.transcriptOfRecords = {
                filename:
                    transcriptFile.filename,
                path:
                    transcriptFile.path,
                uploadedAt:
                    new Date(),
            };
        }

        await application.save();

        const updatedData = {
            academicYear:
                application.academicYear,

            expectedMobilityPeriod:
                application.expectedMobilityPeriod,

            hostInstitution:
                application.hostInstitution.toString(),

            referentLecturer:
                application.referentLecturer.toString(),

            hostUniversityArrivalDate:
                application.hostUniversityArrivalDate
                ?? null,

            hostUniversityDepartureDate:
                application.hostUniversityDepartureDate
                ?? null,

            examMappings:
                JSON.parse(
                    JSON.stringify(
                        application.examMappings
                    )
                ),

            learningAgreement:
                application.learningAgreement
                    ? JSON.parse(
                        JSON.stringify(
                            application.learningAgreement
                        )
                    )
                    : null,

            transcriptOfRecords:
                application.transcriptOfRecords
                    ? JSON.parse(
                        JSON.stringify(
                            application.transcriptOfRecords
                        )
                    )
                    : null,
        };

        const fieldLabels: Record<
            keyof typeof previousData,
            string
        > = {
            academicYear:
                'Academic Year',

            expectedMobilityPeriod:
                'Expected Mobility Period',

            hostInstitution:
                'Host Institution',

            referentLecturer:
                'Referent Lecturer',

            hostUniversityArrivalDate:
                'Arrival Date',

            hostUniversityDepartureDate:
                'Departure Date',

            examMappings:
                'Exam Mappings',

            learningAgreement:
                'Learning Agreement',

            transcriptOfRecords:
                'Transcript of Records',
        };

        const changedFieldKeys = (
            Object.keys(
                fieldLabels
            ) as Array<
                keyof typeof previousData
            >
        ).filter((field) => {
            const previousValue =
                previousData[field];

            const updatedValue =
                updatedData[field];

            return (
                JSON.stringify(previousValue)
                !== JSON.stringify(updatedValue)
            );
        });

        if (changedFieldKeys.length > 0) {
            const changedFields =
                changedFieldKeys.map(
                    (field) =>
                        fieldLabels[field]
                );

            const previousChangedData:
                Record<string, unknown> = {};

            const updatedChangedData:
                Record<string, unknown> = {};

            for (
                const field
                of changedFieldKeys
            ) {
                previousChangedData[field] =
                    previousData[field];

                updatedChangedData[field] =
                    updatedData[field];
            }

            await ApplicationChangeLog.create({
                application:
                    application._id,

                changedBy:
                    new mongoose.Types.ObjectId(
                        user.userId
                    ),

                changedByRole:
                    user.role,

                changedFields,

                previousData:
                    previousChangedData,

                updatedData:
                    updatedChangedData,
            });
        }

        return res.status(200).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error(
            'Failed to update application:',
            error
        );

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const closeApplication = async (req: Request<{ applicationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const applicationId = req.params.applicationId;
        const closed = req.body.closed;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid application ID.',
            });
        }

        if (closed !== true) {
            return res.status(400).json({
                result: 'failed',
                message: 'Closure confirmation is required.',
            });
        }

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        if (application.status !== 'am_awaiting_staff_verification') {
            return res.status(409).json({
                result: 'failed',
                message: 'This application is not awaiting final staff verification.',
            });
        }

        if (application.examReview.status !== 'approved') {
            return res.status(409).json({
                result: 'failed',
                message: 'The exam results have not been approved by the lecturer.',
            });
        }

        if (!application.transcriptOfRecords) {
            return res.status(409).json({
                result: 'failed',
                message: 'Transcript of Records has not been uploaded.',
            });
        }

        const hasIncompleteResult = application.examMappings.some((mapping) => {
            return (
                !mapping.result?.score ||
                !mapping.result?.examDate
            );
        });

        if (hasIncompleteResult) {
            return res.status(409).json({
                result: 'failed',
                message: 'Every exam mapping must include a score and exam date.',
            });
        }

        application.status = 'closed';

        await application.save();

        return res.status(200).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error('Failed to close application:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};