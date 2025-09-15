import Joi from "joi";

export const UpdateProfileSchema = Joi.object({
  username: Joi.string().optional(),
})
export const AddToFavoriteSchema = Joi.object({
  spotifySongId: Joi.string().required()
})