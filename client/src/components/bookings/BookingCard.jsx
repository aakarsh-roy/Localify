import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, ArrowRight, AlertCircle } from 'lucide-react';

const BookingCard = ({ booking, showProvider = true }) => {
  const { 
    _id, 
    service, 
    scheduledDate, 
    scheduledTime, 
    status, 
    provider,
    address,
    ratingSubmitted
  } = booking;

  const statusConfig = {
    'pending': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200/60', dot: 'bg-amber-500' },
    'accepted': { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200/60', dot: 'bg-blue-500' },
    'in-progress': { bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-200/60', dot: 'bg-violet-500' },
    'completed': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200/60', dot: 'bg-emerald-500' },
    'cancelled': { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-200/60', dot: 'bg-gray-400' },
    'rejected': { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200/60', dot: 'bg-red-500' }
  };

  const config = statusConfig[status] || statusConfig['pending'];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card-interactive overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{service?.name}</h3>
            {showProvider && provider && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                <User className="h-3.5 w-3.5" />
                <span>{provider.businessName}</span>
              </div>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ring-1 ${config.bg} ${config.text} ${config.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formatDate(scheduledDate)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{scheduledTime}</span>
          </div>
          {address?.city && (
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{address.city}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total</span>
            <p className="font-bold text-primary-600 text-lg">₹{service?.price}</p>
          </div>
          <div className="flex items-center gap-3">
            {status === 'completed' && !ratingSubmitted && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-lg">
                <AlertCircle className="h-3 w-3" />
                Review
              </span>
            )}
            <Link 
              to={`/booking/${_id}`}
              className="group inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-semibold"
            >
              Details
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
