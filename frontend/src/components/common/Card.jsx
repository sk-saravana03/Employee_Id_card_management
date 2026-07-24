import React from 'react';

export const Card = ({ children, title, subtitle, action, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-enterprise overflow-hidden ${className}`}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
