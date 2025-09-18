// services/uploadService.js
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";

class UploadService {
  async uploadFile(filePath, folder = "PhongTroVN") {
    const result = await cloudinary.uploader.upload(filePath, { folder });
    fs.unlinkSync(filePath); // xoá file local
    return { url: result.secure_url, public_id: result.public_id };
  }

  async uploadFiles(files, folder = "PhongTroVN") {
    const results = [];
    for (const file of files) {
      results.push(await this.uploadFile(file.path, folder));
    }
    return results;
  }

  async deleteFile(publicId) {
    return await cloudinary.uploader.destroy(publicId); 
  }
}

export default new UploadService();
