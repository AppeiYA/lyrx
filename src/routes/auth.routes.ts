import express from 'express';
import { type Router, type Request, type Response } from 'express';
import authController, { AuthController } from '../controllers/authController';
import { validate, loginSchema, SignUpSchema } from '../validators/JoiValidate';

const authRouter: Router = express.Router();

authRouter.post('/login', validate(loginSchema), authController.signin)
authRouter.post('/signup', validate(SignUpSchema), authController.signup)

export default authRouter;