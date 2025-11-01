import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import dal from "../config/dal";
import argon2 from "argon2";
import crypto from "crypto";
import type { VerifyCallback, VerifyFunction } from "passport-google-oauth2";
import { NotFoundError } from "../error/ErrorTypes";
import type { UUID } from "../validators/schemas/post.schemas";
import { prisma } from "../services/authService";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"]!,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
      callbackURL: "http://localhost:4000/api/auth/oauth2/redirect/google",
      passReqToCallback: true,
    },
    async (
      request: Express.Request,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        const fed_user = await dal.One(
          `SELECT * FROM federated_users WHERE provider = $1 AND subject = $2`,
          ["google", profile.id]
        );

        let user;

        if (fed_user instanceof NotFoundError) {
          // user not found, create a new user
          // const new_user = await dal.One(
          //   `INSERT INTO users (username, email)
          //   VALUES ($1, $2) RETURNING *`,
          //   [profile.displayName, email]
          // );

          // check if user email is in db
          let new_user = await dal.One(`SELECT * FROM users WHERE email = $1`, [
            email,
          ]);

          if(new_user instanceof NotFoundError){
            // create new user
            const password = crypto.randomBytes(16).toString("hex");
            const hash = await argon2.hash(password);
            new_user = await prisma.user.create({
              data: {
                username: profile.displayName,
                email: email,
                password: hash,
              },
            });
          } 

          const user_id = new_user.id;

          await dal.None(
            `INSERT INTO federated_users (user_id, provider, subject)
            VALUES ($1, $2, $3)`,
            [user_id, "google", profile.id]
          );
          user = new_user;
        } else {
          user = await dal.One(`SELECT * FROM users WHERE id = $1`, [
            fed_user.user_id,
          ]);
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done: VerifyCallback) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: UUID, done: VerifyCallback) => {
  try {
    const user = await dal.One(`SELECT * FROM users WHERE id = $1`, [id]);
    done(null, user);
  } catch (err) {
    done(err as Error);
  }
});

export default passport;
