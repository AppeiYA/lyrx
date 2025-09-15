import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "./adminAuth";
import type { AdminService } from "./admin.service";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import adminService from "./admin.service";
import path from "path";
import fs from "fs";

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

  public postChart = async (req: Request, res: Response) => {
    const FILE_PATH = path.join("uploads", "top200.csv");
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ✅ Optional: read contents
    const fileContent = fs.readFileSync(FILE_PATH, "utf8");

    res.status(201).json({
      message: "CSV uploaded successfully",
      filename: req.file.filename,
      size: req.file.size,
      sample: fileContent.split("\n").slice(0, 2), // show first 2 lines
    });
  };
}

const adminController = new AdminController(adminService);
export default adminController;
