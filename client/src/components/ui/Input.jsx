import React from 'react';

export const Input = React.forwardRef(({ className = '', error, label, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3.5 py-2 rounded-xl border transition-all duration-200 outline-none shadow-sm
          placeholder:text-neutral-400
          ${error 
            ? 'bg-red-50/30 border-red-300 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'}
          disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export const Select = React.forwardRef(({ className = '', error, label, children, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full px-3.5 py-2 rounded-xl border transition-all duration-200 outline-none shadow-sm
          appearance-none
          ${error 
            ? 'bg-red-50/30 border-red-300 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'}
          disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
