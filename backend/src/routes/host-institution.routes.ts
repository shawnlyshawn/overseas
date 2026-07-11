import express from 'express';

import { getHostInstitutions } from '../controllers/host-institution.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const hostInstitutionRoutes = express.Router();

hostInstitutionRoutes.get(
    '/',
    authenticate,
    authorize('student'),
    getHostInstitutions
);

export default hostInstitutionRoutes;