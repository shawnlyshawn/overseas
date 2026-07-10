import express from "express";

import { authenticate, authorize } from '../middlewares/auth.middleware';
import applicationModificationLogController from '../controllers/application-modification-log.controller';

const applicationModificationLogRoutes = express.Router();

/*
applicationModificationLogRoutes.get('?reviewStatus=pending', applicationModificationLogController);
*/
applicationModificationLogRoutes.get(
    '/:logId',
    authenticate,
    authorize('student', 'lecturer', 'office_staff'),
    applicationModificationLogController
);

applicationModificationLogRoutes.post(
    '/',
    authenticate,
    authorize('student', 'lecturer', 'office_staff'),
    applicationModificationLogController
);

applicationModificationLogRoutes.patch(
    '/:logId', 
    authenticate,
    authorize('student', 'lecturer', 'office_staff'),applicationModificationLogController
);

export default applicationModificationLogRoutes;