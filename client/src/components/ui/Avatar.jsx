import React from 'react';

const Avatar = ({ src, alt = "Avatar", size = "md", fallback, className = "" }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    '2xl': "w-24 h-24 text-3xl"
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden bg-neutral-100 border border-neutral-200 rounded-full shrink-0 ${currentSize} ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextSibling) {
              e.target.nextSibling.style.display = 'flex';
            }
          }}
        />
      ) : null}
      
      {/* Fallback */}
      <span 
        className={`font-medium text-neutral-600 ${src ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
      >
        {fallback || (alt ? alt.charAt(0).toUpperCase() : '?')}
      </span>
    </div>
  );
};

export default Avatar;
