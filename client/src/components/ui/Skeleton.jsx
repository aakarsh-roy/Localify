import React from 'react';

const Skeleton = ({ className = '', variant = 'rectangular', ...props }) => {
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md',
  };

  return (
    <div 
      className={`animate-pulse bg-neutral-100 ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
