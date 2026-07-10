import express from "express";

import { authenticate, authorize } from '../middlewares/auth.middleware';
import userController from '../controllers/user.controller';

const userRoutes = express.Router();

userRoutes.get(
    '/me',
    authenticate,
    authorize('student', 'lecturer', 'office_staff'),
    userController
);

export default userRoutes;