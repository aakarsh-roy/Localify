const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true // Ensures one review per booking
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  stars: {
    type: Number,
    required: [true, 'Please provide a star rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNote: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  isVisible: {
    type: Boolean,
    default: true
  },
  providerResponse: {
    comment: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ moderationStatus: 1 });

// Static method to get average rating for a provider
reviewSchema.statics.getAverageRating = async function(providerId) {
  const result = await this.aggregate([
    { $match: { provider: providerId, isVisible: true } },
    {
      $group: {
        _id: '$provider',
        averageRating: { $avg: '$stars' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews
    };
  }
  return { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);
