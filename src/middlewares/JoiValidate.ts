import { error } from "console";
import type { NextFunction, Request, Response } from "express";
import Joi, { type ObjectSchema } from "joi";

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

export const validate =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    if (req.body) {
      const { error } = schema.validate(req.body);
      if (error) {
        console.log(error);
        return res.status(400).json({ error: error.message });
      }
      next();
    }else{
      return res.status(400).json({error: "Invalid body"});
    }
  };
