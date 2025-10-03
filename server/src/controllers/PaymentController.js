import Payment from "../models/paymentSchema.js";
import { success, error } from "../utils/responeHandler.js";
import mongoose from "mongoose";

class PaymentController {
  // Get payment history for a user
  async getPaymentHistory(req, res, next) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const packageType = req.query.packageType;

      // Build query
      const query = { user: userId };
      if (status && status !== 'all') {
        query.status = status;
      }
      if (packageType && packageType !== 'all') {
        query.packageType = packageType;
      }

      // Calculate skip
      const skip = (page - 1) * limit;

      // Get payments with pagination
      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Payment.countDocuments(query);

      // Format response
      const formattedPayments = payments.map(payment => ({
        id: payment._id,
        packageName: payment.packageName,
        packageType: payment.packageType,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        packageStartDate: payment.packageStartDate,
        packageEndDate: payment.packageEndDate,
        packageDuration: payment.packageDuration,
        invoiceUrl: payment.invoice?.invoiceUrl,
        notes: payment.notes,
        createdAt: payment.created_at,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt,
        failureReason: payment.failureReason,
      }));

      return success(res, {
        payments: formattedPayments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Get payment statistics for a user
  async getPaymentStats(req, res, next) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);

      console.log('📊 Getting payment stats for user:', userId);

      // Get basic stats
      const totalPayments = await Payment.countDocuments({ user: userId });
      const completedPayments = await Payment.countDocuments({ 
        user: userId, 
        status: 'completed' 
      });
      const pendingPayments = await Payment.countDocuments({ 
        user: userId, 
        status: 'pending' 
      });
      const failedPayments = await Payment.countDocuments({ 
        user: userId, 
        status: 'failed' 
      });

      console.log('📊 Basic stats:', { totalPayments, completedPayments, pendingPayments, failedPayments });

      // Get total amount spent
      const totalSpent = await Payment.aggregate([
        { $match: { user: userId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      console.log('💰 Total spent:', totalSpent[0]?.total || 0);

      // Get current active package
      const currentDate = new Date();
      const activePackage = await Payment.findOne({
        user: userId,
        status: 'completed',
        packageStartDate: { $lte: currentDate },
        packageEndDate: { $gte: currentDate }
      }).sort({ packageEndDate: -1 }).lean();

      console.log('📦 Active package:', activePackage ? activePackage.packageName : 'None');

      // Get monthly spending for last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlySpending = await Payment.aggregate([
        {
          $match: {
            user: userId,
            status: 'completed',
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      console.log('📈 Monthly spending records:', monthlySpending.length);

      // Get package type distribution
      const packageDistribution = await Payment.aggregate([
        { $match: { user: userId, status: 'completed' } },
        {
          $group: {
            _id: '$packageType',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      console.log('📊 Package distribution:', packageDistribution);

      const stats = {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        totalSpent: totalSpent[0]?.total || 0,
        activePackage: activePackage ? {
          packageName: activePackage.packageName,
          packageType: activePackage.packageType,
          endDate: activePackage.packageEndDate,
          daysRemaining: Math.ceil((activePackage.packageEndDate - currentDate) / (1000 * 60 * 60 * 24))
        } : null,
        monthlySpending,
        packageDistribution
      };

      console.log('✅ Payment stats compiled successfully');
      return success(res, stats);
    } catch (err) {
      console.error('❌ Error getting payment stats:', err);
      return error(res, err.message, 500);
    }
  }

  // Get single payment detail
  async getPaymentDetail(req, res, next) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const paymentId = req.params.id;

      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId
      }).lean();

      if (!payment) {
        return error(res, 'Payment not found', 404);
      }

      // Format response
      const formattedPayment = {
        id: payment._id,
        packageName: payment.packageName,
        packageType: payment.packageType,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        referenceId: payment.referenceId,
        packageStartDate: payment.packageStartDate,
        packageEndDate: payment.packageEndDate,
        packageDuration: payment.packageDuration,
        invoice: payment.invoice,
        notes: payment.notes,
        createdAt: payment.created_at,
        completedAt: payment.completedAt,
        failedAt: payment.failedAt,
        failureReason: payment.failureReason,
        gatewayResponse: payment.gatewayResponse,
      };

      return success(res, formattedPayment);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Create a new payment record (usually called by payment gateway webhook)
  async createPayment(req, res, next) {
    try {
      const paymentData = req.body;
      
      // Validate required fields
      if (!paymentData.user || !paymentData.packageName || !paymentData.amount) {
        return error(res, 'Missing required fields', 400);
      }

      const payment = new Payment(paymentData);
      await payment.save();

      return success(res, payment, 201);
    } catch (err) {
      return error(res, err.message, 400);
    }
  }

  // Update payment status (for webhook callbacks)
  async updatePaymentStatus(req, res, next) {
    try {
      const { transactionId } = req.params;
      const { status, gatewayResponse, failureReason } = req.body;

      const updateData = { status };
      
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'failed') {
        updateData.failedAt = new Date();
        updateData.failureReason = failureReason;
      }

      if (gatewayResponse) {
        updateData.gatewayResponse = gatewayResponse;
      }

      const payment = await Payment.findOneAndUpdate(
        { transactionId },
        updateData,
        { new: true }
      );

      if (!payment) {
        return error(res, 'Payment not found', 404);
      }

      return success(res, payment);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Download invoice
  async downloadInvoice(req, res, next) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const paymentId = req.params.id;

      const payment = await Payment.findOne({
        _id: paymentId,
        user: userId
      });

      if (!payment) {
        return error(res, 'Payment not found', 404);
      }

      if (!payment.invoice?.invoiceUrl) {
        return error(res, 'Invoice not available', 404);
      }

      // In a real implementation, you would generate and return the invoice file
      // For now, return the invoice URL
      return success(res, {
        invoiceUrl: payment.invoice.invoiceUrl,
        invoiceNumber: payment.invoice.invoiceNumber
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  }
}

export default new PaymentController();



