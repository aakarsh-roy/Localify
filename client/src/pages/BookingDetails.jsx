import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/reviews/ReviewForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await bookingAPI.getById(id);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setCancelling(true);
    try {
      await bookingAPI.updateStatus(id, { status: 'cancelled', note: 'Cancelled by user' });
      toast.success('Booking cancelled successfully');
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    fetchBooking();
  };

  const statusConfig = {
    'pending': { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    'accepted': { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    'in-progress': { color: 'bg-purple-100 text-purple-700', icon: Clock },
    'completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle },
    'cancelled': { color: 'bg-gray-100 text-gray-600', icon: XCircle },
    'rejected': { color: 'bg-red-100 text-red-700', icon: XCircle }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <Link to="/my-bookings" className="btn-primary">View My Bookings</Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[booking.status]?.icon || AlertCircle;
  const canCancel = ['pending', 'accepted'].includes(booking.status);
  const canReview = booking.status === 'completed' && !booking.ratingSubmitted && user?.role === 'user';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600">Booking ID: {booking._id}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig[booking.status]?.color}`}>
            <StatusIcon className="h-5 w-5" />
            <span className="font-medium capitalize">{booking.status}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Service Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm">Service</p>
                    <p className="font-medium text-gray-900">{booking.service?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Price</p>
                    <p className="font-semibold text-primary-600">₹{booking.service?.price}</p>
                    <p className="text-xs text-gray-500 capitalize">{booking.service?.priceType}</p>
                  </div>
                </div>

                {booking.description && (
                  <div>
                    <p className="text-gray-500 text-sm">Description</p>
                    <p className="text-gray-700">{booking.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Schedule</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Time</p>
                    <p className="font-medium text-gray-900">{booking.scheduledTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {booking.address && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Service Location</h2>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{booking.address.street}</p>
                    <p className="text-gray-600">
                      {booking.address.city}, {booking.address.state} {booking.address.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status History */}
            {booking.statusHistory && booking.statusHistory.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Status History</h2>
                <div className="space-y-3">
                  {booking.statusHistory.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="capitalize text-gray-700">{item.status}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.changedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Form */}
            {canReview && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {showReviewForm ? 'Write a Review' : 'How was your experience?'}
                </h2>
                {showReviewForm ? (
                  <ReviewForm bookingId={booking._id} onSuccess={handleReviewSuccess} />
                ) : (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="btn-primary"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Info */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Service Provider</h2>
              <Link 
                to={`/provider/${booking.provider?._id}`}
                className="flex items-center gap-3 mb-4 group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold">
                    {booking.provider?.businessName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-primary-600">
                    {booking.provider?.businessName}
                  </p>
                  <p className="text-sm text-gray-500">{booking.provider?.user?.name}</p>
                </div>
              </Link>
              
              <div className="space-y-2 text-sm">
                {booking.provider?.user?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{booking.provider.user.phone}</span>
                  </div>
                )}
                {booking.provider?.user?.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{booking.provider.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <Link
                  to={`/provider/${booking.provider?._id}`}
                  className="btn-secondary w-full text-center"
                >
                  View Provider Profile
                </Link>
                
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
              </div>
            </div>

            {/* Notes */}
            {(booking.providerNote || booking.cancellationReason) && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
                {booking.providerNote && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Provider Note</p>
                    <p className="text-gray-700">{booking.providerNote}</p>
                  </div>
                )}
                {booking.cancellationReason && (
                  <div>
                    <p className="text-sm text-gray-500">Cancellation Reason</p>
                    <p className="text-gray-700">{booking.cancellationReason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
