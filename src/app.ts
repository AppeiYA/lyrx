import errorHandler from "./error/RequestErrorHandler";
import express, { type Application } from "express";
import { type Request, type Response } from "express";
import authRouter from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes";
import songRouter from "./song/routes/songs.routes";
import adminRouter from "./admin/admin.routes";

const app: Application = express();

// error request handler
app.use(errorHandler);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(process.env.COOKIE_SECRET));

app.get("/", (req: Request, res: Response) => {
  res.send("Lyrx App with Typescript and express is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/songs", songRouter);

app.use((req: Request, res: Response) => {
  res.type("text/plain");
  res.status(404);
  res.send("404 - NOT FOUND");
});

export default app;
