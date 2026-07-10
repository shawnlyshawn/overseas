import express from "express";

import { authenticate } from '../middlewares/auth.middleware';
import { getHostInstitutions } from '../controllers/host-institution.controller';

const hostInstitutionRoutes = express.Router();

hostInstitutionRoutes.get(
    '/',
    authenticate,
    getHostInstitutions
);

export default hostInstitutionRoutes;