import express, { type Router } from "express";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import userController, { UserController } from "../controllers/userController";
import { validate } from "../validators/Validate";
import { UpdateProfileSchema } from "../validators/schemas/UserSchemas";

const userRouter: Router = express.Router();

// fetch user profile
userRouter.get("/me", AuthMiddleware, userController.getUserProfile);

userRouter.post(
  "/me/update",
  AuthMiddleware,
  validate(UpdateProfileSchema),
  userController.updateProfile
);

// fetch other users profile (public)
userRouter.get(
  "/public/profile/:username",
  userController.getUserPublicProfile
);

export default userRouter;
