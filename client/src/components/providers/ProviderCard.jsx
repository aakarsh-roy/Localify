import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, CheckCircle, Star, ArrowRight } from 'lucide-react';
import StarRating from '../ui/StarRating';

const ProviderCard = ({ provider }) => {
  const { 
    _id, 
    businessName, 
    description, 
    services, 
    location, 
    experience, 
    averageRating, 
    totalReviews,
    availability,
    verificationStatus,
    user,
    distance
  } = provider;

  return (
    <div className="card-interactive overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">
                {businessName?.charAt(0) || 'P'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-gray-900">{businessName}</h3>
                {verificationStatus === 'verified' && (
                  <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-50" />
                )}
              </div>
              <p className="text-sm text-gray-500">{user?.name}</p>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
            availability?.isAvailable 
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60' 
              : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200/60'
          }`}>
            {availability?.isAvailable ? 'Available' : 'Unavailable'}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={averageRating || 0} size="sm" showValue={false} />
          <span className="font-semibold text-gray-900 text-sm">{(averageRating || 0).toFixed(1)}</span>
          <span className="text-gray-400 text-sm">({totalReviews || 0})</span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Services */}
        {services && services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {services.slice(0, 3).map((service, index) => (
              <span 
                key={index}
                className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg font-medium"
              >
                {service.name}
              </span>
            ))}
            {services.length > 3 && (
              <span className="px-2.5 py-1 text-gray-400 text-xs font-medium">
                +{services.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location?.city || 'Location not set'}</span>
            {distance && <span className="text-primary-600 font-medium">• {(distance / 1000).toFixed(1)} km</span>}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{experience} yrs exp</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {services && services.length > 0 && (
            <div>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Starting at</span>
              <p className="font-bold text-primary-600 text-lg">
                ₹{Math.min(...services.map(s => s.price))}
              </p>
            </div>
          )}
          <Link 
            to={`/provider/${_id}`}
            className="group inline-flex items-center gap-1.5 btn-primary text-sm !py-2 !px-4"
          >
            View Profile
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
