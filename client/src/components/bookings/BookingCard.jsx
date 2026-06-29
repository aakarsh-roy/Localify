import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';

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
    'pending': { variant: 'warning' },
    'accepted': { variant: 'secondary' },
    'in-progress': { variant: 'default' },
    'completed': { variant: 'success' },
    'cancelled': { variant: 'secondary' },
    'rejected': { variant: 'destructive' }
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
    <Card className="hover:border-neutral-950 hover:shadow-subtle transition-all group bg-white border border-neutral-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-neutral-950 tracking-tight group-hover:text-neutral-950 transition-colors">{service?.name}</h3>
            {showProvider && provider && (
              <div className="flex items-center gap-1.5 text-sm text-neutral-500 font-medium mt-1">
                <User className="h-3.5 w-3.5" />
                <span>{provider.businessName}</span>
              </div>
            )}
          </div>
          <Badge variant={config.variant} className="capitalize">
            {status}
          </Badge>
        </div>

        <div className="space-y-2.5 text-sm text-neutral-500 font-medium mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <span>{formatDate(scheduledDate)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-neutral-400" />
            <span>{scheduledTime}</span>
          </div>
          {address?.city && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-neutral-400" />
              <span>{address.city}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-5 py-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50">
        <div>
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">Total</span>
          <p className="font-extrabold text-neutral-950 text-lg">₹{service?.price}</p>
        </div>
        <div className="flex items-center gap-4">
          {status === 'completed' && !ratingSubmitted && (
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-950 font-bold bg-neutral-100 border border-neutral-200 px-2.5 py-1.5 rounded-lg shadow-sm">
              <AlertCircle className="h-3.5 w-3.5" />
              Review
            </span>
          )}
          <Link 
            to={`/booking/${_id}`}
            className="group/link inline-flex items-center gap-1 text-neutral-950 hover:text-neutral-600 text-sm font-bold transition-colors"
          >
            Details
            <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
