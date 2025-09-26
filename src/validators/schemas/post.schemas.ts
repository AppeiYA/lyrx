import Joi from "joi";

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export const itemTypes = ["post", "comment"] as const;
export type ItemType = typeof itemTypes[number];

export const PostSchema = Joi.object({
  post_content: Joi.string().required(),
  post_image: Joi.string().optional(),
  link: Joi.string().optional(),
});

export const LikeParamSchema = Joi.object({
  item_id: Joi.string()
    .guid({ version: ["uuidv4", "uuidv5"] }) // validates UUID
    .required(),
  item_type: Joi.string().required()
});

export const CommentSchema = Joi.object({
  comment_content: Joi.string().required(),
  link: Joi.string().optional(),
});
