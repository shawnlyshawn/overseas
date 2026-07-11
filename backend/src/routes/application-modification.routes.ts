import express from "express";

import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getPendingApplicationModifications, getApplicationModificationDetail, reviewApplicationModification } from '../controllers/application-modification.controller';

const applicationModificationRoutes = express.Router();

applicationModificationRoutes.get(
    '/:logId',
    authenticate
);

applicationModificationRoutes.post(
    '/',
    authenticate
);

applicationModificationRoutes.patch(
    '/:logId', 
    authenticate
);

applicationModificationRoutes.get(
    '/:modificationId',
    authenticate,
    authorize('student', 'lecturer'),
    getApplicationModificationDetail
);

applicationModificationRoutes.patch(
    '/:modificationId/review',
    authenticate,
    authorize('lecturer'),
    reviewApplicationModification
);

applicationModificationRoutes.get(
    '/',
    authenticate,
    authorize('lecturer'),
    getPendingApplicationModifications
);

export default applicationModificationRoutes;