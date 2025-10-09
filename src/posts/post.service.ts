import type { UUID } from "crypto";
import dal from "../config/dal";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import type { CommentDto } from "./post.dto";
import { time } from "console";

export interface PostService {
  createPost(
    userId: string,
    postContent: string,
    post_image?: string,
    links?: string
  ): Promise<any | BadException | NotFoundError>;
  likeItem(
    userId: string,
    item_id: UUID,
    item_type: "post" | "comment"
  ): Promise<any | BadException | NotFoundError>;
  unlikeItem(
    userId: string,
    item_id: UUID,
    item_type: "post" | "comment"
  ): Promise<any | BadException | NotFoundError>;
  commentOnItem(
    payload: CommentDto
  ): Promise<any | BadException | NotFoundError>;
  getTimelinePosts(userId: string): Promise<any | NotFoundError | BadException>;
}

export class PostServiceImpl implements PostService {
  async createPost(
    userId: string,
    postContent: string,
    post_image?: string,
    links?: string
  ): Promise<any | BadException | NotFoundError> {
    // check if user exists in db
    try {
      const user = await dal.One(
        `SELECT username FROM users 
      WHERE id = $1`,
        [userId]
      );
      if (user instanceof NotFoundError) {
        return new NotFoundError("User not found");
      }

      // if user exists, create post
      const post = await dal.One(
        `INSERT INTO posts(user_id, content, post_image, link)
      VALUES ($1, $2, $3, $4) RETURNING id`,
        [userId, postContent, post_image || "", links || ""]
      );

      if (post instanceof NotFoundError) {
        return new BadException(post.message);
      }

      const newPostId = post.id;
      const postDetails = await dal.One(
        `SELECT
        p.id, p.user_id, p.content, p.post_image, p.link, p.createdat, p.updatedat,
        json_build_object('id', u.id, 'username', u.username) AS "user",
        COALESCE(
            json_agg(
                json_build_object('id', l_user.id, 'username', l_user.username)
            ) FILTER (WHERE l.id IS NOT NULL),
            '[]'
        ) AS likes,
        CAST(COUNT(DISTINCT l.id) AS TEXT) AS likes_count,
        COALESCE(
            json_agg(
                json_build_object('id', c.id, 'content', c.content, 'user_id', c.user_id, 'createdAt', c."createdat")
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'
        ) AS comments
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.item_id
      LEFT JOIN users l_user ON l.user_id = l_user.id
      LEFT JOIN comments c ON p.id = c.item_id
      WHERE p.id = $1
      GROUP BY p.id, u.id, u.username`,
        [newPostId]
      );

      return postDetails;
    } catch (err) {
      if (err instanceof BadException) {
        return new BadException(err.message);
      } else {
        console.log("Error", err);
        return new BadException("Server side error");
      }
    }
  }

  async likeItem(
    userId: string,
    item_id: UUID,
    item_type: "post" | "comment"
  ): Promise<Number | BadException | NotFoundError> {
    // check if user exists
    try {
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
    } catch (err) {
      if (err instanceof BadException) {
        return new BadException(err.message);
      } else if (err instanceof NotFoundError) {
        return new NotFoundError(err.message);
      } else {
        console.log(err);
        return new BadException("Serer side error");
      }
    }
  }

  async unlikeItem(
    userId: string,
    item_id: UUID,
    item_type: "post" | "comment"
  ): Promise<any | BadException | NotFoundError> {
    try {
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

      // check if user already liked item
      const alreadyLiked = await dal.One(
        `SELECT EXISTS (
            SELECT 1
            FROM likes
            WHERE user_id = $1 AND item_id = $2
          );
        `,
        [userId, item_id]
      );
      if (alreadyLiked) {
        await dal.None(
          `DELETE FROM likes 
        WHERE user_id = $1 AND item_id = $2`,
          [userId, item_id]
        );
      }
      // return updated number of likes
      var result = await dal.One(
        `SELECT COUNT(*) AS total_likes
      FROM likes
      WHERE item_id = $1`,
        [item_id]
      );

      return parseInt(result.total_likes, 10);
    } catch (err) {
      if (err instanceof BadException) {
        return new BadException(err.message);
      } else if (err instanceof NotFoundError) {
        return new NotFoundError(err.message);
      } else {
        console.log(err);
        return new BadException("Serer side error");
      }
    }
  }

  async commentOnItem(
    payload: CommentDto
  ): Promise<any | BadException | NotFoundError> {
    try {
      // check if item exists
      const item = await dal.One(
        `SELECT * FROM ${payload.item_type}s
      WHERE id = $1`,
        [payload.item_id]
      );
      if (item instanceof NotFoundError) {
        return new NotFoundError("Item commented not found");
      }

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

      if (comment instanceof NotFoundError) {
        return new NotFoundError(comment.message);
      }

      return comment;
    } catch (err) {
      if (err instanceof NotFoundError) {
        return new NotFoundError(err.message);
      } else if (err instanceof BadException) {
        return new BadException(err.message);
      } else {
        console.log("Error", err);
        return new BadException("An error occured on server");
      }
    }
  }

  async getTimelinePosts(
    userId: string
  ): Promise<any | NotFoundError | BadException> {
    // get all posts (with their comments and likes) for all users following
    // including users post
    const timeLinePosts = await dal.OneOrMany(
      `SELECT p.*,
        JSON_BUILD_OBJECT(
        'id', u.id,
        'username', u.username
        ) AS user,
        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'id', lu.id,
              'username', lu.username
            )
          ) FILTER (WHERE l.user_id IS NOT NULL), '[]'
        ) AS likes,
        COUNT(DISTINCT l.user_id) AS likes_count,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
            'id', c.id,
            'content', c.content,
            'user_id', c.user_id,
            'createdAt', c.createdat
          )
        ) FILTER (WHERE c.id IS NOT NULL), '[]'
      ) AS comments
      FROM posts p
      JOIN follows f ON p.user_id = f.user_id
      LEFT JOIN likes l ON l.item_id = p.id
      LEFT JOIN users lu ON lu.id = l.user_id
      LEFT JOIN comments c ON c.item_id = p.id
      LEFT JOIN users u ON u.id = p.user_id
      WHERE f.follower_id = $1
      GROUP BY p.id, u.id, u.username 
      ORDER BY p.createdat DESC`,
      [userId]
    );

    if (timeLinePosts instanceof NotFoundError) {
      return new NotFoundError(timeLinePosts.message);
    }

    return timeLinePosts;
  }
}

const postService = new PostServiceImpl();
export default postService;
