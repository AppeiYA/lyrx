import { type Request, type Response } from "express";
import authService, { type AuthService } from "../services/authService";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import { refreshCookieOptions } from "../utils/cookie";

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

    const refreshToken: string = response?.refreshToken;

    return res
      .cookie("jid", refreshToken, refreshCookieOptions)
      .status(200)
      .json({
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
        error: response?.message,
        errorname: response?.name,
      });
    }

    return res.status(201).json({
      messsage: "User Signup Successful",
    });
  };
  public refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.status(404).json({ message: "token not found" });
    }
    const response = await this.authSrv.refreshToken(token);
    if (response instanceof BadException) {
      return res.status(403).json({
        message: response.message,
      });
    }

    return res.status(200).json({
      message: "New access token fetched",
      token: response?.token,
    });
  };
  public logout = async (req: Request, res: Response) => {
    const token = req.cookies.jid;
    const response = await this.authSrv.logout(token);
    if (response instanceof BadException) {
      return res.status(response.statusCode).json({
        message: response.message,
        error: response.name,
      });
    }

    return res.clearCookie("jid", refreshCookieOptions).status(200).json({
      message: "Log Out Successful",
    });
  };
}

const authController = new AuthController(authService);

export default authController;
