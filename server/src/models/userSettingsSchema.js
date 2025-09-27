import mongoose from "mongoose";

const { Schema } = mongoose;

const userSettingsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Notification preferences
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    },
    newMessages: {
      type: Boolean,
      default: true
    },
    postUpdates: {
      type: Boolean,
      default: true
    },
    systemUpdates: {
      type: Boolean,
      default: true
    },
    rentalRequests: {
      type: Boolean,
      default: true
    },
    favoriteUpdates: {
      type: Boolean,
      default: true
    }
  },
  
  // Privacy settings
  privacy: {
    showPhone: {
      type: Boolean,
      default: true
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    allowMessages: {
      type: Boolean,
      default: true
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowFriendRequests: {
      type: Boolean,
      default: true
    }
  },
  
  // Security settings
  security: {
    twoFactor: {
      type: Boolean,
      default: false
    },
    loginAlerts: {
      type: Boolean,
      default: true
    },
    sessionTimeout: {
      type: Number,
      default: 30 // minutes
    },
    requirePasswordForChanges: {
      type: Boolean,
      default: true
    }
  },
  
  // Display preferences
  display: {
    language: {
      type: String,
      default: 'vi',
      enum: ['vi', 'en']
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    }
  },
  
  // Email frequency settings
  emailFrequency: {
    digest: {
      type: String,
      default: 'weekly',
      enum: ['daily', 'weekly', 'monthly', 'never']
    },
    marketing: {
      type: String,
      default: 'monthly',
      enum: ['daily', 'weekly', 'monthly', 'never']
    }
  }
}, {
  timestamps: true
});

// Index for performance
userSettingsSchema.index({ user: 1 });

// Virtual for populated user data
userSettingsSchema.virtual('populatedUser', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

export default mongoose.model('UserSettings', userSettingsSchema);







