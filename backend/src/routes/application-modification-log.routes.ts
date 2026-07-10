import express from "express";

import { authenticate } from '../middlewares/auth.middleware';
import {} from '../controllers/application-modification-log.controller';

const applicationModificationLogRoutes = express.Router();

/*
applicationModificationLogRoutes.get('?reviewStatus=pending', applicationModificationLogController);
*/
applicationModificationLogRoutes.get(
    '/:logId',
    authenticate,
    
);

applicationModificationLogRoutes.post(
    '/',
    authenticate,
    
);

applicationModificationLogRoutes.patch(
    '/:logId', 
    authenticate,
    
);

export default applicationModificationLogRoutes;