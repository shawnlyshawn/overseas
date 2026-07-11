import mongoose from 'mongoose';

import examMappingSchema from './schemas/exam-mapping.schema';
import fileSchema from './schemas/file.schema';

const { Schema, SchemaTypes, model } = mongoose;

const modificationReviewSchema = new Schema(
    {
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

const applicationModificationSchema = new Schema(
    {   
        // which application's mod request?
        application: {
            type: SchemaTypes.ObjectId,
            ref: 'Application',
            required: true,
        },

        // request "STUDENT"
        requestedBy: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },

        description: {
            type: String,
            minLength: 1,
            maxLength: 500,
            required: true,
            trim: true,
        },

        // not approved yet
        proposedExamMappings: {
            type: [examMappingSchema],
            required: true,
            validate: {
                validator: (value: unknown[]) =>
                    Array.isArray(value) && value.length > 0,
                message: 'At least one proposed exam mapping is required.',
            },
        },

        // not approved yet
        proposedLearningAgreement: {
            type: fileSchema,
            required: true,
        },

        // lecturer's review
        review: {
            type: modificationReviewSchema,
            required: true,
            default: () => ({
                status: 'pending',
            }),
        },
    },
    {
        timestamps: true,
    }
);

const ApplicationModification = model(
    'ApplicationModification',
    applicationModificationSchema,
    'applicationModifications'
);

export default ApplicationModification;