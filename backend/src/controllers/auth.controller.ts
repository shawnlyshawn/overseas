import type { Request, Response } from 'express';

import User from '../models/user.model';
import { loginUser, AuthenticationError } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        
        if (
            typeof email !== 'string' ||
            typeof password !== 'string'
        ) {
            return res.status(400).json({
                result: 'failed',
                message: 'Email and password must be strings.',
            });
        }
        if (
            !email.trim() ||
            !password.trim()
        ) {
            return res.status(400).json({
                result: 'failed',
                message: 'Email and password are required.',
            });
        }

        const loginResult = await loginUser(email, password);

        return res.status(200).json({
            result: 'success',
            data: loginResult,
        });
    } catch (error: unknown) {
        if (error instanceof AuthenticationError) {
            return res.status(401).json({
                result: 'failed',
                message: error.message,
            });
        }
        console.error('Login server error:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                result: 'failed',
                message: 'User not found.',
            });
        }

        return res.status(200).json({
            result: 'success',
            data: user,
        });
    } catch (error: unknown) {
        console.error('Current user server error:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};