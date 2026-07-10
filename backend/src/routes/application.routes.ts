import express from "express";
import applicationController from '../controllers/application.controller';

const applicationRoutes = express.Router();

applicationRoutes.get('/', applicationController);
applicationRoutes.get('/:applicationId', applicationController);
/*
applicationRoutes.get('?reviewStatus=pending', applicationController);
*/

applicationRoutes.post('/', applicationController);

applicationRoutes.patch('/:applicationId', applicationController);


export default applicationRoutes;