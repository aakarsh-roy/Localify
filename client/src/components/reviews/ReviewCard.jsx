import React from 'react';
import StarRating from '../ui/StarRating';
import { User, MessageSquare } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const { user, stars, comment, createdAt, providerResponse } = review;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <span className="text-primary-700 font-semibold text-sm">{user?.name?.charAt(0) || 'A'}</span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name || 'Anonymous'}</p>
            <p className="text-sm text-gray-500">{formatDate(createdAt)}</p>
          </div>
        </div>
        <StarRating rating={stars} size="sm" showValue={false} />
      </div>
      
      <p className="text-gray-600 mb-3">{comment}</p>

      {providerResponse && (
        <div className="ml-6 pl-4 border-l-2 border-primary-200 bg-primary-50/60 rounded-r-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Provider Response</span>
          </div>
          <p className="text-sm text-gray-600">{providerResponse.comment}</p>
          {providerResponse.respondedAt && (
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(providerResponse.respondedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
