import express from "express";

import { authenticate, authorize } from '../middlewares/auth.middleware';
import applicationController from '../controllers/application.controller';

const applicationRoutes = express.Router();

applicationRoutes.get(
    '/',
    authenticate,
    authorize('student', 'lecturer', 'office_staff'),
    applicationController
);
applicationRoutes.get(
    '/:applicationId',
    authenticate,
    authorize('student', 'lecturer', 'office_staff'),
    applicationController
);
/*
applicationRoutes.get('?reviewStatus=pending', applicationController);
*/

applicationRoutes.post(
    '/',
    authenticate,
    authorize('student', 'lecturer', 'office_staff'),
    applicationController
);

applicationRoutes.patch(
    '/:applicationId',
    authenticate,
    authorize('student', 'lecturer', 'office_staff'),
    applicationController
);


export default applicationRoutes;