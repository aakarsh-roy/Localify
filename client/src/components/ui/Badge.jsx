import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-neutral-900 text-white',
    secondary: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    outline: 'border border-neutral-200 text-neutral-600',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-tight ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
