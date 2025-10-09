import express from 'express';
import authenticate from '../../middlewares/authenticate.js';
import { sendRentalRequestAcceptedNotification, sendRentalRequestRejectedNotification } from '../../utils/notificationHelper.js';

const router = express.Router();

// Test endpoint to send rental request notification
router.post('/test-rental-notification', authenticate, async (req, res) => {
  try {
    const { type, propertyTitle, propertyId } = req.body;
    const userId = req.user.id;

    console.log('🧪 Testing rental request notification:', { type, propertyTitle, propertyId, userId });

    if (type === 'accepted') {
      await sendRentalRequestAcceptedNotification(userId, propertyTitle, propertyId);
    } else if (type === 'rejected') {
      await sendRentalRequestRejectedNotification(userId, propertyTitle, propertyId);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type. Use "accepted" or "rejected"' });
    }

    res.json({ 
      success: true, 
      message: `Test notification sent: ${type}`,
      data: { type, propertyTitle, propertyId, userId }
    });
  } catch (error) {
    console.error('❌ Test notification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
