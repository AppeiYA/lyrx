import express, { Router } from "express";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import postController from "./post.controller";
import { validate, validateLikeParam } from "../validators/Validate";
import {
  CommentSchema,
  LikeParamSchema,
  PostSchema,
} from "../validators/schemas/post.schemas";
import { validateItemTypes } from "../utils/validateItemType";

const postRouter: Router = express.Router();

// create post
postRouter.post(
  "/",
  AuthMiddleware,
  validate(PostSchema),
  postController.createPost
);
// update post
// delete post

// like
postRouter.post(
  "/:item_type/:item_id/like",
  AuthMiddleware,
  validateLikeParam(LikeParamSchema),
  validateItemTypes,
  postController.likeItem
);
// comment
postRouter.post(
  "/comment/:post_id",
  AuthMiddleware,
  validate(CommentSchema),
  postController.commentOnPost
);
// get post
// get all timeline posts
// get all comments

export default postRouter;
