import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
// import jwt from "jsonwebtoken"

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const AuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  const decoded = verifyToken(token);
  if (decoded instanceof Error) {
    return res.status(403).json({ error: decoded.message });
  }
  req.user = decoded;
  next();
};
