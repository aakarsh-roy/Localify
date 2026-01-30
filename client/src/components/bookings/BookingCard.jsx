import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';

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

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-700',
    'accepted': 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-purple-100 text-purple-700',
    'completed': 'bg-green-100 text-green-700',
    'cancelled': 'bg-gray-100 text-gray-600',
    'rejected': 'bg-red-100 text-red-700'
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{service?.name}</h3>
            {showProvider && provider && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <User className="h-4 w-4" />
                <span>{provider.businessName}</span>
              </div>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[status]}`}>
            {status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formatDate(scheduledDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{scheduledTime}</span>
          </div>
          {address?.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{address.city}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            <span className="text-gray-500 text-sm">Total</span>
            <p className="font-semibold text-primary-600">${service?.price}</p>
          </div>
          <div className="flex items-center gap-2">
            {status === 'completed' && !ratingSubmitted && (
              <span className="text-xs text-orange-600 font-medium">
                Leave a review
              </span>
            )}
            <Link 
              to={`/booking/${_id}`}
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Details
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
