import React from 'react';

const statusConfig = {
  ACTIVE: { label: 'Active', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  PRE_ACTIVATE: { label: 'Pre-Activate (Future Joining)', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  RECRUITMENT: { label: 'Recruitment', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  WAITING_FOR_JOINING: { label: 'Waiting for Joining', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  NOTICE_PERIOD: { label: 'Notice Period', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  AUTO_DEACTIVATED: { label: 'Deactivated', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  ARCHIVED: { label: 'Archived', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  INACTIVE: { label: 'Inactive', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  SUSPENDED: { label: 'Suspended', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
};

export const StatusChip = ({ status }) => {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    bg: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.bg}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
};

export default StatusChip;
