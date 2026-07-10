import express from "express";
import multer from "multer";

import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getApplications, getApplicationDetail, createNewApplication, updateApplication } from '../controllers/application.controller';

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

// main pages - application lists
applicationRoutes.get(
    '/',
    authenticate,
    getApplications
);

// application detail
applicationRoutes.get(
    '/:applicationId',
    authenticate,
    getApplicationDetail
);

// create new application
applicationRoutes.post(
    '/',
    authenticate,
    authorize('student'),
    upload.single('learningAgreement'),
    createNewApplication
);

// Update Application (form, la file, tor file)
applicationRoutes.patch(
    '/:applicationId',
    authenticate,
    upload.fields([
        { name: 'learningAgreement', maxCount: 1 },
        { name: 'transcriptOfRecords', maxCount: 1 },
    ]),
    updateApplication
);

export default applicationRoutes;