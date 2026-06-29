const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (User)
router.post('/', protect, [
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('service.name').notEmpty().withMessage('Service name is required'),
  body('service.price').isNumeric().withMessage('Valid price is required'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('scheduledTime').notEmpty().withMessage('Scheduled time is required')
], validate, async (req, res) => {
  try {
    const {
      providerId,
      service,
      scheduledDate,
      scheduledTime,
      address,
      description
    } = req.body;

    // Check if provider exists and is available
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    if (!provider.availability.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Provider is currently unavailable'
      });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      provider: providerId,
      service,
      scheduledDate,
      scheduledTime,
      address,
      description,
      status: 'pending',
      totalAmount: service.price
    });

    // Populate and return
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'provider',
        select: 'businessName user',
        populate: { path: 'user', select: 'name phone' }
      });

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      data: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate({
        path: 'provider',
        select: 'businessName averageRating user location',
        populate: { path: 'user', select: 'name phone email' }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    const isProvider = provider && provider._id.toString() === booking.provider._id.toString();
    const isUser = booking.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isProvider && !isUser && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Provider/Admin)
router.put('/:id/status', protect, [
  body('status').isIn(['accepted', 'rejected', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status')
], validate, async (req, res) => {
  try {
    const { status, note } = req.body;
       
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    const isProvider = provider && provider._id.toString() === booking.provider.toString();
    const isUser = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Users can only cancel their own bookings
    if (isUser && status !== 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Users can only cancel their bookings'
      });
    }

    // Only providers can accept, reject, or mark as in-progress/completed
    if (!isProvider && !isAdmin && !isUser) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'pending': ['accepted', 'rejected', 'cancelled'],
      'accepted': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [],
      'rejected': [],
      'cancelled': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    booking.status = status;
    if (note) {
      if (isProvider) {
        booking.providerNote = note;
      } else {
        booking.userNote = note;
      }
    }

    if (status === 'cancelled') {
      booking.cancellationReason = note;
    }

    await booking.save();

    // Update provider's completed jobs count
    if (status === 'completed') {
      await ServiceProvider.findByIdAndUpdate(
        booking.provider,
        { $inc: { totalCompletedJobs: 1 } }
      );
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email phone')
      .populate({
        path: 'provider',
        select: 'businessName user',
        populate: { path: 'user', select: 'name phone' }
      });

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private (User who created)
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Can only cancel pending or accepted bookings
    if (!['pending', 'accepted'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking with current status'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
