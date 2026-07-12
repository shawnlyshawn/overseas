import express from "express";
import multer from "multer";

import { authenticate, authorize } from '../middlewares/auth.middleware';
import { closeApplication, createNewApplication, getApplicationDetail, getApplications, reviewApplication, reviewExamResults, submitExamResults, updateMobilityDates, verifyPreDeparture, updateApplication } from '../controllers/application.controller';
import { createApplicationModification, getApplicationModificationsByApplication } from '../controllers/application-modification.controller';

const applicationRoutes = express.Router();
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

applicationRoutes.get(
    '/',
    authenticate,
    getApplications
);

applicationRoutes.get(
    '/:applicationId',
    authenticate,
    getApplicationDetail
);

applicationRoutes.post(
    '/',
    authenticate,
    authorize('student'),
    upload.single('learningAgreement'),
    createNewApplication
);

applicationRoutes.patch(
    '/:applicationId/application-review',
    authenticate,
    authorize('lecturer'),
    reviewApplication
);

applicationRoutes.patch(
    '/:applicationId/pre-departure-verification',
    authenticate,
    authorize('office_staff'),
    verifyPreDeparture
);

applicationRoutes.patch(
    '/:applicationId/mobility-dates',
    authenticate,
    authorize('student'),
    updateMobilityDates
);

applicationRoutes.post(
    '/:applicationId/application-modifications',
    authenticate,
    authorize('student'),
    upload.single('proposedLearningAgreement'),
    createApplicationModification
);

applicationRoutes.get(
    '/:applicationId/application-modifications',
    authenticate,
    authorize('student', 'lecturer'),
    getApplicationModificationsByApplication
);

applicationRoutes.patch(
    '/:applicationId',
    authenticate,
    authorize('lecturer', 'office_staff'),
    upload.fields([
        {
            name: 'learningAgreement',
            maxCount: 1,
        },
        {
            name: 'transcriptOfRecords',
            maxCount: 1,
        },
    ]),
    updateApplication
);

applicationRoutes.patch(
    '/:applicationId/exam-results',
    authenticate,
    authorize('student'),
    upload.single('transcriptOfRecords'),
    submitExamResults
);

applicationRoutes.patch(
    '/:applicationId/exam-review',
    authenticate,
    authorize('lecturer'),
    reviewExamResults
);

applicationRoutes.patch(
    '/:applicationId/closure',
    authenticate,
    authorize('office_staff'),
    closeApplication
);

export default applicationRoutes;