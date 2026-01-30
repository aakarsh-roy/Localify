const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProviders,
      pendingProviders,
      totalBookings,
      completedBookings,
      pendingReviews
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      ServiceProvider.countDocuments(),
      ServiceProvider.countDocuments({ verificationStatus: 'pending' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Review.countDocuments({ moderationStatus: 'pending' })
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name')
      .populate('provider', 'businessName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProviders,
          pendingProviders,
          totalBookings,
          completedBookings,
          pendingReviews
        },
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20, search } = req.query;

    let query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/Deactivate user
// @access  Private (Admin)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/providers
// @desc    Get all providers
// @access  Private (Admin)
router.get('/providers', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.verificationStatus = status;

    const providers = await ServiceProvider.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ServiceProvider.countDocuments(query);

    res.json({
      success: true,
      data: {
        providers,
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

// @route   PUT /api/admin/providers/:id/verify
// @desc    Verify or reject a provider
// @access  Private (Admin)
router.put('/providers/:id/verify', [
  body('status').isIn(['verified', 'rejected']).withMessage('Invalid status')
], validate, async (req, res) => {
  try {
    const { status, note } = req.body;

    const provider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus: status,
        ...(note && { verificationNote: note })
      },
      { new: true }
    ).populate('user', 'name email');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      message: `Provider ${status} successfully`,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get reviews for moderation
// @access  Private (Admin)
router.get('/reviews', async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const reviews = await Review.find({ moderationStatus: status })
      .populate('user', 'name email')
      .populate('provider', 'businessName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ moderationStatus: status });

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

// @route   PUT /api/admin/reviews/:id/moderate
// @desc    Moderate a review
// @access  Private (Admin)
router.put('/reviews/:id/moderate', [
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status')
], validate, async (req, res) => {
  try {
    const { status, note } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: status,
        isModerated: true,
        moderatedBy: req.user.id,
        moderatedAt: new Date(),
        moderationNote: note,
        isVisible: status === 'approved'
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Recalculate provider rating if review was rejected
    if (status === 'rejected') {
      const { averageRating, totalReviews } = await Review.getAverageRating(review.provider);
      await ServiceProvider.findByIdAndUpdate(review.provider, {
        averageRating,
        totalReviews
      });
    }

    res.json({
      success: true,
      message: `Review ${status} successfully`,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/admin/categories
// @desc    Create a new category
// @access  Private (Admin)
router.post('/categories', [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim()
], validate, async (req, res) => {
  try {
    const { name, description, icon, image, order } = req.body;

    const category = await Category.create({
      name,
      description,
      icon,
      image,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/categories/:id
// @desc    Update a category
// @access  Private (Admin)
router.put('/categories/:id', async (req, res) => {
  try {
    const { name, description, icon, image, isActive, order } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon, image, isActive, order },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/categories/:id
// @desc    Delete a category
// @access  Private (Admin)
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
