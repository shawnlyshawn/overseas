import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            minLength: 1,
            maxLength: 30,
            required: true,
            trim: true,
            lowercase: true,
        },
        lastName: {
            type: String,
            minLength: 1,
            maxLength: 30,
            required: true,
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: [
                'student',
                'lecturer',
                'office_staff'
            ],
            required: true,
        },
        department: {
            type: String,
            enum: [
                'department_of_economics',
                'department_of_philosophy_and_cultural_heritage',
                'venice_school_of_management',
                'department_of_environmental_sciences_informatics_and_statistics',
                'department_of_molecular_sciences_and_nanosystems',
                'department_of_linguistics_and_comparative_cultural_studies',
                'department_of_asian_and_north_african_studies',
                'department_of_humanities',
                'overseas_office'
            ],
            required: true,
        },
        matriculationNumber: {
            type: String,
            trim: true,
            required: function (this: { role: string }) {
                return this.role === 'student';
            }
        },
    },
    {
        timestamps: true, // automatically record createdAt, updatedAt with exact time
    }
);

const User = model(
    'User',
    userSchema,
    'users'
);

export default User;