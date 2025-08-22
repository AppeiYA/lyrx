import type { LoginDto, SignUpDto } from "../dtos/authDtos";
import argon2 from "argon2";
import { PrismaClient, Prisma } from "../../generated/prisma";
import { signToken } from "../utils/jwt";
import { BadException, NotFoundError } from "../error/ErrorTypes";
import type { UserDataDto } from "../dtos/userDtos";

const prisma = new PrismaClient();

export interface AuthService {
  signup(body: SignUpDto): Promise<void | BadException>;
  signin(body: LoginDto): Promise<any | NotFoundError>;
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
      const tokens = signToken({
        userId: user.id,
        email: user.email,
        tokenVersion: user.tokenVersion,
      });

      if(tokens instanceof Error){
        return 
      }

      return {
        message: "Login Successful",
        token: tokens?.token,
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
}

const authService = new AuthServiceImpl();
export default authService;
