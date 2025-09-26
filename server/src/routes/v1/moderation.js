import express from 'express';
import ModerationController from '../../controllers/ModerationController.js';
import authenticate from '../../middlewares/authenticate.js';
import checkRole from '../../middlewares/checkRole.js';

const moderationRoutes = express.Router();

// Protect all moderation routes with authentication and admin role check
moderationRoutes.use(authenticate);
moderationRoutes.use(checkRole(['admin']));

// Dashboard overview
moderationRoutes.get('/dashboard', ModerationController.getModerationDashboard);

// Moderation queue and actions
moderationRoutes.get('/queue', ModerationController.getModerationQueue);
moderationRoutes.get('/posts/:postId', ModerationController.getPostForModeration);
moderationRoutes.patch('/posts/:id/approve', ModerationController.quickApprove);
moderationRoutes.patch('/posts/:id/reject', ModerationController.quickReject);
moderationRoutes.patch('/posts/:postId/moderate', ModerationController.moderatePost);
moderationRoutes.post('/bulk-action', ModerationController.bulkModerationAction);

// Moderation history and stats
moderationRoutes.get('/history', ModerationController.getModerationHistory);
// stats endpoint removed

export default moderationRoutes;