import {
  type ErrorRequestHandler,
  type Request,
  type Response,
  type NextFunction,
} from "express";

const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.type("text/plain");
  res.status(500);
  res.send("500 - Internal Server Error");
};

export default errorHandler;
