import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "./adminAuth";
import type { AdminService } from "./admin.service";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import adminService from "./admin.service";

export class AdminController {
  constructor(private readonly adminSrv: AdminService) {}

  public getUsers = async (req: Request, res: Response) => {
    const response = await this.adminSrv.getUser();
    if (response instanceof NotFoundError) {
      return res.status(response.statusCode).json({
        message: response.message,
        error: response.cause,
      });
    }
    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        message: response.message,
      });
    }

    return res.status(200).json({
      users: response,
    });
  };
}

const adminController = new AdminController(adminService);
export default adminController;
