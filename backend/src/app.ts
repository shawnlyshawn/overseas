import cors from "cors";
import express from "express";

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import hostInstitutionRoutes from './routes/host-institution.routes';
import applicationRoutes from './routes/application.routes';
import applicationModificationRoutes from './routes/application-modification.routes';


const app = express();

// middlewears
app.use(cors());
app.use(express.json()); // json -> Object
app.use(express.urlencoded({extended: true}));

// BE connection check route
app.get('/api/health',
	(_req, res) => {
		res.json({ message: "Backend is running" });
	}
);

// routes
app.use(
	'/api/v1/auth',
	authRoutes
);
app.use(
	'/api/v1/users',
	userRoutes
);
app.use(
	'/api/v1/host-institutions',
	hostInstitutionRoutes
);
app.use(
	'/api/v1/applications',
	applicationRoutes
);
app.use(
	'/api/v1/application-modifications',
	applicationModificationRoutes
);

export default app;