import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, CheckCircle, Star } from 'lucide-react';
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
    <div className="card hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-lg">
                {businessName?.charAt(0) || 'P'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{businessName}</h3>
                {verificationStatus === 'verified' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-500">{user?.name}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            availability?.isAvailable 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {availability?.isAvailable ? 'Available' : 'Unavailable'}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={averageRating || 0} size="sm" showValue={false} />
          <span className="font-medium text-gray-900">{(averageRating || 0).toFixed(1)}</span>
          <span className="text-gray-500 text-sm">({totalReviews || 0} reviews)</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {/* Services */}
        {services && services.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {services.slice(0, 3).map((service, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {service.name}
              </span>
            ))}
            {services.length > 3 && (
              <span className="px-2 py-1 text-gray-500 text-xs">
                +{services.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location?.city || 'Location not set'}</span>
            {distance && <span className="text-primary-600">• {(distance / 1000).toFixed(1)} km</span>}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{experience} yrs exp</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t">
          {services && services.length > 0 && (
            <div>
              <span className="text-gray-500 text-sm">Starting at</span>
              <p className="font-semibold text-primary-600">
                ₹{Math.min(...services.map(s => s.price))}
              </p>
            </div>
          )}
          <Link 
            to={`/provider/${_id}`}
            className="btn-primary text-sm"
          >
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
