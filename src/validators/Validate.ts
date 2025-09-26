import { error } from "console";
import type { NextFunction, Request, Response } from "express";
import Joi, { type ObjectSchema } from "joi";

export const validate =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
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
  

export const validateLikeParam = (schema: ObjectSchema) =>(req: Request, res: Response, next: NextFunction) =>{
const { error } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({ error: error?.details[0]?.message });
  }
  next();
}