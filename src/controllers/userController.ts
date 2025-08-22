import { type Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import userService, { type UserService } from "../services/userService";
import { NotFoundError } from "../error/ErrorTypes";

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
    })
  };
}

const userController = new UserController(userService);

export default userController;
