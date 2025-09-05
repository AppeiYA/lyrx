import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const AdminMiddleware = async (
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
  if (!decoded) {
    return res.status(403).json({ error: "Unable to verify token" });
  }
  if (!decoded.valid || decoded.expired) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  const { role } = decoded?.decoded;
  if (!role) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  if (role != "admin") {
    return res
      .status(401)
      .json({
        error: "Unauthorized access",
        message: "User cannot access endpoint",
      });
  }
  req.user = decoded?.decoded;

  next();
};
