import React from 'react';
import { Spinner } from './Spinner';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const variantStyles = {
    primary:
      'bg-blue-700 hover:bg-blue-800 text-white border-transparent focus:ring-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary:
      'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 focus:ring-slate-500',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-700 border-slate-300 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 focus:ring-slate-500',
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white border-transparent focus:ring-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};
