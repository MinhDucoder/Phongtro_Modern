const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  // Metadata
  savedAt: {
    type: Date,
    default: Date.now
  },
  // Optional: notes from user about this favorite
  notes: {
    type: String,
    maxlength: 500
  },
  // Optional: tags for organization
  tags: [{
    type: String,
    maxlength: 50
  }]
}, {
  timestamps: true
});

// Indexes for performance
favoriteSchema.index({ user: 1, post: 1 }, { unique: true }); // Prevent duplicate favorites
favoriteSchema.index({ user: 1, savedAt: -1 }); // For sorting user's favorites by date
favoriteSchema.index({ post: 1 }); // For finding who saved a post

// Virtual for populated data
favoriteSchema.virtual('populatedPost', {
  ref: 'Post',
  localField: 'post',
  foreignField: '_id',
  justOne: true
});

favoriteSchema.virtual('populatedRoom', {
  ref: 'Room',
  localField: 'room',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Favorite', favoriteSchema);



