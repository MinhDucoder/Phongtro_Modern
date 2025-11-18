import reportService from "../services/reportService.js";
import catchAsync from "../middlewares/catchAsync.js";

class ReportController {
  createReport = catchAsync(async (req, res) => {
    const { targetId, targetType, type, description, metadata } = req.body;
    const reporterId = req.user?.id;

    if (!reporterId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để gửi báo cáo",
      });
    }

    const report = await reportService.createReport({
      reporterId,
      targetId,
      targetType,
      type,
      description,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: "Đã gửi báo cáo, vui lòng đợi admin xử lý",
      data: report,
    });
  });

  getMyReports = catchAsync(async (req, res) => {
    const reporterId = req.user?.id;
    const { page, limit } = req.query;

    if (!reporterId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để xem danh sách báo cáo",
      });
    }

    const reports = await reportService.listUserReports(reporterId, {
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    res.status(200).json({
      success: true,
      data: reports,
    });
  });

  getReports = catchAsync(async (req, res) => {
    const { status, type, targetType, search, from, to, page, limit, sortBy, sortOrder } =
      req.query;

    const result = await reportService.listReports(
      { status, type, targetType, search, from, to },
      { page, limit, sortBy, sortOrder }
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  });

  getReportById = catchAsync(async (req, res) => {
    const report = await reportService.getReportById(req.params.id);

    res.status(200).json({
      success: true,
      data: report,
    });
  });

  updateStatus = catchAsync(async (req, res) => {
    const adminId = req.user?.id;
    const { status, adminNote, resolution } = req.body;

    const report = await reportService.updateStatus(req.params.id, {
      status,
      adminNote,
      adminId,
      resolution,
    });

    res.status(200).json({
      success: true,
      message: "Đã cập nhật trạng thái báo cáo",
      data: report,
    });
  });

  getStats = catchAsync(async (req, res) => {
    const { from, to } = req.query;
    const stats = await reportService.getStats({ from, to });

    res.status(200).json({
      success: true,
      data: stats,
    });
  });
}

export default new ReportController();

