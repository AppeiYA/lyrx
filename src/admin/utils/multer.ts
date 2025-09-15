import multer, { type FileFilterCallback } from "multer";
import { type Request } from "express";
import fs from "fs";
import path from "path";

// Upload directory and fixed file path
const UPLOAD_DIR = "uploads";
const FILE_PATH = path.join(UPLOAD_DIR, `top200.csv`);

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Configure storage (always overwrite as data.csv)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, _file, cb) => {
    cb(null, "top200.csv"); // fixed filename
  },
});

// File filter to only allow CSV
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();


  if (ext === ".csv" && file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed!"));
  }
};

export const upload = multer({ storage, fileFilter });
