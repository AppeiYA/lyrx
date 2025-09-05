import Joi from "joi";

export const UpdateProfileSchema = Joi.object({
  username: Joi.string().optional(),
})