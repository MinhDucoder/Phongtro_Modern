import uploadService from "~/services/uploadService.js";

class UploadController {
  async uploadSingleImage(req, res) {
    try {
      const result = await uploadService.uploadFile(req.file.path, "PhongTroVN");
      res.json({ message: "Upload thành công", ...result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async uploadMultiImage(req, res) {
    try {
      const results = await uploadService.uploadFiles(req.files, "PhongTroVN");
      res.json({ message: "Upload thành công", files: results });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteImage(req, res) {
    try {
      const { public_id } = req.body;
      const result = await uploadService.deleteFile(public_id);
      res.json({ message: "Xoá thành công", result }); 
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new UploadController();
