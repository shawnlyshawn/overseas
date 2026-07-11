import mongoose from 'mongoose';

import examMappingSchema from './schemas/exam-mapping.schema';
import fileSchema from './schemas/file.schema';

const { Schema, SchemaTypes, model } = mongoose;

const applicationReviewSchema = new Schema(
    {
        // Application's status
        status: { 
            type: String,
            enum: [
                'pending',
                'approved',
                'rejected',
            ],
            required: true,
            default: 'pending',
        },
        reviewedBy: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        rejectionReason: {
            type: String,
            minLength: 1,
            maxLength: 200,
            trim: true,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const examReviewSchema = new Schema(
    {
        status: {
            type: String,
            enum: [
                'not_submitted',
                'pending',
                'approved',
                'rejected',
            ],
            required: true,
            default: 'not_submitted',
        },
        reviewedBy: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        rejectionReason: {
            type: String,
            minLength: 1,
            maxLength: 200,
            trim: true,
            default: null,
        },
    },
    {
        _id: false,
    }
);

const applicationSchema = new Schema(
    {
        student: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },

        referentLecturer: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },

        hostInstitution: {
            type: SchemaTypes.ObjectId,
            ref: 'HostInstitution',
            required: true,
        },

        academicYear: {
            type: String,
            required: true,
            trim: true,
            match: [
                /^\d{4}\/\d{4}$/,
                'Academic year must be in YYYY/YYYY format.',
            ],
        },

        expectedMobilityPeriod: {
            type: String,
            enum: [
                'first_semester',
                'second_semester',
                'full_year',
            ],
            required: true,
        },

        status: {
            type: String,
            enum: [
                'bm_awaiting_lecturer_review',
                'bm_awaiting_staff_verification',
                'bm_completed',
                'dm_in_progress',
                'am_awaiting_transcript_upload',
                'am_awaiting_lecturer_review',
                'am_awaiting_staff_verification',
                'closed',
            ],
            required: true,
            default: 'bm_awaiting_lecturer_review',
        },

        examMappings: {
            type: [examMappingSchema],
            required: true,
            validate: {
                validator: (value: unknown[]) =>
                    Array.isArray(value) && value.length > 0,
                message: 'At least one exam mapping is required.',
            },
        },

        learningAgreement: {
            type: fileSchema,
            required: true,
        },

        // Before Mobility, New Application's Review Result
        applicationReview: { 
            type: applicationReviewSchema,
            required: true,
            default: () => ({
                status: 'pending',
            }),
        },

        hostUniversityArrivalDate: {
            type: Date,
            default: null,
        },

        hostUniversityDepartureDate: {
            type: Date,
            default: null,
        },

        transcriptOfRecords: {
            type: fileSchema,
            default: null,
        },

        // After Mobility, Exam's Review Result
        examReview: {
            type: examReviewSchema,
            required: true,
            default: () => ({
                status: 'not_submitted',
            }),
        },
    },
    {
        timestamps: true,
    }
);

const Application = model(
    'Application',
    applicationSchema,
    'applications'
);

export default Application;