import express from "express";
import upload from "../../middlewares/uploadMiddleware.js";
import UploadController from "~/controllers/UploadController.js";

const uploadRoute = express.Router();

// Upload 1 ảnh
uploadRoute.post(
  "/singleImage",
  upload.single("file"), // field name = "file"
  UploadController.uploadSingleImage
);

// Upload nhiều ảnh
uploadRoute.post(
  "/multiImage",
  upload.array("files", 10), // field name = "files"
  UploadController.uploadMultiImage
);

uploadRoute.delete(
  "/delete",
  UploadController.deleteImage
);


export default uploadRoute;
 