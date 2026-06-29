import React from 'react';
import StarRating from '../ui/StarRating';
import { MessageSquare } from 'lucide-react';
import Avatar from '../ui/Avatar';

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
    <div className="border-b border-neutral-100 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar 
            src={user?.avatar} 
            alt={user?.name || 'Anonymous'} 
            fallback={user?.name?.charAt(0) || 'A'}
            size="md"
          />
          <div>
            <p className="font-semibold text-neutral-900">{user?.name || 'Anonymous'}</p>
            <p className="text-sm text-neutral-500">{formatDate(createdAt)}</p>
          </div>
        </div>
        <StarRating rating={stars} size="sm" showValue={false} />
      </div>
      
      <p className="text-neutral-600 mb-4 leading-relaxed">{comment}</p>

      {providerResponse && (
        <div className="ml-8 pl-4 border-l-2 border-primary-200 bg-primary-50/50 rounded-r-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <MessageSquare className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Provider Response</span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">{providerResponse.comment}</p>
          {providerResponse.respondedAt && (
            <p className="text-xs text-neutral-400 mt-2 font-medium">
              {formatDate(providerResponse.respondedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
