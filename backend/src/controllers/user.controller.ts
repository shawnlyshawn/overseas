import type { Request, Response } from 'express';

import User from '../models/user.model';

export const getLecturers = async (_req: Request, res: Response) => {
    try {
        const lecturers = await User.find({
            role: 'lecturer',
        })
            .select('-password')
            .sort({
                lastName: 1,
                firstName: 1,
            });

        return res.status(200).json({
            result: 'success',
            data: lecturers,
        });
    } catch (error: unknown) {
        console.error('Get lecturers server error:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};