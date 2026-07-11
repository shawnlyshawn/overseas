import type { Request, Response } from 'express';

import HostInstitution from '../models/host-institution.model';

export const getHostInstitutions = async (_req: Request, res: Response) => {
    try {
        const hostInstitutions = await HostInstitution.find().sort({
            country: 1,
            city: 1,
            name: 1,
        });

        return res.status(200).json({
            result: 'success',
            data: hostInstitutions,
        });
    } catch (error: unknown) {
        console.error('Get host institutions server error:', error);

        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};