import express from "express";
import hostInstitutionController from '../controllers/host-institution.controller';

const hostInstitutionRoutes = express.Router();

hostInstitutionRoutes.get('/', hostInstitutionController);

export default hostInstitutionRoutes;