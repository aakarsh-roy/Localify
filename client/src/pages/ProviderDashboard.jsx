import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Star, 
  IndianRupee,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  User,
  MessageSquare,
  TrendingUp,
  Users,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { providerAPI, bookingAPI, reviewAPI, analyticsAPI } from '../services/api';
import StarRating from '../components/ui/StarRating';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProviderDashboard = () => {
  const { user, provider, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pending: 0,
    completed: 0,
    avgRating: 0,
    totalReviews: 0
  });
  const [activeTab, setActiveTab] = useState('bookings');
  const [availability, setAvailability] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30');

  useEffect(() => {
    if (!provider) {
      navigate('/become-provider');
      return;
    }
    fetchDashboardData();
  }, [provider]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, analyticsPeriod]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await analyticsAPI.getProviderAnalytics({ period: analyticsPeriod });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, reviewsRes] = await Promise.all([
        providerAPI.getMyBookings({ limit: 10 }),
        providerAPI.getMyReviews({ limit: 5 })
      ]);

      setBookings(bookingsRes.data.data.bookings);
      setReviews(reviewsRes.data.data.reviews);
      setStats({
        totalBookings: bookingsRes.data.data.pagination.total,
        pending: bookingsRes.data.data.bookings.filter(b => b.status === 'pending').length,
        completed: bookingsRes.data.data.bookings.filter(b => b.status === 'completed').length,
        avgRating: reviewsRes.data.data.stats?.averageRating || 0,
        totalReviews: reviewsRes.data.data.stats?.totalReviews || 0
      });
      setAvailability(provider?.availability?.isAvailable ?? true);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, status, note = '') => {
    try {
      await bookingAPI.updateStatus(bookingId, { status, note });
      toast.success(`Booking ${status} successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const toggleAvailability = async () => {
    try {
      await providerAPI.updateAvailability({ isAvailable: !availability });
      setAvailability(!availability);
      await checkAuth();
      toast.success(`You are now ${!availability ? 'available' : 'unavailable'}`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleRespondToReview = async (reviewId, comment) => {
    try {
      await reviewAPI.respond(reviewId, { comment });
      toast.success('Response submitted');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to submit response');
    }
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-700',
    'accepted': 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-purple-100 text-purple-700',
    'completed': 'bg-green-100 text-green-700',
    'cancelled': 'bg-gray-100 text-gray-600',
    'rejected': 'bg-red-100 text-red-700'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600">{provider?.businessName}</p>
          </div>
          <div className="flex items-center gap-4">
            {provider?.verificationStatus === 'pending' && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Pending Verification
              </span>
            )}
            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                availability
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {availability ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-8 w-8 text-primary-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalBookings}</span>
            </div>
            <p className="text-gray-500">Total Bookings</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.pending}</span>
            </div>
            <p className="text-gray-500">Pending Requests</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.completed}</span>
            </div>
            <p className="text-gray-500">Completed Jobs</p>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="text-right">
                <span className="text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</span>
                <p className="text-sm text-gray-500">({stats.totalReviews} reviews)</p>
              </div>
            </div>
            <p className="text-gray-500">Average Rating</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'bookings'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'reviews'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No bookings yet</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{booking.service?.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <User className="h-4 w-4" />
                            <span>{booking.user?.name}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{booking.scheduledTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4" />
                          <span>₹{booking.service?.price}</span>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBookingAction(booking._id, 'accepted')}
                            className="btn-primary text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking._id, 'rejected', 'Booking declined')}
                            className="btn-secondary text-sm"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => handleBookingAction(booking._id, 'in-progress')}
                          className="btn-primary text-sm"
                        >
                          Start Job
                        </button>
                      )}

                      {booking.status === 'in-progress' && (
                        <button
                          onClick={() => handleBookingAction(booking._id, 'completed')}
                          className="btn-primary text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.user?.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={review.stars} size="sm" showValue={false} />
                      </div>

                      <p className="text-gray-600 mb-3">{review.comment}</p>

                      {review.providerResponse ? (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Your Response:</p>
                          <p className="text-sm text-gray-600">{review.providerResponse.comment}</p>
                        </div>
                      ) : (
                        <RespondForm reviewId={review._id} onSubmit={handleRespondToReview} />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsContent 
                analytics={analytics}
                loading={analyticsLoading}
                period={analyticsPeriod}
                onPeriodChange={setAnalyticsPeriod}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chart colors
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Analytics Content Component
const AnalyticsContent = ({ analytics, loading, period, onPeriodChange }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const { summary, revenue, bookingTrends, demographics } = analytics;

  // Prepare status distribution data for pie chart
  const statusData = Object.entries(bookingTrends.statusDistribution)
    .filter(([_, value]) => value > 0)
    .map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: count
    }));

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Analytics Overview</h3>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="input-field w-auto"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="h-5 w-5" />
            <span className="text-sm opacity-90">Period Revenue</span>
          </div>
          <p className="text-2xl font-bold">₹{summary.periodRevenue.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">{summary.periodBookings} bookings</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm opacity-90">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">₹{summary.totalRevenue.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">All time</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5" />
            <span className="text-sm opacity-90">Unique Customers</span>
          </div>
          <p className="text-2xl font-bold">{summary.uniqueCustomers}</p>
          <p className="text-xs opacity-75 mt-1">{summary.repeatRate}% repeat rate</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="h-5 w-5" />
            <span className="text-sm opacity-90">Avg Order Value</span>
          </div>
          <p className="text-2xl font-bold">₹{summary.avgOrderValue.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-1">Per booking</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Revenue Trend</h4>
        {revenue.daily.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenue.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Bookings'
                ]}
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { 
                  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
                })}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4F46E5" 
                strokeWidth={2}
                dot={{ fill: '#4F46E5', strokeWidth: 2 }}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2 }}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No revenue data for this period
          </div>
        )}
      </div>

      {/* Monthly Revenue */}
      {revenue.monthly.length > 0 && (
        <div className="bg-white border rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenue.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Status Distribution */}
        {statusData.length > 0 && (
          <div className="bg-white border rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Booking Status Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Service Popularity */}
        {bookingTrends.servicePopularity.length > 0 && (
          <div className="bg-white border rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Top Services</h4>
            <div className="space-y-3">
              {bookingTrends.servicePopularity.slice(0, 5).map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-900 font-medium">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900 font-semibold">₹{service.revenue.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm ml-2">({service.bookings} bookings)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer Demographics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* By City */}
        {demographics.byCity.length > 0 && (
          <div className="bg-white border rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Customers by City</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={demographics.byCity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="city" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="customers" fill="#10B981" radius={[0, 4, 4, 0]} name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Peak Hours */}
        {demographics.peakHours.length > 0 && (
          <div className="bg-white border rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Peak Booking Hours</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={demographics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// Response Form Component
const RespondForm = ({ reviewId, onSubmit }) => {
  const [response, setResponse] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (response.trim()) {
      onSubmit(reviewId, response);
      setResponse('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
      >
        <MessageSquare className="h-4 w-4" />
        Respond to review
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        className="input-field text-sm resize-none"
        rows={2}
        placeholder="Write your response..."
        maxLength={300}
      />
      <div className="flex gap-2 mt-2">
        <button type="submit" className="btn-primary text-sm">
          Submit
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProviderDashboard;
