import express from 'express';

import { getLecturers } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const userRoutes = express.Router();

userRoutes.get(
    '/lecturers',
    authenticate,
    authorize('student'),
    getLecturers
);

export default userRoutes;