import React from 'react';

export const Card = ({ children, className = '', interactive = false, ...props }) => {
  return (
    <div 
      className={`
        bg-white rounded-2xl border border-neutral-200 overflow-hidden
        ${interactive ? 'hover:shadow-card hover:-translate-y-[2px] cursor-pointer transition-all duration-300 ease-out shadow-subtle' : 'shadow-subtle'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-neutral-100 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-neutral-950 tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 bg-neutral-50/50 border-t border-neutral-100 ${className}`}>
    {children}
  </div>
);
