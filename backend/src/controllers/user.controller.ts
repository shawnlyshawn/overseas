import type { Request, Response } from 'express';

import { findUserById } from '../services/user.service';

export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        const user = await findUserById(userId);

        if (!user) {
            return res.status(404).json({
                result: 'failed',
                message: 'User not found.',
            });
        }

        return res.status(200).json({
            result: 'success',
            data: user
        })

    } catch (error: unknown) {
        console.error('Failed to retrieve current user:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
}