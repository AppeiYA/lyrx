export const cookieOptions: {
  httpOnly: boolean;
  secure: boolean;
  sameSite: boolean;
  maxAge: number;
  signed: boolean;
} = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: true,
  maxAge: 24 * 60 * 60 * 1000,
  signed: true,
};
