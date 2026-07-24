import React from 'react';
import { X, Clock, CheckCircle2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import StatusChip from '../common/StatusChip';

const lifecycleSteps = [
  { key: 'RECRUITMENT', title: 'Recruitment', desc: 'Sourcing & Offer Phase' },
  { key: 'WAITING_FOR_JOINING', title: 'Waiting for Joining', desc: 'Pre-onboarding' },
  { key: 'ACTIVE', title: 'Active', desc: 'Currently Employed' },
  { key: 'NOTICE_PERIOD', title: 'Notice Period', desc: 'Resignation / Offboarding' },
  { key: 'AUTO_DEACTIVATED', title: 'Deactivated', desc: 'Separated / Terminated' },
  { key: 'ARCHIVED', title: 'Archived', desc: 'Record Stored in Archives' },
];

export const LifecycleTimeline = ({ employee, isOpen, onClose }) => {
  if (!isOpen || !employee) return null;

  const currentStatusIndex = lifecycleSteps.findIndex((s) => s.key === employee.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Employee Lifecycle Tracker
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {employee.firstName} {employee.lastName} ({employee.employeeId})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          {/* Current Status Banner */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Current Lifecycle State
                </p>
                <div className="mt-1">
                  <StatusChip status={employee.status} />
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
              <p>Joining: {new Date(employee.joiningDate).toLocaleDateString()}</p>
              {employee.terminationDate && (
                <p className="text-rose-500 font-medium mt-0.5">
                  Termination: {new Date(employee.terminationDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Visual Sequence Progression Bar */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Lifecycle Progression Workflow
            </h4>
            <div className="grid grid-cols-6 gap-2">
              {lifecycleSteps.map((step, idx) => {
                const isPassed = idx < currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-500/20 shadow-md'
                          : isPassed
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-[10px] leading-tight font-medium ${
                        isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit History Log List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              State Transition Audit Log
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {employee.lifecycleHistory && employee.lifecycleHistory.length > 0 ? (
                employee.lifecycleHistory.map((item, index) => (
                  <div key={index} className="p-3.5 flex items-start justify-between text-xs">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusChip status={item.status} />
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {item.reason}
                          </span>
                        </div>
                        {item.updatedBy && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            Triggered by: {item.updatedBy.firstName} {item.updatedBy.lastName} ({item.updatedBy.email})
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No explicit state transition logs recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LifecycleTimeline;
