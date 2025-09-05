import { BadException, NotFoundError } from "../error/ErrorTypes";
import dal from "../config/dal";

export interface Favorite {
  spotifyId: string;
  title: string;
}

export interface User {
  username: string;
  email: string;
  createdAt: string; // or Date
  favorites: Favorite[];
}

export interface UsersResponse {
  users: User[];
}

export interface AdminService {
  getUser(): Promise<UsersResponse | NotFoundError | BadException>;
}

export class AdminServiceImpl implements AdminService {
  async getUser(): Promise<UsersResponse | NotFoundError | BadException> {
    try {
      const users = await dal.OneOrMany(
        `SELECT 
        u.username, 
        u.email, 
        u."createdAt",
        COALESCE(
            json_agg(
            json_build_object(
                'spotifyId', s."spotifyId",
                'title', s.title
            )
        ) FILTER (WHERE s.id IS NOT NULL), 
        '[]'
        ) AS favorites
        FROM users u
        LEFT JOIN favorites f ON u.id = f."userId"
        LEFT JOIN songs s ON f."songId" = s.id
        WHERE u.role = $1
        GROUP BY u.id;
`,
        ["user"]
      );
      if (!users) {
        return new NotFoundError("No user found");
      }
      return users;
    } catch (err) {
      console.log(err);
      return new BadException("An error occured on fetch");
    }
  }
}

const adminService = new AdminServiceImpl();
export default adminService;
