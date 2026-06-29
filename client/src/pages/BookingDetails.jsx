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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

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
    'pending': { variant: 'warning', icon: AlertCircle },
    'accepted': { variant: 'secondary', icon: CheckCircle },
    'in-progress': { variant: 'default', icon: Clock },
    'completed': { variant: 'success', icon: CheckCircle },
    'cancelled': { variant: 'secondary', icon: XCircle },
    'rejected': { variant: 'destructive', icon: XCircle }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-neutral-950 mb-4 tracking-tight">Booking Not Found</h2>
          <Button variant="primary" onClick={() => navigate('/my-bookings')}>View My Bookings</Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[booking.status]?.icon || AlertCircle;
  const canCancel = ['pending', 'accepted'].includes(booking.status);
  const canReview = booking.status === 'completed' && !booking.ratingSubmitted && user?.role === 'user';

  return (
    <div className="min-h-screen bg-neutral-50/50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Booking Details</h1>
            <p className="text-[10px] font-bold text-neutral-500 mt-2 uppercase tracking-wider">ID: {booking._id}</p>
          </div>
          <Badge variant={statusConfig[booking.status]?.variant || 'default'} size="lg" className="self-start sm:self-auto shadow-sm">
            <StatusIcon className="h-4 w-4 mr-2" />
            <span className="capitalize font-bold">{booking.status}</span>
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-neutral-100">
                <CardTitle className="tracking-tight">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Service</p>
                      <p className="text-lg font-bold text-neutral-950 tracking-tight">{booking.service?.name}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Price</p>
                      <p className="text-2xl font-extrabold text-neutral-950 tracking-tight">₹{booking.service?.price}</p>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">{booking.service?.priceType}</p>
                    </div>
                  </div>

                  {booking.description && (
                    <div className="pt-4 border-t border-neutral-100">
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Description</p>
                      <p className="text-neutral-700 font-medium leading-relaxed">{booking.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-neutral-100">
                <CardTitle className="tracking-tight">Schedule</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-neutral-950" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Date</p>
                      <p className="font-bold text-neutral-950">
                        {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-neutral-950" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Time</p>
                      <p className="font-bold text-neutral-950">{booking.scheduledTime}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            {booking.address && (
              <Card className="bg-white border border-neutral-200 shadow-sm">
                <CardHeader className="pb-4 border-b border-neutral-100">
                  <CardTitle className="tracking-tight">Service Location</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-neutral-100 border border-neutral-200 rounded-lg shrink-0">
                      <MapPin className="h-5 w-5 text-neutral-950" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-950 mb-1">{booking.address.street}</p>
                      <p className="font-medium text-neutral-600">
                        {booking.address.city}, {booking.address.state} {booking.address.zipCode}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            {booking.statusHistory && booking.statusHistory.length > 0 && (
              <Card className="bg-white border border-neutral-200 shadow-sm">
                <CardHeader className="pb-4 border-b border-neutral-100">
                  <CardTitle className="tracking-tight">Status History</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {booking.statusHistory.map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="mt-1 relative">
                          <div className="w-3 h-3 bg-neutral-950 rounded-full ring-4 ring-neutral-100"></div>
                          {index !== booking.statusHistory.length - 1 && (
                            <div className="absolute top-4 left-1.5 w-px h-8 bg-neutral-200"></div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-bold text-neutral-950 capitalize">{item.status}</span>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                            {new Date(item.changedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Form */}
            {canReview && (
              <Card className="border-neutral-950 shadow-elevated bg-white">
                <CardHeader className="pb-4 border-b border-neutral-100">
                  <CardTitle className="tracking-tight">
                    {showReviewForm ? 'Write a Review' : 'How was your experience?'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {showReviewForm ? (
                    <ReviewForm bookingId={booking._id} onSuccess={handleReviewSuccess} />
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Review
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Info */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-neutral-100">
                <CardTitle className="tracking-tight">Service Provider</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Link 
                  to={`/provider/${booking.provider?._id}`}
                  className="flex items-center gap-4 mb-6 group"
                >
                  <Avatar fallback={booking.provider?.businessName?.charAt(0)} size="lg" />
                  <div>
                    <p className="font-bold text-neutral-950 group-hover:text-neutral-600 transition-colors">
                      {booking.provider?.businessName}
                    </p>
                    <p className="text-sm font-medium text-neutral-500">{booking.provider?.user?.name}</p>
                  </div>
                </Link>
                
                <div className="space-y-4">
                  {booking.provider?.user?.phone && (
                    <div className="flex items-center gap-3 text-neutral-600 font-medium">
                      <div className="p-2 bg-neutral-100 border border-neutral-200 rounded-lg">
                        <Phone className="h-4.5 w-4.5 text-neutral-950" />
                      </div>
                      <span>{booking.provider.user.phone}</span>
                    </div>
                  )}
                  {booking.provider?.user?.email && (
                    <div className="flex items-center gap-3 text-neutral-600 font-medium">
                      <div className="p-2 bg-neutral-100 border border-neutral-200 rounded-lg">
                        <Mail className="h-4.5 w-4.5 text-neutral-950" />
                      </div>
                      <span className="break-all">{booking.provider.user.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-white border border-neutral-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-neutral-100">
                <CardTitle className="tracking-tight">Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Link
                    to={`/provider/${booking.provider?._id}`}
                    className="w-full block"
                  >
                    <Button variant="outline" className="w-full bg-white text-neutral-950 border-neutral-200 hover:border-neutral-950 hover:bg-neutral-50">
                      View Provider Profile
                    </Button>
                  </Link>
                  
                  {canCancel && (
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="w-full"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {(booking.providerNote || booking.cancellationReason) && (
              <Card className={`bg-white shadow-sm ${booking.cancellationReason ? 'border-red-200' : 'border-neutral-200'}`}>
                <CardHeader className="pb-4 border-b border-neutral-100">
                  <CardTitle className="tracking-tight">Notes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    {booking.providerNote && (
                      <div>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Provider Note</p>
                        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                          <p className="text-neutral-700 font-medium leading-relaxed">{booking.providerNote}</p>
                        </div>
                      </div>
                    )}
                    {booking.cancellationReason && (
                      <div>
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2">Cancellation Reason</p>
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                          <p className="text-red-700 font-medium leading-relaxed">{booking.cancellationReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
