import express, { type Router } from "express";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import userController, { UserController } from "../controllers/userController";
import { validate } from "../validators/Validate";
import {
  AddToFavoriteSchema,
  UpdateProfileSchema,
} from "../validators/schemas/UserSchemas";

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
// add song to favorites
userRouter.post(
  "/add-favorite",
  AuthMiddleware,
  validate(AddToFavoriteSchema),
  userController.addFavorite
);
// follow user
userRouter.post("/:target_user_id/followers", AuthMiddleware, userController.followUser);
userRouter.delete("/:target_user_id/followers", AuthMiddleware, userController.unfollowUser)

export default userRouter;
