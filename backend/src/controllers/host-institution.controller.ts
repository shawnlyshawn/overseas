import type { Request, Response } from 'express';

import { findHostInstitutions } from '../services/host-institution.service';

export const getHostInstitutions = async (_req: Request, res: Response) => {
    try{
        const hostInstitutions = await findHostInstitutions();

        return res.status(200).json({
                result: 'success',
                data: hostInstitutions
        })
    } catch (error: unknown) {
        console.error('Failed to retrieve host institutions:', error);
        return res.status(500).json({
            result: 'failed',
            message: 'Internal server error.',
        });
    }
};