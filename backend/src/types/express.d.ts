declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: 'student' | 'lecturer' | 'office_staff';
            };
        }
    }
}

export {};