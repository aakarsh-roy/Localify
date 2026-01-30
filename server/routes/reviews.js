const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// @route   POST /api/reviews
// @desc    Create a review for a completed booking
// @access  Private (User)
router.post('/', protect, [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('stars').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], validate, async (req, res) => {
  try {
    const { bookingId, stars, comment } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if already reviewed
    if (booking.ratingSubmitted) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = await Review.create({
      booking: bookingId,
      user: req.user.id,
      provider: booking.provider,
      stars,
      comment
    });

    // Update booking
    booking.ratingSubmitted = true;
    await booking.save();

    // Update provider's average rating
    const provider = await ServiceProvider.findById(booking.provider);
    await provider.updateRating(stars);

    // Populate and return
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/reviews/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get('/my-reviews', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: req.user.id })
      .populate({
        path: 'provider',
        select: 'businessName averageRating'
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (User who created)
router.put('/:id', protect, [
  body('stars').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], validate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { stars, comment } = req.body;
    const oldStars = review.stars;

    if (stars) review.stars = stars;
    if (comment) review.comment = comment;

    await review.save();

    // Recalculate provider rating if stars changed
    if (stars && stars !== oldStars) {
      const { averageRating, totalReviews } = await Review.getAverageRating(review.provider);
      await ServiceProvider.findByIdAndUpdate(review.provider, {
        averageRating,
        totalReviews
      });
    }

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/reviews/:id/respond
// @desc    Provider responds to a review
// @access  Private (Provider)
router.post('/:id/respond', protect, authorize('provider'), [
  body('comment').trim().notEmpty().withMessage('Response comment is required')
    .isLength({ max: 300 }).withMessage('Response cannot exceed 300 characters')
], validate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if provider owns this review
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider || review.provider.toString() !== provider._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    review.providerResponse = {
      comment: req.body.comment,
      respondedAt: new Date()
    };
    await review.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (User/Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const providerId = review.provider;

    await review.deleteOne();

    // Update booking
    await Booking.findByIdAndUpdate(review.booking, { ratingSubmitted: false });

    // Recalculate provider rating
    const { averageRating, totalReviews } = await Review.getAverageRating(providerId);
    await ServiceProvider.findByIdAndUpdate(providerId, {
      averageRating,
      totalReviews
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
