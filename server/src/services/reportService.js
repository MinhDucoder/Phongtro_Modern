import mongoose from "mongoose";
import Report, {
  REPORT_STATUS_OPTIONS,
  REPORT_TYPE_OPTIONS,
} from "../models/reportSchema.js";
import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";
import {
  sendPostRejectedNotification,
  sendSystemNotification,
} from "../utils/notificationHelper.js";
import { deleteCacheByPrefix } from "../services/redisService.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

class ReportService {
  async createReport({
    reporterId,
    targetId,
    targetType,
    type,
    description,
    metadata,
  }) {
    const normalizedTargetId = this.normalizeObjectId(targetId);
    const normalizedReporterId = this.normalizeObjectId(reporterId);

    await this.ensureTargetExists(normalizedTargetId, targetType);
    const snapshot = await this.buildTargetSnapshot(normalizedTargetId, targetType);

    const report = await Report.create({
      reporter: normalizedReporterId,
      targetId: normalizedTargetId,
      targetType,
      type,
      description,
      metadata,
      targetSnapshot: snapshot,
    });

    return report.populate([
      { path: "reporter", select: "full_name email phone avatar" },
      ...this.getTargetPopulate(targetType),
    ]);
  }

  async listReports(
    {
      status,
      type,
      targetType,
      search,
      from,
      to,
      reporterId,
    } = {},
    { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, sortBy = "createdAt", sortOrder = "desc" } = {}
  ) {
    const normalizedPage = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
    const normalizedLimit = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT)
    );

    const query = {};

    if (status && REPORT_STATUS_OPTIONS.includes(status)) {
      query.status = status;
    }
    if (type && REPORT_TYPE_OPTIONS.includes(type)) {
      query.type = type;
    }
    if (targetType && ["post", "user"].includes(targetType)) {
      query.targetType = targetType;
    }
    if (reporterId && mongoose.Types.ObjectId.isValid(reporterId)) {
      query.reporter = new mongoose.Types.ObjectId(reporterId);
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ code: regex }, { description: regex }, { adminNote: regex }];
    }

    const skip = (normalizedPage - 1) * normalizedLimit;

    const population = [
      { path: "reporter", select: "full_name email phone avatar" },
      ...this.getTargetPopulate(targetType),
    ];

    const [items, total] = await Promise.all([
      Report.find(query)
        .populate(population)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(normalizedLimit),
      Report.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        total,
        page: normalizedPage,
        limit: normalizedLimit,
        pages: Math.ceil(total / normalizedLimit),
      },
    };
  }

  async listUserReports(reporterId, options = {}) {
    if (!reporterId) {
      throw new Error("Thiếu thông tin người báo cáo");
    }
    return this.listReports({ reporterId }, options);
  }

  async getReportById(reportId) {
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      throw new Error("ID báo cáo không hợp lệ");
    }
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      throw new Error("ID báo cáo không hợp lệ");
    }

    const report = await Report.findById(reportId).populate([
      { path: "reporter", select: "full_name email phone avatar" },
      ...this.getTargetPopulate(),
      { path: "handledBy", select: "full_name email" },
    ]);

    if (!report) {
      throw new Error("Không tìm thấy báo cáo");
    }

    return report;
  }

  async updateStatus(reportId, { status, adminNote, adminId, resolution }) {
    if (!REPORT_STATUS_OPTIONS.includes(status)) {
      throw new Error("Trạng thái báo cáo không hợp lệ");
    }

    const updateData = {
      status,
      adminNote,
      handledBy: adminId,
    };
    const normalizedResolution = {
      verificationMethod: resolution?.verificationMethod,
      actionsTaken: Array.isArray(resolution?.actionsTaken)
        ? [...new Set(resolution.actionsTaken)]
        : [],
      responseMessage: resolution?.responseMessage,
      notifyReporter:
        resolution && Object.prototype.hasOwnProperty.call(resolution, "notifyReporter")
          ? !!resolution.notifyReporter
          : true,
    };

    if (status === "resolved") {
      updateData.resolvedAt = new Date();
    } else if (status === "pending") {
      updateData.resolvedAt = undefined;
      updateData.handledBy = undefined;
    }

    if (resolution) {
      updateData.adminResolution = {
        ...normalizedResolution,
        respondedAt:
          normalizedResolution.responseMessage || normalizedResolution.notifyReporter
            ? new Date()
            : undefined,
      };
    }

    const report = await Report.findByIdAndUpdate(reportId, updateData, {
      new: true,
    }).populate([
      { path: "reporter", select: "full_name email phone avatar" },
      ...this.getTargetPopulate(),
      { path: "handledBy", select: "full_name email" },
    ]);

    if (!report) {
      throw new Error("Không tìm thấy báo cáo để cập nhật");
    }

    await this.applyResolutionEffects(report, {
      status,
      resolution: normalizedResolution,
      adminId,
    });

    return report;
  }

  async getStats({ from, to } = {}) {
    const match = {};

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const [byStatus, byType, trend] = await Promise.all([
      Report.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Report.aggregate([
        { $match: match },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Report.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),
    ]);

    const statusMap = REPORT_STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    byStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    const typeMap = REPORT_TYPE_OPTIONS.reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {});

    byType.forEach((item) => {
      typeMap[item._id] = item.count;
    });

    return {
      status: statusMap,
      type: typeMap,
      trend: trend.map((item) => ({
        date: `${item._id.year}-${item._id.month}-${item._id.day}`,
        count: item.count,
      })),
      total: Object.values(statusMap).reduce((sum, value) => sum + value, 0),
    };
  }

  async ensureTargetExists(targetId, targetType) {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      throw new Error("Đối tượng bị báo cáo không hợp lệ");
    }

    if (targetType === "post") {
      const exists = await Post.exists({ _id: targetId });
      if (!exists) throw new Error("Không tìm thấy bài đăng cần báo cáo");
    } else if (targetType === "user") {
      const exists = await User.exists({ _id: targetId });
      if (!exists) throw new Error("Không tìm thấy người dùng cần báo cáo");
    } else {
      throw new Error("Loại đối tượng báo cáo không hợp lệ");
    }
  }

  getTargetPopulate(targetType) {
    if (targetType === "post") {
      return [
        {
          path: "targetId",
          select: "title slug landlord status roomId price city address",
          populate: [
            { path: "roomId", select: "title address images city price" },
            { path: "landlord", select: "full_name email phone avatar" },
          ],
        },
      ];
    }
    if (targetType === "user") {
      return [
        {
          path: "targetId",
          select: "full_name email phone role avatar",
        },
      ];
    }
    // fallback populate with union of fields
    return [
      {
        path: "targetId",
        select:
          "title slug landlord status roomId price city address full_name email phone role avatar",
        populate: [
          { path: "roomId", select: "title address images city price" },
          { path: "landlord", select: "full_name email phone avatar" },
        ],
      },
    ];
  }

  async applyResolutionEffects(report, { status, resolution, adminId }) {
    if (!report) return;
    const actions = resolution?.actionsTaken || [];
    const hasHidePost = actions.includes("hide_post");
    const shouldNotify =
      resolution && Object.prototype.hasOwnProperty.call(resolution, "notifyReporter")
        ? resolution.notifyReporter !== false
        : true;

    if (shouldNotify && report.reporter?._id) {
      try {
        const link = this.buildTargetLink(report);
        let message = (resolution?.responseMessage || "").trim();
        if (!message) {
          if (status === "investigating") {
            message = "Chúng tôi đã nhận được báo cáo và đang tiến hành kiểm tra.";
          } else if (status === "resolved" && hasHidePost) {
            message =
              "Chúng tôi đã xác nhận vi phạm và gỡ bài đăng. Cảm ơn bạn đã giúp cộng đồng an toàn hơn.";
          } else if (status === "resolved") {
            message = "Chúng tôi đã kiểm tra và chưa ghi nhận vi phạm nào.";
          } else if (status === "dismissed") {
            message = "Báo cáo đã bị từ chối vì không đủ thông tin xác minh.";
          } else {
            message = `Báo cáo ${report.code || report._id} đã được cập nhật.`;
          }
        }
        await sendSystemNotification(
          report.reporter._id,
          "Cập nhật báo cáo vi phạm",
          message,
          link || ""
        );
      } catch (error) {
        console.error("Không thể gửi thông báo cho người báo cáo:", error);
      }
    }

    if (hasHidePost && report.targetType === "post") {
      await this.takeDownPost(report, resolution?.responseMessage, adminId);
    }
  }

  buildTargetLink(report) {
    if (report.targetType !== "post") {
      return "";
    }
    if (report.targetSnapshot?.url) {
      return report.targetSnapshot.url;
    }
    const targetSlug = report.targetId?.slug || report.targetSnapshot?.slug;
    const targetId = this.extractObjectId(report.targetId);
    if (targetSlug) {
      return `/phong-tro/${targetSlug}`;
    }
    if (targetId) {
      return `/phong-tro/${targetId}`;
    }
    return "";
  }

  getStatusLabel(status) {
    const labels = {
      pending: "chờ xử lý",
      investigating: "đang điều tra",
      resolved: "đã xử lý",
      dismissed: "đã từ chối",
    };
    return labels[status] || status;
  }

  async takeDownPost(report, responseMessage, adminId) {
    const postId = this.extractObjectId(report.targetId);
    if (!postId) return;

    const reason =
      responseMessage ||
      report.adminResolution?.responseMessage ||
      "Bài đăng vi phạm tiêu chuẩn cộng đồng.";

    const updateData = {
      status: "rejected",
      moderatedAt: new Date(),
      moderatedBy: adminId,
      rejectionReason: reason,
    };

    const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
      new: true,
    })
      .populate("landlord", "full_name email")
      .populate("roomId", "title");

    await deleteCacheByPrefix("admin:posts:");
    await deleteCacheByPrefix("admin:dashboard:");
    await deleteCacheByPrefix("posts:list:");

    if (updatedPost?.landlord?._id) {
      try {
        await sendPostRejectedNotification(
          updatedPost.landlord._id,
          updatedPost?.roomId?.title ||
            updatedPost.title ||
            report.targetSnapshot?.title ||
            "Bài đăng",
          reason,
          updatedPost._id
        );
      } catch (error) {
        console.error("Không thể gửi thông báo cho chủ trọ:", error);
      }
    }
  }

  extractObjectId(value) {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (value instanceof mongoose.Types.ObjectId) return value.toString();
    if (value._id) return value._id.toString();
    return null;
  }

  normalizeObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ");
    }
    return new mongoose.Types.ObjectId(id);
  }

  async buildTargetSnapshot(targetId, targetType) {
    if (targetType === "post") {
      const post = await Post.findById(targetId)
        .select("title slug status roomId landlord price city address")
        .populate({ path: "landlord", select: "full_name email phone" });
      if (!post) return {};
      return {
        title: post.title,
        slug: post.slug,
        address: post.address,
        price: post.price,
        status: post.status,
        url: post.slug
          ? `/phong-tro/${post.slug}`
          : post._id
          ? `/phong-tro/${post._id}`
          : undefined,
        landlord: post.landlord
          ? {
              name: post.landlord.full_name,
              email: post.landlord.email,
              phone: post.landlord.phone,
            }
          : undefined,
      };
    }

    if (targetType === "user") {
      const user = await User.findById(targetId).select("full_name email phone role");
      if (!user) return {};
      return {
        user: {
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      };
    }

    return {};
  }
}

export default new ReportService();

