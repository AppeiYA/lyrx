import { NotFoundError } from "../error/ErrorTypes";
import { PrismaClient, Prisma } from "../../generated/prisma";
const prisma = new PrismaClient();

interface UserProfile {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
}

export interface UserService{
    getUserProfile(userId: string): Promise<UserProfile | NotFoundError>;
}

export class UserServiceImpl implements UserService {
    async getUserProfile(userId: string): Promise<UserProfile | NotFoundError> {
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })
        if (!user) {
            return new NotFoundError("User not found");
        }
        const {id, username, email, createdAt} = user;
        return {id, username, email, createdAt}
    }
}

const userService = new UserServiceImpl();
export default userService;