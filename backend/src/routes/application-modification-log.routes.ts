import express from "express";
import applicationModificationLogController from '../controllers/application-modification-log.controller';

const applicationModificationLogRoutes = express.Router();

/*
applicationModificationLogRoutes.get('?reviewStatus=pending', applicationModificationLogController);
*/
applicationModificationLogRoutes.get('/:logId', applicationModificationLogController);

applicationModificationLogRoutes.post('/', applicationModificationLogController);

applicationModificationLogRoutes.patch('/:logId', applicationModificationLogController);

export default applicationModificationLogRoutes;