import userSettingsService from '../services/userSettingsService.js';

class UserSettingsController {
  // GET /api/v1/user/settings - Get user settings
  async getUserSettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = await userSettingsService.getUserSettings(userId);

      res.json({
        success: true,
        data: settings,
        message: 'User settings retrieved successfully'
      });
    } catch (error) {
      console.error('Get user settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving user settings'
      });
    }
  }

  // PUT /api/v1/user/settings - Update user settings
  async updateUserSettings(req, res) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Validate updates object
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid settings data'
        });
      }

      const settings = await userSettingsService.updateUserSettings(userId, updates);

      res.json({
        success: true,
        data: settings,
        message: 'User settings updated successfully'
      });
    } catch (error) {
      console.error('Update user settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating user settings'
      });
    }
  }

  // PUT /api/v1/user/settings/notifications - Update notification settings
  async updateNotificationSettings(req, res) {
    try {
      const userId = req.user.id;
      const notificationUpdates = req.body;

      if (!notificationUpdates || typeof notificationUpdates !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification settings data'
        });
      }

      const settings = await userSettingsService.updateNotificationSettings(userId, notificationUpdates);

      res.json({
        success: true,
        data: settings,
        message: 'Notification settings updated successfully'
      });
    } catch (error) {
      console.error('Update notification settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating notification settings'
      });
    }
  }

  // PUT /api/v1/user/settings/privacy - Update privacy settings
  async updatePrivacySettings(req, res) {
    try {
      const userId = req.user.id;
      const privacyUpdates = req.body;

      if (!privacyUpdates || typeof privacyUpdates !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid privacy settings data'
        });
      }

      const settings = await userSettingsService.updatePrivacySettings(userId, privacyUpdates);

      res.json({
        success: true,
        data: settings,
        message: 'Privacy settings updated successfully'
      });
    } catch (error) {
      console.error('Update privacy settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating privacy settings'
      });
    }
  }

  // PUT /api/v1/user/settings/security - Update security settings
  async updateSecuritySettings(req, res) {
    try {
      const userId = req.user.id;
      const securityUpdates = req.body;

      if (!securityUpdates || typeof securityUpdates !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid security settings data'
        });
      }

      const settings = await userSettingsService.updateSecuritySettings(userId, securityUpdates);

      res.json({
        success: true,
        data: settings,
        message: 'Security settings updated successfully'
      });
    } catch (error) {
      console.error('Update security settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating security settings'
      });
    }
  }

  // PUT /api/v1/user/settings/display - Update display settings
  async updateDisplaySettings(req, res) {
    try {
      const userId = req.user.id;
      const displayUpdates = req.body;

      if (!displayUpdates || typeof displayUpdates !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid display settings data'
        });
      }

      const settings = await userSettingsService.updateDisplaySettings(userId, displayUpdates);

      res.json({
        success: true,
        data: settings,
        message: 'Display settings updated successfully'
      });
    } catch (error) {
      console.error('Update display settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating display settings'
      });
    }
  }

  // POST /api/v1/user/settings/reset - Reset settings to default
  async resetSettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = await userSettingsService.resetToDefault(userId);

      res.json({
        success: true,
        data: settings,
        message: 'Settings reset to default successfully'
      });
    } catch (error) {
      console.error('Reset settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error resetting settings'
      });
    }
  }

  // GET /api/v1/user/settings/stats - Get notification statistics (admin only)
  async getNotificationStats(req, res) {
    try {
      const stats = await userSettingsService.getNotificationStats();

      res.json({
        success: true,
        data: stats,
        message: 'Notification statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Get notification stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving notification statistics'
      });
    }
  }

  // GET /api/v1/user/settings/users-by-preference - Get users by notification preference (admin only)
  async getUsersByNotificationPreference(req, res) {
    try {
      const { preference, value } = req.query;

      if (!preference || value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Preference and value parameters are required'
        });
      }

      const users = await userSettingsService.getUsersByNotificationPreference(preference, value === 'true');

      res.json({
        success: true,
        data: users,
        message: 'Users retrieved by notification preference'
      });
    } catch (error) {
      console.error('Get users by notification preference error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving users by notification preference'
      });
    }
  }

  // PUT /api/v1/user/settings/bulk-notifications - Bulk update notification settings (admin only)
  async bulkUpdateNotificationSettings(req, res) {
    try {
      const { userIds, updates } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required'
        });
      }

      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid notification updates data'
        });
      }

      const result = await userSettingsService.bulkUpdateNotificationSettings(userIds, updates);

      res.json({
        success: true,
        data: result,
        message: 'Bulk notification settings updated successfully'
      });
    } catch (error) {
      console.error('Bulk update notification settings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error bulk updating notification settings'
      });
    }
  }
}

export default new UserSettingsController();





