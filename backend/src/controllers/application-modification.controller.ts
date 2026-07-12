import mongoose from 'mongoose';
import type { Request, Response } from 'express';

import Application from '../models/application.model';
import ApplicationModification from '../models/application-modification.model';

export const createApplicationModification = async (req: Request<{ applicationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const applicationId = req.params.applicationId;
        const description = req.body.description;

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

        if (typeof description !== 'string' || !description.trim()) {
            return res.status(400).json({
                result: 'failed',
                message: 'Modification description is required.',
            });
        }

        if (typeof req.body.proposedExamMappings !== 'string') {
            return res.status(400).json({
                result: 'failed',
                message: 'Proposed exam mappings are required.',
            });
        }

        let proposedExamMappings: unknown;

        try {
            proposedExamMappings = JSON.parse(req.body.proposedExamMappings);
        } catch {
            return res.status(400).json({
                result: 'failed',
                message: 'Proposed exam mappings must be valid JSON.',
            });
        }

        if (!Array.isArray(proposedExamMappings) || proposedExamMappings.length === 0) {
            return res.status(400).json({
                result: 'failed',
                message: 'At least one proposed exam mapping is required.',
            });
        }

        if (!req.file) {
            return res.status(400).json({
                result: 'failed',
                message: 'Updated Learning Agreement file is required.',
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

        if (application.status !== 'dm_in_progress') {
            return res.status(409).json({
                result: 'failed',
                message: 'Application modifications can only be submitted during mobility.',
            });
        }

        const pendingModification = await ApplicationModification.findOne({
            application: application._id,
            'review.status': 'pending',
        });

        if (pendingModification) {
            return res.status(409).json({
                result: 'failed',
                message: 'A pending application modification already exists.',
            });
        }

        const modification = await ApplicationModification.create({
            application: application._id,
            requestedBy: user.userId,
            description: description.trim(),
            proposedExamMappings,
            proposedLearningAgreement: {
                filename: req.file.filename,
                path: req.file.path,
                uploadedAt: new Date(),
            },
        });

        return res.status(201).json({
            result: 'success',
            data: modification,
        });
    } catch (error: unknown) {
        console.error('Failed to create application modification:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const getApplicationModificationsByApplication = async (req: Request<{ applicationId: string }>, res: Response) => {
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

        const applicationFilter: Record<string, unknown> = {
            _id: applicationId,
        };

        if (user.role === 'student') {
            applicationFilter.student = user.userId;
        } else if (user.role === 'lecturer') {
            applicationFilter.referentLecturer = user.userId;
        } else if (user.role === 'office_staff') {}

        const application = await Application.findOne(applicationFilter);

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        const modifications = await ApplicationModification.find({
            application: application._id,
        })
            .populate('requestedBy', '-password')
            .populate('review.reviewedBy', '-password')
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            result: 'success',
            data: modifications,
        });
    } catch (error: unknown) {
        console.error('Failed to retrieve application modifications:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const getApplicationModificationDetail = async (req: Request<{ modificationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const modificationId = req.params.modificationId;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!mongoose.isValidObjectId(modificationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid modification ID.',
            });
        }

        const modification = await ApplicationModification.findById(modificationId)
            .populate('requestedBy', '-password')
            .populate('review.reviewedBy', '-password');

        if (!modification) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application modification not found.',
            });
        }

        const applicationFilter: Record<string, unknown> = {
            _id: modification.application,
        };

        if (user.role === 'student') {
            applicationFilter.student = user.userId;
        } else if (user.role === 'lecturer') {
            applicationFilter.referentLecturer = user.userId;
        } else {};

        const application = await Application.findOne(applicationFilter);

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application modification not found.',
            });
        }

        return res.status(200).json({
            result: 'success',
            data: modification,
        });
    } catch (error: unknown) {
        console.error('Failed to retrieve application modification detail:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const reviewApplicationModification = async (req: Request<{ modificationId: string }>, res: Response) => {
    try {
        const user = req.user;
        const modificationId = req.params.modificationId;
        const decision = req.body.decision;
        const rejectionReason = req.body.rejectionReason;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!mongoose.isValidObjectId(modificationId)) {
            return res.status(400).json({
                result: 'failed',
                message: 'Invalid modification ID.',
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

        const modification = await ApplicationModification.findById(modificationId);

        if (!modification) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application modification not found.',
            });
        }

        if (modification.review.status !== 'pending') {
            return res.status(409).json({
                result: 'failed',
                message: 'This modification has already been reviewed.',
            });
        }

        const application = await Application.findOne({
            _id: modification.application,
            referentLecturer: user.userId,
        });

        if (!application) {
            return res.status(404).json({
                result: 'failed',
                message: 'Application not found.',
            });
        }

        if (application.status !== 'dm_in_progress') {
            return res.status(409).json({
                result: 'failed',
                message: 'This application is not currently in mobility.',
            });
        }

        if (decision === 'approved') {
            application.set(
                'examMappings',
                modification.proposedExamMappings
            );

            application.set(
                'learningAgreement',
                modification.proposedLearningAgreement
            );

            await application.save();
        }

        modification.review.status = decision;
        modification.review.reviewedBy = new mongoose.Types.ObjectId(user.userId);
        modification.review.reviewedAt = new Date();
        modification.review.rejectionReason =
            decision === 'rejected'
                ? rejectionReason.trim()
                : null;

        await modification.save();

        return res.status(200).json({
            result: 'success',
            data: {
                modification,
                application,
            },
        });
    } catch (error: unknown) {
        console.error('Failed to review application modification:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const getPendingApplicationModifications = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        const applications = await Application.find({
            referentLecturer: user.userId,
        }).select('_id');

        const applicationIds = applications.map((application) => application._id);

        const modifications = await ApplicationModification.find({
            application: {
                $in: applicationIds,
            },
            'review.status': 'pending',
        })
            .populate({
                path: 'application',
                populate: [
                    {
                        path: 'student',
                        select: 'firstName lastName matriculationNumber',
                    },
                    {
                        path: 'hostInstitution',
                        select: 'name country city',
                    },
                ],
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            result: 'success',
            data: modifications,
        });
    } catch (error: unknown) {
        console.error('Failed to retrieve application modifications:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};