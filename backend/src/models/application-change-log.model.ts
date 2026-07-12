import mongoose from 'mongoose';

const { Schema, SchemaTypes, model } = mongoose;

const applicationChangeLogSchema = new Schema(
    {
        application: {
            type: SchemaTypes.ObjectId,
            ref: 'Application',
            required: true,
        },

        changedBy: {
            type: SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },

        changedByRole: {
            type: String,
            enum: [
                'lecturer',
                'office_staff',
            ],
            required: true,
        },

        changedFields: {
            type: [String],
            required: true,
            validate: {
                validator: (value: string[]) =>
                    Array.isArray(value) && value.length > 0,
                message: 'At least one changed field is required.',
            },
        },

        previousData: {
            type: SchemaTypes.Mixed,
            required: true,
        },

        updatedData: {
            type: SchemaTypes.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const ApplicationChangeLog = model(
    'ApplicationChangeLog',
    applicationChangeLogSchema,
    'applicationChangeLogs'
);

export default ApplicationChangeLog;