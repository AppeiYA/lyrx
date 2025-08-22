import { type Request, type Response } from "express";
import authService, { type AuthService } from "../services/authService";
import { BadException, NotFoundError } from "../error/ErrorTypes";

export class AuthController {
  constructor(private readonly authSrv: AuthService) {}
  public signin = async (req: Request, res: Response) => {
    const formBody = req.body;
    const response = await this.authSrv.signin(formBody);

    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        message: response?.message,
        error: response?.name,
      });
    }

    if (response instanceof NotFoundError) {
      return res.status(response.statusCode).json({
        message: response?.message,
        error: "Invalid credentials",
      });
    }

    return res.status(200).json({
      message: response?.message,
      token: response?.token,
      data: {
        id: response?.data?.id,
        username: response?.data?.username,
        email: response?.data?.email,
      },
    });
  };
  public signup = async (req: Request, res: Response) => {
    const formBody = req.body;
    const response = await this.authSrv.signup(formBody);

    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        message: response?.message,
        error: response?.name,
      });
    }

    return res.status(201).json({
      messsage: "User Signup Successful",
    });
  };
}

const authController = new AuthController(authService);

export default authController;
