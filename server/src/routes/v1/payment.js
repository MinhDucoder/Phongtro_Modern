import express from 'express';
import PaymentController from '../../controllers/PaymentController.js';
import { authenticate, authorize } from '../../middlewares/checkToken.js';
import catchAsync from '../../middlewares/catchAsync.js';

const paymentRoute = express.Router();

// All payment routes require authentication
paymentRoute.use(authenticate());

// Dashboard payment routes (for landlords to view their payment history)
paymentRoute.get('/dashboard/history', catchAsync(PaymentController.getPaymentHistory));
paymentRoute.get('/dashboard/stats', catchAsync(PaymentController.getPaymentStats));
paymentRoute.get('/dashboard/:id', catchAsync(PaymentController.getPaymentDetail));
paymentRoute.get('/dashboard/:id/invoice', catchAsync(PaymentController.downloadInvoice));

// Admin/Payment gateway routes
paymentRoute.post('/', catchAsync(PaymentController.createPayment));
paymentRoute.patch('/:transactionId/status', catchAsync(PaymentController.updatePaymentStatus));

export default paymentRoute;