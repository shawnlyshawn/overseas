import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type UserRole = 'student'|'lecturer'|'office_staff';

interface JwtPayload {
    userId: string;
    role: UserRole;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
        return res.status(401).json({
            result: 'failed',
            message: 'Authentication is required.',
        });
    }

    const token = authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            result: 'failed',
            message: 'Authentication is required.',
        });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error('JWT_SECRET is not configured.');

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }

    try {
        const payload = jwt.verify(token, jwtSecret) as JwtPayload;

        req.user = {
            userId: payload.userId,
            role: payload.role,
        };

        next();
    } catch (error: unknown) {
        return res.status(401).json({
            result: 'failed',
            message: 'Invalid or expired token.',
        });
    }
};

export const authorize = (
    ...allowedRoles: UserRole[]
) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return res.status(401).json({
                result: 'failed',
                message: 'Authentication is required.',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                result: 'failed',
                message: 'Forbidden.',
            });
        }

        next();
    };
};