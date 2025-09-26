import type { UUID } from "crypto";
import dal from "../config/dal";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import type { CommentDto } from "./post.dto";

export interface PostService {
  createPost(
    userId: string,
    postContent: string,
    post_image?: string,
    links?: string
  ): Promise<void | BadException | NotFoundError>;
  likeItem(
    userId: string,
    item_id: UUID,
    item_type: "post" | "comment"
  ): Promise<any | BadException | NotFoundError>;
  commentOnItem(
    payload: CommentDto
  ): Promise<any | BadException | NotFoundError>;
}

export class PostServiceImpl implements PostService {
  async createPost(
    userId: string,
    postContent: string,
    post_image?: string,
    links?: string
  ): Promise<void | BadException | NotFoundError> {
    // check if user exists in db
    const user = await dal.One(
      `SELECT username FROM users 
      WHERE id = $1`,
      [userId]
    );
    if (user instanceof NotFoundError) {
      return new NotFoundError("User not found");
    }

    // if user exists, create post
    const post = await dal.None(
      `INSERT INTO posts(user_id, content, post_image, link)
      VALUES ($1, $2, $3, $4)`,
      [userId, postContent, post_image || "", links || ""]
    );

    if (post instanceof BadException) {
      return new BadException("Error making post");
    }
  }

  async likeItem(
    userId: string,
    item_id: UUID,
    item_type: "post" | "comment"
  ): Promise<Number | BadException | NotFoundError> {
    // check if user exists
    const user = await dal.One(
      `SELECT username 
      FROM users 
      WHERE id = $1`,
      [userId]
    );

    if (user instanceof NotFoundError) {
      return new NotFoundError("User not found");
    }

    // check if item exists. if it does, like
    const item = await dal.One(
      `SELECT id 
        FROM ${item_type}s 
        WHERE id = $1`,
      [item_id]
    );

    if (item instanceof NotFoundError) {
      return new NotFoundError("Liked Item does not exist");
    }

    await dal.None(
      `INSERT INTO likes (item_id, user_id, item_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (item_id, user_id, item_type) DO NOTHING`,
      [item_id, userId, item_type]
    );

    // return updated number of likes
    var result = await dal.One(
      `SELECT COUNT(*) AS total_likes
      FROM likes
      WHERE item_id = $1`,
      [item_id]
    );

    return parseInt(result.total_likes, 10);
  }

  async commentOnItem(
    payload: CommentDto
  ): Promise<any | BadException | NotFoundError> {
    try {
      // check if item exists
      await dal.One(
        `SELECT * FROM ${payload.item_type}s
      WHERE id = $1`,
        [payload.item_id]
      );

      // if item exists
      // comment on item
      const comment = await dal.One(
        `INSERT INTO comments (user_id, item_id, item_type, content, link)
          VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          payload.userId,
          payload.item_id,
          payload.item_type,
          payload.comment_content,
          payload.link || null,
        ]
      );

      if (comment instanceof BadException) {
        return new BadException(comment.message);
      }

      console.log(comment);
      return comment;
      
    } catch (err) {
      if (err instanceof NotFoundError) {
        return new NotFoundError(err.message);
      } else {
        console.log("Error", err);
        return new BadException("An error occured on server");
      }
    }
  }
}

const postService = new PostServiceImpl();
export default postService;
