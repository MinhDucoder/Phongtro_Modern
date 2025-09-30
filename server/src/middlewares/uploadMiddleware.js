// src/middlewares/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Lưu file vào /uploads tạm (tự tạo thư mục nếu chưa tồn tại)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const uploadDir = path.resolve("uploads"); // đảm bảo đường dẫn tuyệt đối tới thư mục uploads trong thư mục chạy server
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
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
    console.log('📁 File validation:', { 
      originalname: file.originalname, 
      mimetype: file.mimetype,
      size: file.size 
    });
    
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      console.log('❌ Invalid file type:', file.mimetype);
      return cb(new Error("Only .jpg, .jpeg, .png allowed!"));
    }
    console.log('✅ File validation passed');
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
