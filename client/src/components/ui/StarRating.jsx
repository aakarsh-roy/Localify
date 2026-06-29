import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md', 
  showValue = true, 
  interactive = false,
  onChange = () => {},
  className = ''
}) => {
  const [hoverIndex, setHoverIndex] = useState(-1);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };

  const handleClick = (index) => {
    if (interactive) {
      onChange(index + 1);
    }
  };

  const displayRating = interactive && hoverIndex >= 0 ? hoverIndex + 1 : rating;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(maxRating)].map((_, index) => (
        <button
          key={index}
          type={interactive ? 'button' : undefined}
          onClick={() => handleClick(index)}
          onMouseEnter={() => interactive && setHoverIndex(index)}
          onMouseLeave={() => interactive && setHoverIndex(-1)}
          disabled={!interactive}
          className={`${interactive 
            ? 'cursor-pointer hover:scale-125 active:scale-95' 
            : 'cursor-default'
          } transition-all duration-150 focus:outline-none`}
        >
          <Star
            className={`${sizes[size]} transition-colors duration-150 ${
              index < Math.floor(displayRating)
                ? 'text-neutral-950 fill-neutral-950 drop-shadow-sm'
                : index < displayRating
                ? 'text-neutral-950 fill-neutral-950 opacity-50'
                : interactive && hoverIndex >= 0
                ? 'text-neutral-300'
                : 'text-neutral-200'
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-neutral-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
