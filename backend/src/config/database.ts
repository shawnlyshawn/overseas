import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/overseas';

async function connectDB(): Promise<void> {
	await mongoose.connect(MONGO_URI);
	console.log('MongoDB connected');
}

export default connectDB;