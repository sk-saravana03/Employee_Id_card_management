import React from 'react';

export const Badge = ({ children, variant = 'info', className = '' }) => {
  const variantStyles = {
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    neutral: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {children}
    </span>
  );
};
