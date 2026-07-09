import mongoose from 'mongoose';

const { Schema } = mongoose;

const mobilityDatesSchema = new Schema(
    {
        arrivalDate: {
            type: Date,
        },
        departureDate: {
            type: Date,
        },
    },
    {
        _id: false,
    }
);

export default mobilityDatesSchema;