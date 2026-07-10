import express from "express";

import { authenticate } from '../middlewares/auth.middleware';
import { getCurrentUser } from '../controllers/user.controller';

const userRoutes = express.Router();

userRoutes.get(
    '/me',
    authenticate,
    getCurrentUser
);

export default userRoutes;