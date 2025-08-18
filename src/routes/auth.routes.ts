import express from 'express';
import { type Router, type Request, type Response } from 'express';
import { AuthController } from '../controllers/authController';
import { validate, loginSchema, SignUpSchema } from '../middlewares/JoiValidate';

const authRouter: Router = express.Router();

authRouter.post('/login', validate(loginSchema), AuthController.signin)
authRouter.post('/signup', validate(SignUpSchema), AuthController.signup)

export default authRouter;