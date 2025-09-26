import type { UUID } from "crypto";

export class PostDto {
  post_content!: string;
  post_image?: string;
  link?: string;

  constructor(data: Partial<PostDto>) {
    Object.assign(this, data);
  }
}

export class CommentDto {
  comment_content!: string;
  post_image?: string;
  link?: string;
  userId?: string;
  item_type?: "post" | "comment";
  item_id?: UUID;

  constructor(data: Partial<PostDto>) {
    Object.assign(this, data);
  }
}
