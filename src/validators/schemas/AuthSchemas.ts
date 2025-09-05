import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email(),
  password: Joi.string().required(),
}).xor("username", "email");

export const SignUpSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$")).required(),
});