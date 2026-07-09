import mongoose from 'mongoose';

import examMappingSchema from './schemas/exam-mapping.schema';
import fileSchema from './schemas/file.schema';
import mobilityDatesSchema from './schemas/mobility-dates.schema';

const { Schema, SchemaTypes, model } = mongoose;

const applicationModificationLogSchema = new Schema(
    {
        modifiedBy: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        application: {
            type: SchemaTypes.ObjectId,
            ref: 'Application',
            required: true,
        },
        modificationReason: {
            type: String,
            minLength: 1,
            maxLength: 200,
            trim: true,
            default: null,
        },
        academicYear: { // frontend: dropdown bar
            type: String,
            required: true,
            trim: true,
            match: [/^\d{4}\/\d{4}$/, 'Academic year must be in YYYY/YYYY format.'],
        },
        expectedMobilityPeriod: {
            type: String,
            enum: [
                'first_semester',
                'second_semester',
                'full_year'
            ],
            required: true,
        },
        student: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        hostInstitution: {
            type: SchemaTypes.ObjectId,
            ref: 'HostInstitution',
            required: true,
        },
        referentLecturer: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        examMappings: {
            type: [examMappingSchema],
            required: true,
            validate: { // make sure to have at least one exam mapping
                validator: (value: unknown[]) =>
                    Array.isArray(value) && value.length > 0,
                message: 'At least one exam mapping is required.',
            },
        },
        learningAgreement: {
            file: {
                type: fileSchema,
            }
        },
        transcriptOfRecords: {
            file: {
                type: fileSchema,
            }
        },
        mobilityDates: {
            type: mobilityDatesSchema,
        },
        reviewStatus: {
            type: String,
            enum: [
                'pending',
                'approved',
                'rejected'
            ],
            required: true,
            default: 'pending',
        },
        rejectionReason: {
            type: String,
            minLength: 1,
            maxLength: 200,
            trim: true,
            default: null,
        },
        reviewDate: {
            type: Date,
            default: null,
        },
        phase: {
            type: String,
            enum: [
                'created',
                'awaiting_application_approval',
                'pre_departure_complete',
                'in_mobility',
                'awaiting_score_approval',
                'closed',
                'canceled'
            ],
            required: true,
        },
        preDepartureCompletedAt: {
            type: Date,
            default: null,
        },
        canceledAt: {
            type: Date,
            default: null,
        },
        closedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
)

const ApplicationModificationLog = model(
    'ApplicationModificationLog',
    applicationModificationLogSchema,
    'applicationModificationLogs'
);

export default ApplicationModificationLog;