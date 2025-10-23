import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // User thực hiện thanh toán (landlord)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Loại gói dịch vụ
    packageName: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Loại gói (free, silver, gold, platinum, vip)
    packageType: {
      type: String,
      enum: ["free", "silver", "gold", "platinum", "vip", "premium"],
      required: true,
    },
    
    // Số tiền thanh toán
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Đơn vị tiền tệ
    currency: {
      type: String,
      default: "VND",
    },
    
    // Trạng thái thanh toán
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    
    // Phương thức thanh toán
    paymentMethod: {
      type: String,
      enum: ["vnpay", "momo", "zalopay", "bank_transfer", "credit_card", "cash"],
      required: true,
    },
    
    // Mã giao dịch từ payment gateway
    transactionId: {
      type: String,
      required: true,
      unique: true,
      // Tránh double index: giữ unique, bỏ index riêng lẻ (đã có schema.index phía dưới)
    },
    
    // Mã tham chiếu nội bộ
    referenceId: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // Thông tin từ payment gateway
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    
    // Thời gian bắt đầu gói
    packageStartDate: {
      type: Date,
      required: true,
    },
    
    // Thời gian kết thúc gói
    packageEndDate: {
      type: Date,
      required: true,
    },
    
    // Số ngày của gói
    packageDuration: {
      type: Number, // số ngày
      required: true,
    },
    
    // Thông tin hóa đơn
    invoice: {
      invoiceNumber: String,
      invoiceUrl: String,
      taxCode: String,
      companyName: String,
      companyAddress: String,
    },
    
    // Ghi chú
    notes: {
      type: String,
      trim: true,
    },
    
    // Thời gian hoàn thành thanh toán
    completedAt: {
      type: Date,
    },
    
    // Thời gian thất bại
    failedAt: {
      type: Date,
    },
    
    // Lý do thất bại
    failureReason: {
      type: String,
    },
    
    // Metadata - sử dụng Mixed type để lưu trữ linh hoạt
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for better performance (tránh trùng lặp với field index)
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ packageType: 1 });

export default mongoose.model("Payment", paymentSchema);



