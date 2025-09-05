import express from 'express';
import { type Router} from 'express';
import authController from '../controllers/authController';
import { loginSchema, SignUpSchema } from '../validators/schemas/AuthSchemas';
import { validate } from '../validators/Validate';

const authRouter: Router = express.Router();

authRouter.post('/login', validate(loginSchema), authController.signin)
authRouter.post('/signup', validate(SignUpSchema), authController.signup)
authRouter.get('/refreshToken', authController.refreshToken)
authRouter.post('/logout', authController.logout)

export default authRouter;