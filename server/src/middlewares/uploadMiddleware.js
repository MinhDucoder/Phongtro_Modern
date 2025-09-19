// src/middlewares/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Lưu file vào /uploads tạm
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder tạm
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // lấy đuôi file
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`); // custom tên file
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only .jpg, .jpeg, .png allowed!"));
    }
    cb(null, true);
  },
});

export const cleanupUploads = (req, res, next) => {
  res.on("finish", () => {
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }
  });
  next();
};

export default upload;
