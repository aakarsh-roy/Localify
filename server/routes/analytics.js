const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/ServiceProvider');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/provider
// @desc    Get provider analytics (revenue, bookings, demographics)
// @access  Private (Provider)
router.get('/provider', protect, async (req, res) => {
  try {
    // Find provider for current user
    const provider = await ServiceProvider.findOne({ user: req.user.id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    const providerId = provider._id;
    const { period = '30' } = req.query; // Default 30 days
    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);

    // Revenue by day/week/month - use completedAt or fallback to updatedAt
    const revenueData = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          status: 'completed'
        }
      },
      {
        $addFields: {
          effectiveDate: { $ifNull: ['$completedAt', '$updatedAt'] }
        }
      },
      {
        $match: {
          effectiveDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$effectiveDate' }
          },
          revenue: { $sum: '$service.price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing dates with zero revenue
    const revenueByDate = [];
    const dateMap = new Map(revenueData.map(r => [r._id, r]));
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const data = dateMap.get(dateStr);
      revenueByDate.push({
        date: dateStr,
        revenue: data?.revenue || 0,
        bookings: data?.count || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Weekly revenue aggregation
    const weeklyRevenue = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          status: 'completed'
        }
      },
      {
        $addFields: {
          effectiveDate: { $ifNull: ['$completedAt', '$updatedAt'] }
        }
      },
      {
        $match: {
          effectiveDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 84)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$effectiveDate' },
            week: { $isoWeek: '$effectiveDate' }
          },
          revenue: { $sum: '$service.price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      { $limit: 12 }
    ]);

    // Monthly revenue aggregation
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          status: 'completed'
        }
      },
      {
        $addFields: {
          effectiveDate: { $ifNull: ['$completedAt', '$updatedAt'] }
        }
      },
      {
        $match: {
          effectiveDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$effectiveDate' },
            month: { $month: '$effectiveDate' }
          },
          revenue: { $sum: '$service.price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly data with month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyRevenue = monthlyRevenue.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      bookings: item.count
    }));

    // Booking trends (status distribution)
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {
      pending: 0,
      accepted: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0,
      rejected: 0
    };
    bookingTrends.forEach(item => {
      statusMap[item._id] = item.count;
    });

    // Service popularity
    const servicePopularity = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$service.name',
          count: { $sum: 1 },
          revenue: { $sum: '$service.price' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Customer demographics (city distribution)
    const customerByCity = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Unique customers count
    const uniqueCustomers = await Booking.distinct('user', {
      provider: providerId,
      createdAt: { $gte: startDate }
    });

    // Repeat customers (customers with more than 1 booking)
    const repeatCustomersData = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          bookingCount: { $sum: 1 }
        }
      },
      {
        $match: {
          bookingCount: { $gt: 1 }
        }
      },
      {
        $count: 'repeatCustomers'
      }
    ]);

    const repeatCustomers = repeatCustomersData[0]?.repeatCustomers || 0;

    // Hourly booking distribution
    const hourlyDistribution = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          hour: {
            $toInt: { $arrayElemAt: [{ $split: ['$scheduledTime', ':'] }, 0] }
          }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format hourly data
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      bookings: 0
    }));
    hourlyDistribution.forEach(item => {
      if (item._id >= 0 && item._id < 24) {
        hourlyData[item._id].bookings = item.count;
      }
    });

    // Total stats
    const totalStats = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$service.price' },
          totalBookings: { $sum: 1 },
          avgOrderValue: { $avg: '$service.price' }
        }
      }
    ]);

    // Period stats (for comparison)
    const periodStats = await Booking.aggregate([
      {
        $match: {
          provider: providerId,
          status: 'completed'
        }
      },
      {
        $addFields: {
          effectiveDate: { $ifNull: ['$completedAt', '$updatedAt'] }
        }
      },
      {
        $match: {
          effectiveDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          periodRevenue: { $sum: '$service.price' },
          periodBookings: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalStats[0]?.totalRevenue || 0,
          totalBookings: totalStats[0]?.totalBookings || 0,
          avgOrderValue: Math.round(totalStats[0]?.avgOrderValue || 0),
          periodRevenue: periodStats[0]?.periodRevenue || 0,
          periodBookings: periodStats[0]?.periodBookings || 0,
          uniqueCustomers: uniqueCustomers.length,
          repeatCustomers,
          repeatRate: uniqueCustomers.length > 0 
            ? Math.round((repeatCustomers / uniqueCustomers.length) * 100) 
            : 0
        },
        revenue: {
          daily: revenueByDate,
          weekly: weeklyRevenue.map(w => ({
            week: `Week ${w._id.week}`,
            revenue: w.revenue,
            bookings: w.count
          })),
          monthly: formattedMonthlyRevenue
        },
        bookingTrends: {
          statusDistribution: statusMap,
          servicePopularity: servicePopularity.map(s => ({
            service: s._id,
            bookings: s.count,
            revenue: s.revenue
          }))
        },
        demographics: {
          byCity: customerByCity.map(c => ({
            city: c._id || 'Unknown',
            customers: c.count
          })),
          peakHours: hourlyData.filter(h => h.bookings > 0)
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
