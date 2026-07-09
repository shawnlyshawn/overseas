import mongoose from 'mongoose';

const { Schema } = mongoose;

const resultSchema = new Schema(
    {
        score: {
            type: String,
            minLength: 1,
            maxLength: 10,
            trim: true,
        },
        examDate: {
            type: Date,
        },
    },
    {
        _id: false,
    }
);

const examMappingSchema = new Schema(
    {
        foreignCourseCode: {
            type: String,
            minLength: 1,
            maxLength: 20,
            required: true,
            trim: true,
        },
        foreignCourseName: {
            type: String,
            minLength: 1,
            maxLength: 50,
            required: true,
            trim: true,
        },
        foreignCourseCredits: {
            type: Number,
            min: 1,
            required: true,
        },
        caFoscariCourseCode: {
            type: String,
            minLength: 1,
            maxLength: 20,
            required: true,
            trim: true,
        },
        caFoscariCourseName: {
            type: String,
            minLength: 1,
            maxLength: 50,
            required: true,
            trim: true,
        },
        caFoscariCourseCredits: {
            type: Number,
            min: 1,
            required: true,
        },
        result: {
            type: resultSchema,
        },
    }
);

export default examMappingSchema;