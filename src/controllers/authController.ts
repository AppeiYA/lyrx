import { type Request, type Response } from "express";
import { AuthService } from "../services/authService";

export class AuthController {
  static async signin(req: Request, res: Response) {
    const formBody = req.body;
    const response = await AuthService.signin(formBody);

    if (response?.error) {
      return res.status(500).json({
        message: response?.message,
        error: response?.error,
      });
    }

    if (!response?.data) {
      return res.status(401).json({
        message: response?.message,
        error: "Invalid credentials",
      });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: true,
      maxAge: 24 * 60 * 60 * 1000,
      signed: true,
    };
    return res
      .status(200)
      .cookie("userId", response?.data?.id, cookieOptions)
      .json({
        message: response?.message,
        data: {
          id: response?.data?.id,
          username: response?.data?.username,
          email: response?.data?.email,
        },
      });
  }
  static async signup(req: Request, res: Response) {
    const formBody = req.body;
    const response = await AuthService.signup(formBody);

    if (response?.error) {
      return res.status(500).json({
        message: response?.message,
        error: response?.error,
      });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    return res
      .status(201)
      .cookie("userId", response?.data?.id)
      .json({
        messsage: response?.message,
        data: {
          username: response?.data?.username,
          email: response?.data?.email,
        },
      });
  }
}
