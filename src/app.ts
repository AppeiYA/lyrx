import errorHandler from "./error/RequestErrorHandler";
import express, { type Application } from "express";
import { type Request, type Response } from "express";
import authRouter from "./routes/auth.routes";
import { cookieSecret } from "./utils/credentials";
import cookieParser from "cookie-parser";

const app: Application = express();

// error request handler
app.use(errorHandler);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(cookieSecret));

app.get("/", (req: Request, res: Response) => {
  res.send("Lyrx App with Typescript and express is running!");
});

app.use("/api/auth", authRouter);

app.use((req: Request, res: Response) => {
  res.type("text/plain");
  res.status(404);
  res.send("404 - NOT FOUND");
});

export default app;
