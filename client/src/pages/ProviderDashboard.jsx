import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, navigate]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const statusConfig = {
    'pending': 'warning',
    'accepted': 'secondary',
    'in-progress': 'default',
    'completed': 'success',
    'cancelled': 'secondary',
    'rejected': 'destructive'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12 animate-fade-in-up">
        {/* Header / Banner */}
        <div className="mb-10 bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="relative z-10 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <Avatar 
                  src={user?.avatarUrl} 
                  alt={user?.name} 
                  fallback={user?.name?.charAt(0)}
                  size="lg"
                />
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-950 tracking-tight">
                    Welcome, {user?.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-neutral-500 font-medium mt-1">{provider?.businessName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {provider?.verificationStatus === 'pending' && (
                  <Badge variant="warning">
                    Pending Verification
                  </Badge>
                )}
                <Button
                  variant={availability ? 'success' : 'outline'}
                  onClick={toggleAvailability}
                  className={availability ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-neutral-950 border-neutral-200'}
                >
                  {availability ? 'Available' : 'Unavailable'}
                </Button>
              </div>
            </div>
            <p className="text-neutral-500 text-lg font-medium max-w-lg">Manage your services, respond to bookings, and track your business performance from your professional dashboard.</p>
          </div>
          
          <div className="relative z-10 w-full max-w-[280px] md:max-w-[320px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-200 to-transparent rounded-full blur-3xl opacity-50 -z-10" />
            <motion.img 
              src="/images/provider-banner.png" 
              alt="Provider overview" 
              className="w-full h-auto drop-shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-neutral-950" />
                </div>
                <span className="text-3xl font-black text-neutral-950 tracking-tight">{stats.totalBookings}</span>
              </div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Total Bookings</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-neutral-950" />
                </div>
                <span className="text-3xl font-black text-neutral-950 tracking-tight">{stats.pending}</span>
              </div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Pending Requests</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-neutral-950" />
                </div>
                <span className="text-3xl font-black text-neutral-950 tracking-tight">{stats.completed}</span>
              </div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Completed Jobs</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Star className="h-5 w-5 text-neutral-950" />
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-neutral-950 tracking-tight">{stats.avgRating.toFixed(1)}</span>
                  <p className="text-xs text-neutral-400 font-medium">({stats.totalReviews} reviews)</p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="overflow-hidden bg-white shadow-subtle border border-neutral-200">
          <div className="border-b border-neutral-200 bg-white">
            <nav className="flex overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-8 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'bookings'
                    ? 'border-neutral-950 text-neutral-950 bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-8 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'border-neutral-950 text-neutral-950 bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-8 py-5 text-sm font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-neutral-950 text-neutral-950 bg-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </button>
            </nav>
          </div>

          <CardContent className="p-6">
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                      <Calendar className="h-8 w-8 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 font-medium">No bookings yet</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking._id} className="border border-neutral-200 rounded-2xl p-5 hover:border-neutral-950 hover:shadow-subtle transition-all bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
                        <div>
                          <h3 className="font-bold text-neutral-950 text-lg mb-1 tracking-tight">{booking.service?.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
                            <User className="h-4 w-4" />
                            <span>{booking.user?.name}</span>
                          </div>
                        </div>
                        <Badge variant={statusConfig[booking.status] || 'secondary'} className="capitalize self-start">
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-neutral-600 font-medium mb-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4.5 w-4.5 text-neutral-400" />
                          <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4.5 w-4.5 text-neutral-400" />
                          <span>{booking.scheduledTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-950 font-extrabold">
                          <IndianRupee className="h-4.5 w-4.5 text-neutral-950" />
                          <span>{booking.service?.price}</span>
                        </div>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-neutral-100">
                          <Button
                            variant="primary"
                            onClick={() => handleBookingAction(booking._id, 'accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleBookingAction(booking._id, 'rejected', 'Booking declined')}
                          >
                            Decline
                          </Button>
                        </div>
                      )}

                      {booking.status === 'accepted' && (
                        <div className="pt-4 border-t border-neutral-100">
                          <Button
                            variant="primary"
                            onClick={() => handleBookingAction(booking._id, 'in-progress')}
                          >
                            Start Job
                          </Button>
                        </div>
                      )}

                      {booking.status === 'in-progress' && (
                        <div className="pt-4 border-t border-neutral-100">
                          <Button
                            variant="primary"
                            onClick={() => handleBookingAction(booking._id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                      <Star className="h-8 w-8 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 font-medium">No reviews yet</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="border border-neutral-200 rounded-2xl p-5 hover:border-neutral-950 hover:shadow-subtle transition-all bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            src={review.user?.avatarUrl} 
                            alt={review.user?.name} 
                            fallback={review.user?.name?.charAt(0)}
                            size="md"
                          />
                          <div>
                            <p className="font-bold text-neutral-950">{review.user?.name}</p>
                            <p className="text-sm text-neutral-500 font-medium">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={review.stars} size="sm" showValue={false} />
                      </div>

                      <p className="text-neutral-600 font-medium leading-relaxed mb-4">{review.comment}</p>

                      {review.providerResponse ? (
                        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Your Response:</p>
                          <p className="text-sm text-neutral-700 font-medium leading-relaxed">{review.providerResponse.comment}</p>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Chart colors
const COLORS = ['#09090b', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa'];

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
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200">
          <BarChart3 className="h-8 w-8 text-neutral-400" />
        </div>
        <p className="text-neutral-500 font-medium">No analytics data available</p>
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

  const baseInputClass = "px-4 py-2 rounded-xl border border-neutral-200 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 bg-white text-neutral-950 outline-none transition-all shadow-sm";

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-950 tracking-tight">Analytics Overview</h3>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className={`${baseInputClass} w-auto font-bold text-sm`}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-neutral-950 rounded-2xl p-6 text-white shadow-elevated relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="p-2 bg-neutral-800 rounded-lg">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Period Revenue</span>
          </div>
          <p className="text-3xl font-extrabold relative z-10 tracking-tight">₹{summary.periodRevenue.toLocaleString()}</p>
          <p className="text-xs font-medium text-neutral-400 mt-2 relative z-10">{summary.periodBookings} bookings</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="p-2 bg-neutral-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-neutral-950" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total Revenue</span>
          </div>
          <p className="text-3xl font-extrabold text-neutral-950 relative z-10 tracking-tight">₹{summary.totalRevenue.toLocaleString()}</p>
          <p className="text-xs font-medium text-neutral-500 mt-2 relative z-10">All time</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="p-2 bg-neutral-100 rounded-lg">
              <Users className="h-5 w-5 text-neutral-950" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Unique Customers</span>
          </div>
          <p className="text-3xl font-extrabold text-neutral-950 relative z-10 tracking-tight">{summary.uniqueCustomers}</p>
          <p className="text-xs font-medium text-neutral-500 mt-2 relative z-10">{summary.repeatRate}% repeat rate</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="p-2 bg-neutral-100 rounded-lg">
              <IndianRupee className="h-5 w-5 text-neutral-950" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Avg Order Value</span>
          </div>
          <p className="text-3xl font-extrabold text-neutral-950 relative z-10 tracking-tight">₹{summary.avgOrderValue.toLocaleString()}</p>
          <p className="text-xs font-medium text-neutral-500 mt-2 relative z-10">Per booking</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <Card className="bg-white border border-neutral-200 shadow-sm">
        <CardHeader className="pb-2 border-b border-neutral-100">
          <CardTitle className="tracking-tight">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {revenue.daily.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenue.daily} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#737373', fontWeight: 600 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#737373', fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Bookings'
                  ]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { 
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
                  })}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#09090b" 
                  strokeWidth={3}
                  dot={{ fill: '#09090b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#71717a" 
                  strokeWidth={3}
                  dot={{ fill: '#71717a', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Bookings"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-neutral-500 font-medium">
              No revenue data for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      {revenue.monthly.length > 0 && (
        <Card className="bg-white border border-neutral-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-neutral-100">
            <CardTitle className="tracking-tight">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={revenue.monthly} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#737373', fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#737373', fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  cursor={{ fill: '#f4f4f5' }}
                />
                <Bar dataKey="revenue" fill="#09090b" radius={[6, 6, 0, 0]} name="Revenue" maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Status Distribution */}
        {statusData.length > 0 && (
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="tracking-tight">Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <RechartsPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    innerRadius={50}
                    fill="#09090b"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    stroke="none"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontWeight: 'bold' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Service Popularity */}
        {bookingTrends.servicePopularity.length > 0 && (
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="tracking-tight">Top Services</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {bookingTrends.servicePopularity.slice(0, 5).map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-white shadow-sm text-neutral-950 rounded-full flex items-center justify-center text-sm font-bold border border-neutral-200">
                        {index + 1}
                      </span>
                      <span className="text-neutral-950 font-bold">{service.service}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-950 font-extrabold block">₹{service.revenue.toLocaleString()}</span>
                      <span className="text-neutral-500 font-bold text-[10px] uppercase tracking-wider">{service.bookings} bookings</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Demographics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* By City */}
        {demographics.byCity.length > 0 && (
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="tracking-tight">Customers by City</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={demographics.byCity} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={false} />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12, fill: '#737373', fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    dataKey="city" 
                    type="category" 
                    width={100} 
                    tick={{ fontSize: 12, fill: '#737373', fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    cursor={{ fill: '#f4f4f5' }}
                  />
                  <Bar dataKey="customers" fill="#09090b" radius={[0, 6, 6, 0]} name="Customers" maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Peak Hours */}
        {demographics.peakHours.length > 0 && (
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardHeader className="pb-2 border-b border-neutral-100">
              <CardTitle className="tracking-tight">Peak Booking Hours</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={demographics.peakHours} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12, fill: '#737373', fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#737373', fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    cursor={{ fill: '#f4f4f5' }}
                  />
                  <Bar dataKey="bookings" fill="#52525b" radius={[6, 6, 0, 0]} name="Bookings" maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
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

  const baseInputClass = "w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 bg-white text-neutral-950 outline-none transition-all placeholder:text-neutral-400 shadow-sm";

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-4 w-4 mr-1.5" />
        Respond to review
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200 shadow-sm">
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your response..."
        rows={3}
        className={`${baseInputClass} resize-none mb-3 font-medium`}
        required
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setResponse('');
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
        >
          Submit Response
        </Button>
      </div>
    </form>
  );
};

export default ProviderDashboard;
