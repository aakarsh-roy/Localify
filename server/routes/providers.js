const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// @route   GET /api/providers
// @desc    Get all providers with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      city,
      lat,
      lng,
      radius = 10,
      minRating,
      sortBy = 'rating',
      page = 1,
      limit = 10,
      search
    } = req.query;

    let query = { isActive: true, verificationStatus: 'verified' };

    // Category filter
    if (category) {
      query['services.category'] = category;
    }

    // City filter
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    // Search filter
    if (search) {
      query.$or = [
        { businessName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'services.name': new RegExp(search, 'i') }
      ];
    }

    // Rating filter
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Geospatial query
    let providers;
    if (lat && lng) {
      providers = await ServiceProvider.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            distanceField: 'distance',
            maxDistance: parseFloat(radius) * 1000, // Convert km to meters
            spherical: true,
            query: query
          }
        },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      ]);

      // Populate user data
      await ServiceProvider.populate(providers, {
        path: 'user',
        select: 'name email phone avatar'
      });
    } else {
      // Sorting
      let sortOption = {};
      switch (sortBy) {
        case 'rating':
          sortOption = { averageRating: -1 };
          break;
        case 'reviews':
          sortOption = { totalReviews: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { averageRating: -1 };
      }

      providers = await ServiceProvider.find(query)
        .populate('user', 'name email phone avatar')
        .populate('services.category', 'name slug icon')
        .sort(sortOption)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));
    }

    const total = await ServiceProvider.countDocuments(query);

    res.json({
      success: true,
      data: {
        providers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
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

// @route   GET /api/providers/:id
// @desc    Get single provider by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('services.category', 'name slug icon');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Get reviews
    const reviews = await Review.find({ 
      provider: provider._id, 
      isVisible: true 
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        provider,
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/providers/register
// @desc    Register as a service provider
// @access  Private (User)
router.post('/register', protect, [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('experience').isInt({ min: 0 }).withMessage('Valid experience is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Valid coordinates are required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required')
], validate, async (req, res) => {
  try {
    // Check if already a provider
    const existingProvider = await ServiceProvider.findOne({ user: req.user.id });
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a provider'
      });
    }

    const {
      businessName,
      description,
      services,
      location,
      experience,
      serviceRadius,
      availability
    } = req.body;

    // Create provider profile
    const provider = await ServiceProvider.create({
      user: req.user.id,
      businessName,
      description,
      services,
      location: {
        type: 'Point',
        ...location
      },
      experience,
      serviceRadius,
      availability
    });

    // Update user role to provider
    await User.findByIdAndUpdate(req.user.id, { role: 'provider' });

    res.status(201).json({
      success: true,
      message: 'Provider registration successful. Pending verification.',
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/providers/profile
// @desc    Update provider profile
// @access  Private (Provider)
router.put('/profile', protect, authorize('provider'), async (req, res) => {
  try {
    const {
      businessName,
      description,
      services,
      location,
      experience,
      serviceRadius,
      availability,
      gallery
    } = req.body;

    const updateFields = {};
    if (businessName) updateFields.businessName = businessName;
    if (description) updateFields.description = description;
    if (services) updateFields.services = services;
    if (location) updateFields.location = { type: 'Point', ...location };
    if (experience) updateFields.experience = experience;
    if (serviceRadius) updateFields.serviceRadius = serviceRadius;
    if (availability) updateFields.availability = availability;
    if (gallery) updateFields.gallery = gallery;

    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.user.id },
      updateFields,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/providers/my/bookings
// @desc    Get provider's bookings
// @access  Private (Provider)
router.get('/my/bookings', protect, authorize('provider'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    const query = { provider: provider._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name phone email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
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

// @route   GET /api/providers/my/reviews
// @desc    Get provider's reviews
// @access  Private (Provider)
router.get('/my/reviews', protect, authorize('provider'), async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ provider: provider._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ provider: provider._id });

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          averageRating: provider.averageRating,
          totalReviews: provider.totalReviews
        },
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

// @route   PUT /api/providers/availability
// @desc    Update provider availability
// @access  Private (Provider)
router.put('/availability', protect, authorize('provider'), async (req, res) => {
  try {
    const { isAvailable, workingDays, workingHours } = req.body;

    const provider = await ServiceProvider.findOneAndUpdate(
      { user: req.user.id },
      {
        availability: {
          isAvailable,
          workingDays,
          workingHours
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Availability updated',
      data: provider.availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/providers/:id/reviews
// @desc    Get all reviews for a provider
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ 
      provider: req.params.id, 
      isVisible: true 
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ 
      provider: req.params.id, 
      isVisible: true 
    });

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { provider: require('mongoose').Types.ObjectId(req.params.id), isVisible: true } },
      { $group: { _id: '$stars', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
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

module.exports = router;
