import express from "express";
import { type Router } from "express";
import authController from "../controllers/authController";
import { loginSchema, SignUpSchema } from "../validators/schemas/AuthSchemas";
import { validate } from "../validators/Validate";
import passport from "../utils/passport";

const authRouter: Router = express.Router();

authRouter.post("/login", validate(loginSchema), authController.signin);
authRouter.get(
  "/login/federated/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRouter.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  authController.googleRedirectGenerateJwt
);
authRouter.post("/signup", validate(SignUpSchema), authController.signup);
authRouter.post("/refreshToken", authController.refreshToken);
authRouter.post("/logout", authController.logout);

export default authRouter;
