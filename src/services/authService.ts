import type { LoginDto, SignUpDto } from "../dtos/authDtos";
import argon2 from "argon2";
import { PrismaClient, Prisma } from "../../generated/prisma";

const prisma = new PrismaClient();

export class AuthService {
  static async signup(body: SignUpDto) {
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
        throw new Error("User creation failed");
      }

      return {
        message: "User signup successful",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == "P2002") {
          return {
            message: "User already exists",
            error: "A user with this username or email already exists",
          };
        }
      }

      return {
        message: "Database Error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async signin(body: LoginDto) {
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
        return {
          message: "User Not Found",
          error: "User with this username or email does not exist",
        };
      }

      const isPasswordValid = await argon2.verify(user.password, password);

      if (!isPasswordValid) {
        return {
          message: "Invalid Password",
          error: "Password provided is incorrect",
        };
      }

      return {
        message: "Login Successful",
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
