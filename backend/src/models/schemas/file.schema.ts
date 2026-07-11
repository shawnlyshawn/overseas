import mongoose from 'mongoose';

const { Schema } = mongoose;

const fileSchema = new Schema(
    {
        filename: {
            type: String,
            minLength: 1,
            maxLength: 100,
            trim: true,
        },
        path: {
            type: String,
            minLength: 1,
            maxLength: 100,
            trim: true,
        },
        uploadedAt: {
            type: Date,
        },
    },
    {
     _id: false,
    }
);

export default fileSchema;