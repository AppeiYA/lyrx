import express, { Router } from 'express'
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import postController from './post.controller';
import { validate } from '../validators/Validate';
import { PostSchema } from '../validators/schemas/post.schemas';

const postRouter: Router = express.Router();

// create post
postRouter.post("/", AuthMiddleware, validate(PostSchema), postController.createPost)
// update post
// delete post
// like
// comment 
// get post 
// get all timeline posts
// get all comments

export default postRouter;