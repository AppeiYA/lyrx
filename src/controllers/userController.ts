import { type Request, type Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import userService, { type UserService } from "../services/userService";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import { error } from "console";

export class UserController {
  constructor(private readonly userSrv: UserService) {}
  public getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.user;
    const response = await this.userSrv.getUserProfile(userId);
    if (response instanceof NotFoundError) {
      return res.status(response.statusCode).json({ error: response?.message });
    }

    return res.status(200).json({
      message: "Profile Fetched Successfully",
      data: response,
    });
  };

  public getUserPublicProfile = async (req: Request, res: Response) => {
    const { username } = req.params;
    if (!username) {
      return res.status(404).json({
        message: "User not found",
        error: "No Username Provided",
      });
    }
    const response = await this.userSrv.getPublicProfile(username);

    if (response instanceof NotFoundError) {
      return res.status(response.statusCode).json({
        message: response.message,
        error: response.cause,
      });
    }

    return res.status(200).json({
      message: "User found",
      data: {
        username: response?.username,
        favorites: response?.favorites,
      },
    });
  };

  public updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.user;
    const payload = req.body;
    if (!userId) {
      return res.status(404).json({
        message: "Unauthorized",
      });
    }

    const response = await this.userSrv.updateProfile(userId, payload);
    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        message: response.message,
        error: response.cause,
      });
    }

    return res.status(201).json({
      message: "Update successful",
      data: {
        ...response.updatedUser,
      },
    });
  };
}

const userController = new UserController(userService);

export default userController;
