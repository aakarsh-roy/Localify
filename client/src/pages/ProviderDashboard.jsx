import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Star, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  User,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { providerAPI, bookingAPI, reviewAPI } from '../services/api';
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

  useEffect(() => {
    if (!provider) {
      navigate('/become-provider');
      return;
    }
    fetchDashboardData();
  }, [provider]);

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
                          <DollarSign className="h-4 w-4" />
                          <span>${booking.service?.price}</span>
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
          </div>
        </div>
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
