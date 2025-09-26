import { BadException, NotFoundError } from "../error/ErrorTypes";
import { PrismaClient, Prisma } from "../../generated/prisma";
import dal from "../config/dal";
import cuid from "cuid";
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
  addFavorite(
    userId: string,
    spotifySongId: string
  ): Promise<void | BadException>;
  followUser(
    userId: string,
    followerId: string
  ): Promise<void | NotFoundError | BadException>;
  unfollowUser(
    targetUserId: string,
    followerId: string
  ): Promise<void | NotFoundError | BadException>;
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
  async addFavorite(
    userId: string,
    spotifySongId: string
  ): Promise<void | BadException> {
    try {
      // Check if song exists in DB
      const checkSong = await dal.One(
        `SELECT * FROM songs WHERE "spotifyId" = $1`,
        [spotifySongId]
      );
      let storedSongId: string;

      if (checkSong instanceof NotFoundError) {
        // Store song if not found
        const now = new Date().toISOString();
        const newSongId = cuid();
        const song = await dal.One(
          `INSERT INTO songs (id, "spotifyId", title, "lyricsSource", "updatedAt", "createdAt") 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
          [newSongId, spotifySongId, "unknown", "NONE", now, now]
        );

        if (song instanceof BadException)
          return new BadException("Error storing fetched song");
        if (song instanceof NotFoundError)
          return new NotFoundError("Error storing fetched song");

        storedSongId = song.id;
      } else {
        storedSongId = checkSong.id; // Use existing song id
      }

      // Insert into favorites
      const favorite = await dal.None(
        `INSERT INTO favorites (id, "userId", "songId", "createdAt")
       VALUES ($1, $2, $3, $4)`,
        [cuid(), userId, storedSongId, new Date().toISOString()]
      );

      if (favorite instanceof BadException) {
        return new BadException(favorite.message);
      }

      console.log(`Favorite added: user=${userId}, song=${storedSongId}`);
    } catch (err) {
      console.error("Error:", err);
      return new BadException("Unable to add favorite");
    }
  }
  async followUser(
    targetUserId: string,
    followerId: string
  ): Promise<void | NotFoundError | BadException> {
    try {
      // check if user exists
      const user = await dal.One(
        `SELECT id, username 
      FROM users 
      WHERE id = $1`,
        [targetUserId]
      );
      if (user instanceof NotFoundError) {
        return new NotFoundError("User not found");
      }
      // check if user already followed
      let checkFollow;
      try {
        checkFollow = await dal.One(
          `SELECT user_id, follower_id
          FROM follows
          WHERE user_id = $1
          AND follower_id = $2`,
          [targetUserId, followerId]
        );
      } catch (err) {
        if (err instanceof NotFoundError) {
          checkFollow = null; // not following
        } else {
          throw err; // bubble up unexpected errors
        }
      }

      if (checkFollow) {
        return new BadException("Already follows user");
      }

      await dal.None(
        `INSERT INTO follows (user_id, follower_id) 
      VALUES ($1, $2)`,
        [targetUserId, followerId]
      );
    } catch (err: any) {
      console.log("error:", err);
      return new BadException("An error occured");
    }
  }
  async unfollowUser(
    targetUserId: string,
    followerId: string
  ): Promise<void | NotFoundError | BadException> {
    try {
      // check if user exists
      const user = await dal.One(
        `SELECT id, username 
      FROM users 
      WHERE id = $1`,
        [targetUserId]
      );
      if (user instanceof NotFoundError) {
        return new NotFoundError("User not found");
      }

      // check if user already followed
      let checkFollow;
      try {
        checkFollow = await dal.One(
          `SELECT user_id, follower_id
          FROM follows
          WHERE user_id = $1
          AND follower_id = $2`,
          [targetUserId, followerId]
        );
      } catch (err) {
        if (err instanceof NotFoundError) {
          checkFollow = null; // not following
        } else {
          throw err; // bubble up unexpected errors
        }
      }

      if (!checkFollow) {
        return new BadException("Not following user");
      }

      await dal.None(
        `DELETE FROM follows
        WHERE user_id = $1
        AND follower_id = $2`,
        [targetUserId, followerId]
      );
    } catch (err) {}
  }
}

const userService = new UserServiceImpl();
export default userService;
