import express, { type Router } from "express";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import userController, { UserController } from "../controllers/userController";

const userRouter: Router = express.Router();

userRouter.get("/profile", AuthMiddleware, userController.getUserProfile);

export default userRouter;
