export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  maxAge?: number;
  signed?: boolean;
  path?: string;
}

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
  signed: true,
};

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: "lax",
  signed: false,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
