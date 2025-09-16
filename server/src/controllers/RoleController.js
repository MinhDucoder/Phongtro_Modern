import RoleRequest from "~/models/roleRequestSchema.js";
import User from "~/models/userSchema.js";

class RoleController {
  // User gửi yêu cầu
  async requestRole(req, res) {
    const { role } = req.body;
    const userId = req.user.id;

    if (role !== "landlord") {
      return res.status(400).json({ message: "Chỉ được yêu cầu lên landlord" });
    }

    // Check nếu đã có request pending
    const existing = await RoleRequest.findOne({ user: userId, status: "pending" });
    if (existing) return res.status(400).json({ message: "Bạn đã gửi yêu cầu, vui lòng chờ admin duyệt" });

    const newRequest = new RoleRequest({ user: userId, role_requested: role });
    await newRequest.save();

    res.status(201).json({ message: "Yêu cầu nâng cấp đã được gửi", request: newRequest });
  }

  // Admin duyệt yêu cầu
  async reviewRequest(req, res) {
    const { id } = req.params;
    const { action } = req.body; // approve | reject
    const adminId = req.user.id;

    const request = await RoleRequest.findById(id).populate("user");
    if (!request) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    if (request.status !== "pending") return res.status(400).json({ message: "Yêu cầu đã được xử lý" });

    if (action === "approve") {
      request.status = "approved";
      request.user.role = "landlord";
      await request.user.save();
    } else if (action === "reject") {
      request.status = "rejected";
    } else {
      return res.status(400).json({ message: "Hành động không hợp lệ" });
    }

    request.reviewed_by = adminId;
    request.reviewed_at = new Date();
    await request.save();

    res.json({ message: `Yêu cầu đã được ${action}`, request });
  }

  // User xem trạng thái yêu cầu
  async myRequest(req, res) {
    const userId = req.user.id;
    const requests = await RoleRequest.find({ user: userId });
    res.json({ requests });
  }

  // Admin xem tất cả yêu cầu
  async listRequests(req, res) {
    const requests = await RoleRequest.find().populate("user");
    res.json({ requests });
  }
}

export default new RoleController();
