import type { BadException } from "../error/ErrorTypes";

export interface PostService {
  createPost(
    userId: string,
    postContent: string,
    post_image?: string,
    links?: string
  ): Promise<void | BadException>;
}

export class PostServiceImpl implements PostService {
  async createPost(
    userId: string,
    postContent: string,
    post_image?: string,
    links?: string
  ): Promise<void | BadException> {
    console.log("HIT POST SERVICE");
  }
}

const postService = new PostServiceImpl();
export default postService;
