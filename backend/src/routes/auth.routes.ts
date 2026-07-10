import express from "express";
import { login } from '../controllers/auth.controller';

const authRoutes = express.Router();

// auth-middleware test
import { authenticate, authorize } from '../middlewares/auth.middleware';

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

authRoutes.post('/login', login);

export default authRoutes;