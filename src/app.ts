import errorHandler from "./error/RequestErrorHandler";
import express, { type Application } from "express";
import { type Request, type Response } from "express";
import authRouter from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes";
import songRouter from "./song/routes/songs.routes";
import adminRouter from "./admin/admin.routes";
import cors from "cors";
import dotenv from "dotenv";
import postRouter from "./posts/post.routes";

dotenv.config();

const app: Application = express();

// error request handler
app.use(errorHandler);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Lyrx App with Typescript and express is running!");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/songs", songRouter);
app.use("/api/posts", postRouter);

app.use((req: Request, res: Response) => {
  res.type("text/plain");
  res.status(404);
  res.send("404 - NOT FOUND");
});

export default app;
