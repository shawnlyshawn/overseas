import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const hostInstitutionSchema = new Schema(
    {
        name: {
            type: String,
            minLength: 1,
            maxLength: 100,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            minLength: 1,
            maxLength: 100,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            minLength: 1,
            maxLength: 100,
            required: true,
            trim: true,
        },
        availableSlots: {
            type: Number,
            required: true,
            min: 1,
        },
        applicationDeadline: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const HostInstitution = model(
    'HostInstitution',
    hostInstitutionSchema,
    'hostInstitutions'
);

export default HostInstitution;