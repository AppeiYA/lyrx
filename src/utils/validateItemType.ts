import type { NextFunction, Request, Response } from "express";
import { itemTypes, type ItemType } from "../validators/schemas/post.schemas";

export const validateItemTypes = (req: Request, res: Response, next: NextFunction) => {
  const { item_type } = req.params;

  if (!item_type) {
    return res.status(400).json({
      error: "An item type is required on this route",
    });
  }

  if (!itemTypes.includes(item_type as ItemType)) {
    return res.status(400).json({
      error: "Item type must be either post or comment",
    });
  }

  return next();
};
