// @ts-nocheck
import Payment from '../models/paymentSchema.js';
import User from '../models/userSchema.js';
import catchAsync from '../middlewares/catchAsync.js';
import { getOrSetCache, deleteCacheByPrefix } from '../services/redisService.js';

class AdminPaymentController {
  // Lấy danh sách tất cả payments (Admin)
  getAllPayments = catchAsync(async (req, res) => {
    try {
      console.log('🔵 getAllPayments called with query:', req.query);
      
      const {
        page = 1,
        limit = 20,
        status,
        packageType,
        paymentMethod,
        sortBy = 'created_at', // Sửa thành created_at
        sortOrder = 'desc',
        search
      } = req.query;

      // 🔹 Cache payments list với TTL 3 phút
      const cacheKey = `admin:payments:list:p${page}:l${limit}:s${status || 'all'}:t${packageType || 'all'}:m${paymentMethod || 'all'}:sort${sortBy}:${sortOrder}:q${search || ''}`;
      
      const paymentsData = await getOrSetCache(
        cacheKey,
        async () => {
          console.log('🔵 Cache miss - fetching from database');
          
          // Build query
          const query = {};
          
          if (status && status !== 'all') {
            query.status = status;
          }
          
          if (packageType && packageType !== 'all') {
            query.packageType = packageType;
          }
          
          if (paymentMethod && paymentMethod !== 'all') {
            query.paymentMethod = paymentMethod;
          }
          
          // Search by transaction ID, reference ID, or user info
          if (search) {
            const searchRegex = new RegExp(search, 'i');
            
            // Find users matching search
            const matchingUsers = await User.find({
              $or: [
                { full_name: searchRegex },
                { email: searchRegex }
              ]
            }).select('_id');
            
            const userIds = matchingUsers.map(u => u._id);
            
            query.$or = [
              { transactionId: searchRegex },
              { referenceId: searchRegex },
              { user: { $in: userIds } }
            ];
          }
          
          console.log('🔵 MongoDB query:', JSON.stringify(query));
          
          // Calculate skip
          const skip = (parseInt(page) - 1) * parseInt(limit);
          
          // Build sort object
          const sort = {};
          sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
          
          console.log('🔵 Sort:', sort, 'Skip:', skip, 'Limit:', limit);
          
          // Get payments with population
          const payments = await Payment.find(query)
            .populate('user', 'full_name email phone_number avatar')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
          
          console.log('🔵 Found payments:', payments.length);
          
          const total = await Payment.countDocuments(query);
          console.log('🔵 Total count:', total);
          
          // Format payments
          const formattedPayments = payments.map(payment => ({
            id: payment._id,
            transactionId: payment.transactionId,
            referenceId: payment.referenceId,
            user: payment.user ? {
              id: payment.user._id,
              name: payment.user.full_name || 'Không có tên',
              email: payment.user.email || '',
              phone: payment.user.phone_number || '',
              avatar: payment.user.avatar || null
            } : null,
            packageName: payment.packageName,
            packageType: payment.packageType,
            amount: payment.amount,
            currency: payment.currency || 'VND',
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            packageDuration: payment.packageDuration,
            packageStartDate: payment.packageStartDate,
            packageEndDate: payment.packageEndDate,
            createdAt: payment.createdAt || payment.created_at,
            completedAt: payment.completedAt,
            failedAt: payment.failedAt,
            failureReason: payment.failureReason,
            notes: payment.notes
          }));
          
          return {
            payments: formattedPayments,
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: Math.ceil(total / parseInt(limit))
            }
          };
        },
        180 // TTL 3 phút
      );
      
      console.log('🟢 Sending response with', paymentsData.payments.length, 'payments');
      
      res.status(200).json({
        success: true,
        data: paymentsData
      });
    } catch (error) {
      console.error('🔴 Error in getAllPayments:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách giao dịch: ' + error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Lấy thống kê tổng quan về payments (Admin)
  getPaymentOverview = catchAsync(async (req, res) => {
    // 🔹 Cache payment overview với TTL 2 phút
    const cacheKey = 'admin:payments:overview';
    
    const overviewData = await getOrSetCache(
      cacheKey,
      async () => {
        try {
          // Get counts by status
          const [
            totalPayments,
            completedPayments,
            pendingPayments,
            failedPayments,
            refundedPayments
          ] = await Promise.all([
            Payment.countDocuments(),
            Payment.countDocuments({ status: 'completed' }),
            Payment.countDocuments({ status: 'pending' }),
            Payment.countDocuments({ status: 'failed' }),
            Payment.countDocuments({ status: 'refunded' })
          ]);
        
        // Get total revenue (completed payments only)
        const revenueResult = await Payment.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;
        
        // Get revenue by package type
        const revenueByPackage = await Payment.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: '$packageType',
              revenue: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { revenue: -1 } }
        ]);
        
        // Get revenue by payment method
        const revenueByMethod = await Payment.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: '$paymentMethod',
              revenue: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { revenue: -1 } }
        ]);
        
        // Get daily revenue for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const dailyRevenue = await Payment.aggregate([
          {
            $match: {
              status: 'completed',
              completedAt: { $gte: thirtyDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$completedAt' },
                month: { $month: '$completedAt' },
                day: { $dayOfMonth: '$completedAt' }
              },
              revenue: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        
        // Get monthly revenue for current year
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = await Payment.aggregate([
          {
            $match: {
              status: 'completed',
              completedAt: {
                $gte: new Date(currentYear, 0, 1),
                $lte: new Date(currentYear, 11, 31)
              }
            }
          },
          {
            $group: {
              _id: { $month: '$completedAt' },
              revenue: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id': 1 } }
        ]);
        
        // Get recent large transactions (top 10)
        const recentLargeTransactions = await Payment.find({ status: 'completed' })
          .populate('user', 'full_name email')
          .sort({ amount: -1 })
          .limit(10)
          .lean();
        
        // Calculate average transaction value
        const avgTransactionValue = completedPayments > 0 
          ? Math.round(totalRevenue / completedPayments) 
          : 0;
        
        return {
          overview: {
            totalPayments,
            completedPayments,
            pendingPayments,
            failedPayments,
            refundedPayments,
            totalRevenue,
            avgTransactionValue
          },
          revenueByPackage: revenueByPackage.map(item => ({
            packageType: item._id || 'unknown',
            revenue: item.revenue,
            count: item.count,
            avgValue: Math.round(item.revenue / item.count)
          })),
          revenueByMethod: revenueByMethod.map(item => ({
            method: item._id || 'unknown',
            revenue: item.revenue,
            count: item.count
          })),
          dailyRevenue: dailyRevenue.map(item => ({
            date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
            revenue: item.revenue,
            count: item.count
          })),
          monthlyRevenue: monthlyRevenue.map(item => ({
            month: item._id,
            revenue: item.revenue,
            count: item.count
          })),
          topTransactions: recentLargeTransactions.map(txn => ({
            id: txn._id,
            user: txn.user?.full_name || 'Unknown',
            amount: txn.amount,
            packageType: txn.packageType,
            date: txn.completedAt
          }))
        };
        } catch (error) {
          console.error('Error in getPaymentOverview:', error);
          // Return default values on error
          return {
            overview: {
              totalPayments: 0,
              completedPayments: 0,
              pendingPayments: 0,
              failedPayments: 0,
              refundedPayments: 0,
              totalRevenue: 0,
              avgTransactionValue: 0
            },
            revenueByPackage: [],
            revenueByMethod: [],
            dailyRevenue: [],
            monthlyRevenue: [],
            topTransactions: []
          };
        }
      },
      120 // TTL 2 phút
    );
    
    res.status(200).json({
      success: true,
      data: overviewData
    });
  });

  // Xem chi tiết một payment (Admin)
  getPaymentDetail = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const payment = await Payment.findById(id)
      .populate('user', 'full_name email phone_number address avatar is_verified role')
      .lean();
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }
    
    // Format detailed payment info
    const detailedPayment = {
      id: payment._id,
      transactionId: payment.transactionId,
      referenceId: payment.referenceId,
      user: payment.user ? {
        id: payment.user._id,
        name: payment.user.full_name,
        email: payment.user.email,
        phone: payment.user.phone_number,
        address: payment.user.address,
        avatar: payment.user.avatar,
        isVerified: payment.user.is_verified,
        role: payment.user.role
      } : null,
      package: {
        name: payment.packageName,
        type: payment.packageType,
        duration: payment.packageDuration,
        startDate: payment.packageStartDate,
        endDate: payment.packageEndDate
      },
      payment: {
        amount: payment.amount,
        currency: payment.currency || 'VND',
        method: payment.paymentMethod,
        status: payment.status
      },
      invoice: payment.invoice,
      timeline: {
        createdAt: payment.createdAt || payment.created_at,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt,
        refundedAt: payment.refundedAt
      },
      failureReason: payment.failureReason,
      refundReason: payment.refundReason,
      notes: payment.notes,
      gatewayResponse: payment.gatewayResponse
    };
    
    res.status(200).json({
      success: true,
      data: detailedPayment
    });
  });

  // Cập nhật trạng thái payment (Admin)
  updatePaymentStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, reason, notes } = req.body;
    
    const payment = await Payment.findById(id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }
    
    const updateData = { status };
    
    if (status === 'completed' && !payment.completedAt) {
      updateData.completedAt = new Date();
    } else if (status === 'failed') {
      updateData.failedAt = new Date();
      updateData.failureReason = reason || 'Admin marked as failed';
    } else if (status === 'refunded') {
      updateData.refundedAt = new Date();
      updateData.refundReason = reason || 'Admin refunded';
    }
    
    if (notes) {
      updateData.notes = notes;
    }
    
    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('user', 'full_name email');
    
    // ❌ Clear cache sau khi update
    await deleteCacheByPrefix('admin:payments:');
    await deleteCacheByPrefix('admin:dashboard:'); // Dashboard có thể hiển thị revenue
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái giao dịch thành công',
      data: updatedPayment
    });
  });

  // Xóa payment (Admin only - soft delete)
  deletePayment = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        is_deleted: true,
        deleted_at: new Date(),
        deletion_reason: reason || 'Deleted by admin'
      },
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }
    
    // ❌ Clear cache
    await deleteCacheByPrefix('admin:payments:');
    await deleteCacheByPrefix('admin:dashboard:');
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa giao dịch thành công',
      data: payment
    });
  });

  // Export payments to CSV/Excel
  exportPayments = catchAsync(async (req, res) => {
    const { status, packageType, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (packageType && packageType !== 'all') {
      query.packageType = packageType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const payments = await Payment.find(query)
      .populate('user', 'full_name email phone_number')
      .sort({ createdAt: -1 })
      .lean();
    
    // Format for export
    const exportData = payments.map(payment => ({
      'Mã giao dịch': payment.transactionId || payment._id,
      'Người dùng': payment.user?.full_name || 'N/A',
      'Email': payment.user?.email || 'N/A',
      'Số điện thoại': payment.user?.phone_number || 'N/A',
      'Gói dịch vụ': payment.packageName,
      'Loại gói': payment.packageType,
      'Số tiền': payment.amount,
      'Phương thức': payment.paymentMethod,
      'Trạng thái': payment.status,
      'Ngày tạo': payment.createdAt || payment.created_at,
      'Ngày hoàn thành': payment.completedAt || '',
      'Ghi chú': payment.notes || ''
    }));
    
    res.status(200).json({
      success: true,
      data: exportData,
      total: exportData.length
    });
  });
}

const instance = new AdminPaymentController();
export default {
  getAllPayments: instance.getAllPayments.bind(instance),
  getPaymentOverview: instance.getPaymentOverview.bind(instance),
  getPaymentDetail: instance.getPaymentDetail.bind(instance),
  updatePaymentStatus: instance.updatePaymentStatus.bind(instance),
  deletePayment: instance.deletePayment.bind(instance),
  exportPayments: instance.exportPayments.bind(instance)
};
