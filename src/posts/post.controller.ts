import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import type { PostService } from "./post.service";
import postService from "./post.service";
import { CommentDto, PostDto } from "./post.dto";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import { isUUID } from "../utils/isUUID";

export class PostController {
  constructor(private readonly postSrv: PostService) {}

  public createPost = async (req: AuthenticatedRequest, res: Response) => {
    const payload = new PostDto(req.body);
    const userId = req.user?.userId;

    const response = await this.postSrv.createPost(
      userId,
      payload.post_content,
      payload.post_image,
      payload.link
    );

    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        error: response.message,
        detail: response.name,
      });
    }

    if (response instanceof NotFoundError) {
      return res.status(response.statusCode).json({
        error: response.message,
        detail: response.name,
      });
    }

    return res.status(200).json({
      message: "Post created successfully",
    });
  };

  public likePost = async (req: AuthenticatedRequest, res: Response) => {
    const item_type = "post";
    const { post_id } = req.params;
    if (!post_id) {
      return res.status(400).json({
        error: "No item Id",
      });
    }

    if (!isUUID(post_id)) {
      return res.status(400).json({
        error: "invalid item_id",
      });
    }
    const userId = req.user?.userId;

    const response = await this.postSrv.likeItem(userId, post_id!, item_type);

    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        error: response.message,
      });
    }

    if (response instanceof NotFoundError) {
      return res.status(response.statusCode).json({
        error: response.message,
      });
    }

    return res.status(200).json({
      message: "Liked post",
      Likes: response,
    });
  };

  public commentOnPost = async (req: AuthenticatedRequest, res: Response) => {
    const payload = new CommentDto(req.body);
    const { userId } = req.user;
    const item_type: string = "post";
    const { post_id } = req.params;

    if (!post_id) {
      return res.status(400).json({
        error: "No item Id",
      });
    }

    if (!isUUID(post_id)) {
      return res.status(400).json({
        error: "invalid item_id",
      });
    }

    Object.assign(payload, {
      item_id: post_id,
      userId: userId,
      item_type: item_type,
    });

    const response = await this.postSrv.commentOnItem(payload);

    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        error: response.message,
      });
    }

    if (response instanceof NotFoundError) {
      return res.status(response.statusCode).json({
        error: response.message,
      });
    }

    return res.status(200).json({
      message: "Comment successful",
      comment: {
        ...response,
      },
    });
  };
}

const postController = new PostController(postService);
export default postController;
