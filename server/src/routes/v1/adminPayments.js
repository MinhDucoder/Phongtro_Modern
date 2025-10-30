import express from 'express';
import AdminPaymentController from '../../controllers/AdminPaymentController.js';
import { authenticate } from '../../middlewares/checkToken.js';
import checkRole from '../../middlewares/checkRole.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate()); // ✅ Call authenticate as function
router.use(checkRole(['admin'])); // ✅ checkRole already returns middleware

// GET /api/v1/admin/payments - Get all payments with filters
router.get('/', AdminPaymentController.getAllPayments);

// GET /api/v1/admin/payments/overview - Get payment statistics
router.get('/overview', AdminPaymentController.getPaymentOverview);

// GET /api/v1/admin/payments/export - Export payments
router.get('/export', AdminPaymentController.exportPayments);

// GET /api/v1/admin/payments/:id - Get payment detail
router.get('/:id', AdminPaymentController.getPaymentDetail);

// PATCH /api/v1/admin/payments/:id - Update payment status
router.patch('/:id', AdminPaymentController.updatePaymentStatus);

// DELETE /api/v1/admin/payments/:id - Delete payment
router.delete('/:id', AdminPaymentController.deletePayment);

export default router;
