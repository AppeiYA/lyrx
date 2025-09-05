import express, { type Router } from "express";
import { AdminMiddleware } from "./adminAuth";
import adminController from "./admin.controller";

const adminRouter = express.Router();

adminRouter.get("/users", AdminMiddleware, adminController.getUsers);

export default adminRouter;
