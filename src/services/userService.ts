import { BadException, NotFoundError } from "../error/ErrorTypes";
import { PrismaClient, Prisma } from "../../generated/prisma";
const prisma = new PrismaClient();

interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface UserService {
  getUserProfile(userId: string): Promise<UserProfile | NotFoundError>;
  getPublicProfile(username: string): Promise<any | NotFoundError>;
  updateProfile(userId: string, payload: any): Promise<any | BadException>;
}

export class UserServiceImpl implements UserService {
  async getUserProfile(userId: string): Promise<UserProfile | NotFoundError> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return new NotFoundError("User not found");
    }
    const { id, username, email, createdAt } = user;
    return { id, username, email, createdAt };
  }

  async getPublicProfile(username: string): Promise<any | NotFoundError> {
    const user = await prisma.user.findFirst({
      where: { username: username },
      include: { favorites: true },
    });

    if (!user) {
      return new NotFoundError("User not found");
    }

    return {
      username: user.username,
      favorites: user.favorites,
    };
  }

  async updateProfile(
    userId: string,
    payload: any
  ): Promise<any | BadException> {
    try {
      const { username } = payload;
      if (username) {
        const user = await prisma.user.findUnique({
          where: { username: username },
        });
        if (user) {
          return new BadException("Username Already Taken");
        }
      }
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...payload,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          username: true,
          email: true,
          updatedAt: true,
        },
      });

      return { updatedUser };
    } catch (error) {
      return new BadException("Unable to update profile" + error);
    }
  }
}

const userService = new UserServiceImpl();
export default userService;
