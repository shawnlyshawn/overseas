import express from "express";
import userController from '../controllers/user.controller';

const userRoutes = express.Router();

userRoutes.get('/me', userController);

export default userRoutes;