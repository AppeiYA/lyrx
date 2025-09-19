import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import type { PostService } from "./post.service";
import postService from "./post.service";

export class PostController {
  constructor(private readonly postSrv: PostService) {}

  public createPost = async (req: AuthenticatedRequest, res: Response) => {
    return res.status(200).json({
      message: "Post created successfully",
    });
  };
}

const postController = new PostController(postService);
export default postController;
