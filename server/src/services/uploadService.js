// services/uploadService.js
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";

class UploadService {
  async uploadFile(filePath, folder = "PhongTroVN") {
    try {
      console.log('☁️ Uploading to Cloudinary:', { filePath, folder });
      const result = await cloudinary.uploader.upload(filePath, { folder });
      console.log('✅ Cloudinary upload successful:', result.public_id);
      fs.unlinkSync(filePath); // xoá file local
      return { url: result.secure_url, public_id: result.public_id };
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      // Clean up local file even if upload fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
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
