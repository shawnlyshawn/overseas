import 'dotenv/config'; // for local execution
import app from './app';
import connectDB from './config/database';

const PORT = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void>{
	try {
		await connectDB();

		app.listen(PORT, () => {
			console.log(`Backend running on port ${PORT}`);
		})
	} catch(error: unknown){
		console.error('Server startup error:', error);
		process.exit(1);
	}
};

void startServer();