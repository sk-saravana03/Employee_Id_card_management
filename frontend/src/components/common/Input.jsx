import React, { forwardRef } from 'react';

export const Input = forwardRef(
  ({ label, error, helperText, icon: Icon, className = '', type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`w-full text-sm bg-white dark:bg-slate-900 border rounded-sm py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-colors ${
              Icon ? 'pl-9' : 'px-3'
            } ${
              error
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
