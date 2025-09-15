import express, { type Router } from "express";
import { AdminMiddleware } from "./adminAuth";
import adminController from "./admin.controller";
import { upload } from "./utils/multer";

const adminRouter = express.Router();

adminRouter.get("/users", AdminMiddleware, adminController.getUsers);

adminRouter.post("/upload", AdminMiddleware, upload.single("file"), adminController.postChart);

export default adminRouter;
