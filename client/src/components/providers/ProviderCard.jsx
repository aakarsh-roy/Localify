import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, CheckCircle, Star, ArrowRight } from 'lucide-react';
import StarRating from '../ui/StarRating';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const ProviderCard = ({ provider }) => {
  const navigate = useNavigate();
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
    distance,
    avatarUrl
  } = provider;

  return (
    <Card interactive onClick={() => navigate(`/provider/${_id}`)}>
      <CardContent className="p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={avatarUrl} 
              alt={businessName} 
              fallback={businessName?.charAt(0) || 'P'}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-neutral-950 tracking-tight line-clamp-1">{businessName}</h3>
                {verificationStatus === 'verified' && (
                  <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-50 shrink-0" />
                )}
              </div>
              <p className="text-sm text-neutral-500 font-medium line-clamp-1">{user?.name}</p>
            </div>
          </div>
          <Badge 
            variant={availability?.isAvailable ? 'success' : 'secondary'}
            className="shrink-0"
          >
            {availability?.isAvailable ? 'Available' : 'Unavailable'}
          </Badge>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={averageRating || 0} size="sm" showValue={false} />
          <span className="font-bold text-neutral-950 text-sm">{(averageRating || 0).toFixed(1)}</span>
          <span className="text-neutral-500 text-sm">({totalReviews || 0})</span>
        </div>

        {/* Description */}
        <p className="text-neutral-500 text-sm mb-5 line-clamp-2 leading-relaxed flex-grow">
          {description}
        </p>

        {/* Services */}
        {services && services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {services.slice(0, 3).map((service, index) => (
               <span 
                key={index}
                className="px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs rounded-lg font-medium"
              >
                {service.name}
              </span>
            ))}
            {services.length > 3 && (
              <span className="px-2.5 py-1 text-neutral-500 text-xs font-medium">
                +{services.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-neutral-500 font-medium mb-4 pt-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-[120px]">{location?.city || 'Location not set'}</span>
            {distance && <span className="text-neutral-900 font-semibold whitespace-nowrap">• {(distance / 1000).toFixed(1)} km</span>}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="h-4 w-4" />
            <span>{experience} yrs exp</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-auto">
          {services && services.length > 0 ? (
            <div>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-0.5">Starting at</span>
              <p className="font-extrabold text-neutral-950 text-lg">
                ₹{Math.min(...services.map(s => s.price))}
              </p>
            </div>
          ) : (
            <div />
          )}
          <Button 
            variant="primary" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/provider/${_id}`);
            }}
            className="group shrink-0"
          >
            View Profile
            <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderCard;
