// Import required modules
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const ModerationController = require('../controllers/ModerationController');

// Initialize controller
const moderationController = new ModerationController();

/**
 * @route GET /api/moderation/queue
 * @desc Get posts waiting for moderation
 * @access Private (Admin/Moderator)
 */
router.get('/queue', 
  authMiddleware.protect, 
  roleMiddleware.restrictTo('admin', 'moderator'), 
  moderationController.getModerationQueue
);

/**
 * @route GET /api/moderation/post/:id
 * @desc Get a specific post for moderation with details
 * @access Private (Admin/Moderator)
 */
router.get('/post/:id', 
  authMiddleware.protect, 
  roleMiddleware.restrictTo('admin', 'moderator'), 
  moderationController.getPostForModeration
);

/**
 * @route PUT /api/moderation/post/:id
 * @desc Moderate a post (approve/reject)
 * @access Private (Admin/Moderator)
 */
router.put('/post/:id', 
  authMiddleware.protect, 
  roleMiddleware.restrictTo('admin', 'moderator'), 
  moderationController.moderatePost
);

/**
 * @route GET /api/moderation/stats
 * @desc Get moderation statistics
 * @access Private (Admin/Moderator)
 */
router.get('/stats', 
  authMiddleware.protect, 
  roleMiddleware.restrictTo('admin', 'moderator'), 
  moderationController.getModerationStats
);

module.exports = router;