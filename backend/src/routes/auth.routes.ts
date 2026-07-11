import express from "express";

import { login, me } from '../controllers/auth.controller';
// auth-middleware test
import { authenticate, authorize } from '../middlewares/auth.middleware';

const authRoutes = express.Router();

authRoutes.post(
    '/login',
    login
);

authRoutes.get(
    '/me',
    authenticate,
    me
);

// auth-middleware test
authRoutes.get(
    '/test',
    authenticate,
    (req, res) => {
        return res.status(200).json({
            result: 'success',
            data: {
                message: 'Authentication successful.',
                user: req.user,
            },
        });
    }
);

authRoutes.get(
    '/staff-test',
    authenticate,
    authorize('office_staff'),
    (req, res) => {
        return res.status(200).json({
            result: 'success',
            data: {
                message: 'Office staff access granted.',
            },
        });
    }
);
// auth-middleware test

export default authRoutes;