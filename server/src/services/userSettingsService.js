import UserSettings from '../models/userSettingsSchema.js';

class UserSettingsService {
  // Get user settings or create default if not exists
  async getUserSettings(userId) {
    try {
      let settings = await UserSettings.findOne({ user: userId }).populate('user', 'full_name email phone');
      
      if (!settings) {
        // Create default settings for new user
        settings = new UserSettings({
          user: userId
        });
        await settings.save();
      }
      
      return settings;
    } catch (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }
  }

  // Update user settings
  async updateUserSettings(userId, updates) {
    try {
      const settings = await UserSettings.findOneAndUpdate(
        { user: userId },
        { $set: updates },
        { new: true, upsert: true }
      ).populate('user', 'full_name email phone');

      return settings;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(userId, notificationUpdates) {
    try {
      const settings = await UserSettings.findOneAndUpdate(
        { user: userId },
        { $set: { notifications: notificationUpdates } },
        { new: true, upsert: true }
      );

      return settings;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  // Update privacy settings
  async updatePrivacySettings(userId, privacyUpdates) {
    try {
      const settings = await UserSettings.findOneAndUpdate(
        { user: userId },
        { $set: { privacy: privacyUpdates } },
        { new: true, upsert: true }
      );

      return settings;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  // Update security settings
  async updateSecuritySettings(userId, securityUpdates) {
    try {
      const settings = await UserSettings.findOneAndUpdate(
        { user: userId },
        { $set: { security: securityUpdates } },
        { new: true, upsert: true }
      );

      return settings;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  // Update display preferences
  async updateDisplaySettings(userId, displayUpdates) {
    try {
      const settings = await UserSettings.findOneAndUpdate(
        { user: userId },
        { $set: { display: displayUpdates } },
        { new: true, upsert: true }
      );

      return settings;
    } catch (error) {
      console.error('Error updating display settings:', error);
      throw error;
    }
  }

  // Reset settings to default
  async resetToDefault(userId) {
    try {
      const defaultSettings = new UserSettings({
        user: userId
      });

      const settings = await UserSettings.findOneAndUpdate(
        { user: userId },
        defaultSettings.toObject(),
        { new: true, upsert: true }
      );

      return settings;
    } catch (error) {
      console.error('Error resetting user settings:', error);
      throw error;
    }
  }

  // Get users with specific notification preferences (for admin/analytics)
  async getUsersByNotificationPreference(preference, value) {
    try {
      const query = {};
      query[`notifications.${preference}`] = value;

      const settings = await UserSettings.find(query).populate('user', 'full_name email');
      return settings;
    } catch (error) {
      console.error('Error getting users by notification preference:', error);
      throw error;
    }
  }

  // Bulk update notification settings (for admin)
  async bulkUpdateNotificationSettings(userIds, updates) {
    try {
      const result = await UserSettings.updateMany(
        { user: { $in: userIds } },
        { $set: { notifications: updates } }
      );

      return result;
    } catch (error) {
      console.error('Error bulk updating notification settings:', error);
      throw error;
    }
  }

  // Get notification statistics (for admin)
  async getNotificationStats() {
    try {
      const stats = await UserSettings.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            emailEnabled: {
              $sum: { $cond: ['$notifications.email', 1, 0] }
            },
            smsEnabled: {
              $sum: { $cond: ['$notifications.sms', 1, 0] }
            },
            pushEnabled: {
              $sum: { $cond: ['$notifications.push', 1, 0] }
            },
            marketingEnabled: {
              $sum: { $cond: ['$notifications.marketing', 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalUsers: 0,
        emailEnabled: 0,
        smsEnabled: 0,
        pushEnabled: 0,
        marketingEnabled: 0
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}

export default new UserSettingsService();







