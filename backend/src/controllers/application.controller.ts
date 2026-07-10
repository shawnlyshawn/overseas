import type { Request, Response } from 'express';

import { findApplications, findApplicationById, createApplication, updateApplicationById } from '../services/application.service';

type ReviewStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';
type Phase = 'created' | 'awaiting_application_approval' | 'pre_departure_complete' | 'in_mobility' | 'awaiting_score_approval' | 'closed' | 'canceled';

export const getApplications = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        const reviewStatus = typeof req.query.reviewStatus === 'string' ? req.query.reviewStatus : undefined;

        const phases = typeof req.query.phases === 'string' ? req.query.phases.split(',') : undefined;

        const applications = await findApplications(
            user.userId,
            user.role,
            reviewStatus as ReviewStatus | undefined,
            phases as Phase[] | undefined
        );

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

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        const applicationId = req.params.applicationId;

        if (!applicationId) {
            return res.status(400).json({
                result: 'failed',
                message: 'Application ID is required.',
            });
        }

        const application = await findApplicationById(applicationId);

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        return res.status(200).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error('Failed to retrieve application detail:', error);

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

        const examMappings = JSON.parse(req.body.examMappings);

        if (!req.file) {
            return res.status(400).json({
                result: 'failed',
                message: 'Learning Agreement file is required.',
            });
        }

        const application = await createApplication(
            user.userId,
            {
                academicYear,
                hostInstitution,
                expectedMobilityPeriod,
                referentLecturer,
                examMappings,
                learningAgreement: {
                    file: {
                        filename: req.file.filename,
                        path: req.file.path,
                        uploadedAt: new Date(),
                    },
                },
            }
        );

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

        const updateData: Record<string, unknown> = {
            ...req.body,
        };

        if (typeof req.body.examMappings === 'string') {
            updateData.examMappings = JSON.parse(
                req.body.examMappings
            );
        }

        if (req.body.arrivalDate || req.body.departureDate) {
            updateData.mobilityDates = {
                arrivalDate: req.body.arrivalDate,
                departureDate: req.body.departureDate,
            };
        }

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        } | undefined;

        const learningAgreementFile =
            files?.learningAgreement?.[0];

        const transcriptFile =
            files?.transcriptOfRecords?.[0];

        if (learningAgreementFile) {
            updateData.learningAgreement = {
                file: {
                    filename: learningAgreementFile.filename,
                    path: learningAgreementFile.path,
                    uploadedAt: new Date(),
                },
            };
        }

        if (transcriptFile) {
            updateData.transcriptOfRecords = {
                file: {
                    filename: transcriptFile.filename,
                    path: transcriptFile.path,
                    uploadedAt: new Date(),
                },
            };
        }
        
        // 학생의 examMappings / LA / ToR 수정 차단
        const requiresReview =
            typeof req.body.examMappings === 'string' ||
            !!learningAgreementFile ||
            !!transcriptFile;

        if (user.role === 'student' && requiresReview) {
            return res.status(400).json({
                result: 'failed',
                message:
                    'This modification must be submitted as a modification request.',
            });
        }
        
        // reviewStatus Update authority check + reject reason 존재여부 check
        if (req.body.reviewStatus) {
            if (user.role !== 'lecturer') {
                return res.status(403).json({
                    result: 'failed',
                    message: 'Only lecturers can review applications.',
                });
            }

            if (req.body.reviewStatus !== 'approved' && req.body.reviewStatus !== 'rejected') {
                return res.status(400).json({
                    result: 'failed',
                    message: 'Invalid review status.',
                });
            }

            if (req.body.reviewStatus === 'rejected' && !req.body.rejectionReason
            ) {
                return res.status(400).json({
                    result: 'failed',
                    message: 'Rejection reason is required.',
                });
            }

            updateData.reviewStatus = req.body.reviewStatus;
            updateData.reviewDate = new Date();
            updateData.rejectionReason =
                req.body.reviewStatus === 'rejected'
                    ? req.body.rejectionReason
                    : null;
        }

        // application phase update authority check
        if (req.body.phase) {
            if (user.role !== 'office_staff') {
                return res.status(403).json({
                    result: 'failed',
                    message: 'Only office staff can update the application phase.',
                });
            }

            const existingApplication =
                await findApplicationById(applicationId);

            if (!existingApplication) {
                return res.status(404).json({
                    result: 'failed',
                    message: 'Application not found.',
                });
            }

            if (req.body.phase === 'pre_departure_complete') {
                const validCurrentPhase =
                    existingApplication.phase === 'created' ||
                    existingApplication.phase ===
                        'awaiting_application_approval';

                if (
                    existingApplication.reviewStatus !== 'approved' ||
                    !validCurrentPhase ||
                    !existingApplication.academicYear ||
                    !existingApplication.expectedMobilityPeriod ||
                    !existingApplication.student ||
                    !existingApplication.hostInstitution ||
                    !existingApplication.referentLecturer ||
                    existingApplication.examMappings.length === 0 ||
                    !existingApplication.learningAgreement?.file ||
                    !existingApplication.reviewDate
                ) {
                    return res.status(400).json({
                        result: 'failed',
                        message:
                            'Application is not ready for pre-departure completion.',
                    });
                }

                updateData.phase = 'pre_departure_complete';
                updateData.preDepartureCompletedAt = new Date();
            } else if (req.body.phase === 'closed') {
                if (
                    existingApplication.reviewStatus !== 'approved' ||
                    existingApplication.phase !==
                        'awaiting_score_approval' ||
                    !existingApplication.academicYear ||
                    !existingApplication.expectedMobilityPeriod ||
                    !existingApplication.student ||
                    !existingApplication.hostInstitution ||
                    !existingApplication.referentLecturer ||
                    existingApplication.examMappings.length === 0 ||
                    !existingApplication.learningAgreement?.file ||
                    !existingApplication.transcriptOfRecords?.file ||
                    !existingApplication.mobilityDates?.arrivalDate ||
                    !existingApplication.mobilityDates?.departureDate ||
                    !existingApplication.preDepartureCompletedAt
                ) {
                    return res.status(400).json({
                        result: 'failed',
                        message:
                            'Application is not ready to be closed.',
                    });
                }

                updateData.phase = 'closed';
                updateData.closedAt = new Date();
            } else {
                return res.status(400).json({
                    result: 'failed',
                    message: 'Invalid phase update.',
                });
            }
        }

        const application = await updateApplicationById(applicationId, updateData, user.userId);

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        return res.status(200).json({
            result: 'success',
            data: application,
        });
    } catch (error: unknown) {
        console.error('Failed to update application:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};