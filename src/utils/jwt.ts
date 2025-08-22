import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// interface VerifyToken {
//     token: string;
// }

interface signTokenPayload {
  userId: string;
  email: string;
  tokenVersion: number;
}

// fetch the JWT secret from environment variables
const secret: string = process.env.JWT_SECRET as string;
const refresh_secret = process.env.JWT_REFRESH_SECRET as string;

if (!secret) {
  throw new Error("JWT secret is not defined");
}

export const signToken = (payload: signTokenPayload) => {
  try {
    const token = jwt.sign(payload, secret, {expiresIn: "15s"});
    if(!token){
        return new Error("Error signing token");
    }
    return {token, refreshToken: signRefreshToken(payload)};
  } catch (error) {
    return new Error("Error signing token: " + error);
  }
};

export const signRefreshToken = (payload: signTokenPayload) => {
  try {
    const refreshToken = jwt.sign(payload, refresh_secret, {expiresIn: '7d'});
    return refreshToken;
  } catch (error) {
    return new Error("Error signing token: " + error);
  }
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error: any) {
    throw new Error("Error verifying token: " + error?.message);
  }
};
