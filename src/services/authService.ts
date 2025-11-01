import type { LoginDto, SignUpDto } from "../dtos/authDtos";
import argon2 from "argon2";
import { PrismaClient, Prisma } from "../../generated/prisma";
import { signToken, verifyRefreshToken, verifyToken } from "../utils/jwt";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import type { UserDataDto } from "../dtos/userDtos";

export const prisma = new PrismaClient();

export interface AuthService {
  signup(body: SignUpDto): Promise<void | BadException>;
  signin(body: LoginDto): Promise<any | NotFoundError>;
  refreshToken(token: string): Promise<any | BadException>;
  logout(token: string): Promise<void | BadException>;
  generateJwtFromOAuth(user: any): Promise<any | BadException>;
}

export class AuthServiceImpl implements AuthService {
  async signup(body: SignUpDto): Promise<void | BadException> {
    try {
      const { username, email, password } = body;
      const hash = await argon2.hash(password);
      const user = await prisma.user.create({
        data: {
          username: username,
          email: email,
          password: hash,
        },
      });

      if (!user) {
        throw new BadException("User creation failed");
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == "P2002") {
          return new BadException("User Already Exist");
        }
      }

      return new BadException("Database Error");
    }
  }

  async generateJwtFromOAuth(user: any): Promise<any | BadException> {
    try {
      const tokens = signToken(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          tokenVersion: user.tokenVersion,
        },
        true
      );

      if (tokens instanceof Error) {
        return new BadException("tokenization error");
      }

      return {
        message: "Login Successful",
        token: tokens?.token,
        refreshToken: tokens?.newRefreshToken,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (err) {
      return new BadException("Error generating token from OAuth");
    }
  }
  async signin(body: LoginDto): Promise<any | NotFoundError> {
    try {
      const { username, email, password } = body;

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      });

      if (!user) {
        return new NotFoundError("User not found");
      }

      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        return new BadException("Invalid Password");
      }

      // sign token for user
      const tokens = signToken(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          tokenVersion: user.tokenVersion,
        },
        true
      );

      if (tokens instanceof Error) {
        return new BadException("tokenization error");
      }

      return {
        message: "Login Successful",
        token: tokens?.token,
        refreshToken: tokens?.newRefreshToken,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      return {
        message: "Signin failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async refreshToken(token: string): Promise<any | BadException> {
    try {
      const JwtPayload = verifyRefreshToken(token);

      const user = await prisma.user.findUnique({
        where: { id: JwtPayload?.decoded?.userId },
      });
      if (!user || user.tokenVersion !== JwtPayload?.decoded?.tokenVersion) {
        return new BadException("Invalid refresh token");
      }

      const newAccessToken = signToken(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          tokenVersion: user.tokenVersion,
        },
        false
      );

      return { token: newAccessToken };
    } catch (error: any) {
      return new BadException("Invalid or Unexpected Refresh Token");
    }
  }

  async logout(token: string): Promise<void | BadException> {
    try {
      const JwtPayload = verifyRefreshToken(token);
      if (!JwtPayload.valid || JwtPayload.expired) {
        return new BadException("Token expired. User already logged out");
      }

      const userId = JwtPayload?.decoded?.userId;

      if (!userId) {
        return new BadException("Unauthorized logout request");
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenVersion: {
            increment: 1, // bump version
          },
        },
      });
    } catch (error) {
      return new BadException("Error Logging Out");
    }
  }
}

const authService = new AuthServiceImpl();
export default authService;
