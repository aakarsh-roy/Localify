const mongoose = require('mongoose');

const serviceProviderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  services: [{
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    priceType: {
      type: String,
      enum: ['fixed', 'hourly', 'negotiable'],
      default: 'fixed'
    },
    description: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    zipCode: String
  },
  serviceRadius: {
    type: Number,
    default: 10, // in kilometers
    min: [1, 'Service radius must be at least 1 km'],
    max: [100, 'Service radius cannot exceed 100 km']
  },
  experience: {
    type: Number,
    required: [true, 'Please provide years of experience'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalCompletedJobs: {
    type: Number,
    default: 0
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '18:00'
      }
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [{
    documentType: String,
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  gallery: [{
    imageUrl: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
serviceProviderSchema.index({ 'location.coordinates': '2dsphere' });

// Index for text search
serviceProviderSchema.index({ businessName: 'text', description: 'text' });

// Method to update rating after new review
serviceProviderSchema.methods.updateRating = async function(newRating) {
  const totalRatingPoints = (this.averageRating * this.totalReviews) + newRating;
  this.totalReviews += 1;
  this.averageRating = Math.round((totalRatingPoints / this.totalReviews) * 10) / 10;
  await this.save();
};

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);
