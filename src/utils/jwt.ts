import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// interface VerifyToken {
//     token: string;
// }

interface signTokenPayload {
  userId: string;
  email: string;
  role: string;
  tokenVersion: number;
}

// fetch the JWT secret from environment variables
const secret: string = process.env.JWT_SECRET as string;
const refresh_secret = process.env.JWT_REFRESH_SECRET as string;

if (!secret) {
  throw new Error("JWT secret is not defined");
}

export const signToken = (payload: signTokenPayload, refreshToken: boolean) => {
  try {
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    if (!token) {
      return new Error("Error signing token");
    }
    let newRefreshToken = null;
    if(refreshToken){
      newRefreshToken = signRefreshToken(payload);
    }
    return { token, newRefreshToken};
  } catch (error) {
    return new Error("Error signing token: " + error);
  }
};

export const signRefreshToken = (payload: signTokenPayload) => {
  try {
    const refreshToken = jwt.sign(payload, refresh_secret, { expiresIn: "7d" });
    return refreshToken;
  } catch (error) {
    return new Error("Error signing token: " + error);
  }
};

export const verifyRefreshToken = (token: string): {valid: boolean; expired: boolean; decoded: any}=>{
  try{
    const decoded = jwt.verify(token, refresh_secret) as JwtPayload;
    return{valid: true, expired: false, decoded}
  }catch(error){
    return {valid: false, expired: true, decoded: null}
  }
}

export const verifyToken = (
  token: string
): { valid: boolean; expired: boolean; decoded: any } => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return { valid: true, expired: false, decoded };
  } catch (error: any) {
    return { valid: false, expired: true, decoded: null };
  }
};
