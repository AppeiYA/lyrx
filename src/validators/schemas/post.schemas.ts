import Joi from "joi";

export const PostSchema = Joi.object({
    post_content : Joi.string().required(),
    post_image: Joi.string().optional(),
    link: Joi.string().optional()
});