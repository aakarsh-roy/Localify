import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  disabled,
  fullWidth,
  icon: Icon,
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-neutral-950 text-white hover:bg-neutral-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-neutral-950 rounded-xl',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-transparent rounded-xl',
    outline: 'bg-white border border-neutral-200 text-neutral-900 hover:bg-neutral-50 shadow-subtle rounded-xl',
    ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-xl',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-subtle border border-red-600 rounded-xl',
    glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-neutral-900 hover:bg-white/30 rounded-xl'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
    icon: 'p-2'
  };

  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
