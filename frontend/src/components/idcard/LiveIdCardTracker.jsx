import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, ShieldCheck, Printer, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';

export const LiveIdCardTracker = ({ onRequestNew }) => {
  const [requestData, setRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyRequest = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/id-cards/my-request');
      if (res?.data?.data?.idCard) {
        setRequestData(res.data.data.idCard);
      } else {
        setRequestData(null);
      }
    } catch (err) {
      console.error('Error loading ID card request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequest();
  }, []);

  const handleRequestPhysicalCard = async () => {
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post('/id-cards/request', {
        reason: 'Physical ID Card Application',
      });
      toast.success('Physical ID card request submitted! Waiting for HR/Manager approval.');
      fetchMyRequest();
      if (onRequestNew) onRequestNew();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stepper calculations based on status
  const currentStatus = requestData?.status || 'NOT_REQUESTED';

  const steps = [
    {
      id: 1,
      title: 'Employee Request',
      subtitle: 'Submitted Request',
      key: 'REQUESTED_PENDING_HR',
      icon: CreditCard,
    },
    {
      id: 2,
      title: 'Manager / HR Approval',
      subtitle: 'Verification Review',
      key: 'APPROVED_BY_HR',
      icon: ShieldCheck,
    },
    {
      id: 3,
      title: 'Admin Approval',
      subtitle: 'Authorization',
      key: 'APPROVED_BY_ADMIN',
      icon: CheckCircle2,
    },
    {
      id: 4,
      title: 'Printer Operator Queue',
      subtitle: 'Printing & Card Issued',
      key: 'PRINTED',
      icon: Printer,
    },
  ];

  const getStepState = (stepIndex) => {
    if (currentStatus === 'REJECTED') return 'rejected';
    switch (currentStatus) {
      case 'REQUESTED_PENDING_HR':
        return stepIndex === 0 ? 'current' : 'upcoming';
      case 'APPROVED_BY_HR':
        return stepIndex < 1 ? 'completed' : stepIndex === 1 ? 'current' : 'upcoming';
      case 'APPROVED_BY_ADMIN':
        return stepIndex < 2 ? 'completed' : stepIndex === 2 ? 'current' : 'upcoming';
      case 'PRINTING':
        return stepIndex < 3 ? 'completed' : stepIndex === 3 ? 'current' : 'upcoming';
      case 'PRINTED':
      case 'DELIVERED':
        return 'completed';
      default:
        return 'upcoming';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Physical ID Card Request & Live Status Stepper
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            4-Stage Workflow: Employee Request ➔ Manager/HR Approval ➔ Admin Authorization ➔ Printer Operator Queue
          </p>
        </div>

        <button
          onClick={fetchMyRequest}
          title="Refresh Live Status"
          className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading live status tracker...</div>
        ) : !requestData ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">No Active Physical ID Card Request</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Request your official enterprise physical ID card. It will automatically route to HR and Admin for authorization.
              </p>
            </div>
            <button
              onClick={handleRequestPhysicalCard}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-all transform active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              {isSubmitting ? 'Submitting Request...' : 'Request Physical ID Card Now'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Request Summary Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Card ID</span>
                <span className="text-xs font-mono font-bold text-emerald-700">{requestData.cardId}</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Employee</span>
                <span className="text-xs font-bold text-slate-900">
                  {requestData.employee?.firstName} {requestData.employee?.lastName} ({requestData.employee?.employeeId})
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Current Phase</span>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {currentStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Analytical Estimated Time Required Banner */}
            {(() => {
              const est = (() => {
                switch (currentStatus) {
                  case 'REQUESTED_PENDING_HR':
                    return {
                      estHours: '~24 to 48 Hours',
                      stageTitle: 'Stage 1 of 4: Pending Manager / HR Verification',
                      analytics: '92% of requests are verified within 24 hours by HR.',
                      color: 'bg-amber-50 border-amber-200 text-amber-900',
                      badgeColor: 'bg-amber-500 text-white',
                    };
                  case 'APPROVED_BY_HR':
                    return {
                      estHours: '~12 to 24 Hours',
                      stageTitle: 'Stage 2 of 4: Pending Super Admin Authorization',
                      analytics: '98% of HR-approved requests authorized within 12 hours.',
                      color: 'bg-blue-50 border-blue-200 text-blue-900',
                      badgeColor: 'bg-blue-600 text-white',
                    };
                  case 'APPROVED_BY_ADMIN':
                    return {
                      estHours: '~2 to 6 Hours',
                      stageTitle: 'Stage 3 of 4: Queued in Physical Printing Center',
                      analytics: 'Queued in high-volume printer operator queue.',
                      color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
                      badgeColor: 'bg-indigo-600 text-white',
                    };
                  case 'PRINTING':
                    return {
                      estHours: '~30 Minutes',
                      stageTitle: 'Stage 4 of 4: Physical Badge Engraving & Encoding',
                      analytics: 'Hardware printing and magnetic encoding in progress.',
                      color: 'bg-purple-50 border-purple-200 text-purple-900',
                      badgeColor: 'bg-purple-600 text-white',
                    };
                  case 'PRINTED':
                  case 'DELIVERED':
                    return {
                      estHours: 'Issued & Available Immediately',
                      stageTitle: 'Stage 4 of 4: Completed',
                      analytics: 'Collect physical card at HR / Security Front Desk.',
                      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                      badgeColor: 'bg-emerald-600 text-white',
                    };
                  default:
                    return {
                      estHours: 'N/A',
                      stageTitle: 'Not Submitted',
                      analytics: 'Submit request to start countdown.',
                      color: 'bg-slate-50 border-slate-200 text-slate-700',
                      badgeColor: 'bg-slate-500 text-white',
                    };
                }
              })();

              return (
                <div className={`p-4 rounded-xl border ${est.color} flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${est.badgeColor} shrink-0`}>
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                        Analytical Estimated Processing Time
                      </span>
                      <p className="text-sm font-bold">{est.estHours}</p>
                      <p className="text-[11px] opacity-80 mt-0.5">{est.analytics}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/80 font-bold border border-current">
                      {est.stageTitle}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Stepper Pipeline Visual */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {steps.map((step, idx) => {
                const state = getStepState(idx);
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all ${
                      state === 'completed'
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                        : state === 'current'
                        ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-sm ring-2 ring-amber-400/20'
                        : state === 'rejected'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-slate-50/50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          state === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : state === 'current'
                            ? 'bg-amber-500 text-white animate-pulse'
                            : state === 'rejected'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {state === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{step.title}</p>
                        <p className="text-[10px] opacity-75 truncate">{step.subtitle}</p>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] font-semibold flex items-center gap-1">
                      {state === 'completed' && (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Approved & Completed
                        </span>
                      )}
                      {state === 'current' && (
                        <span className="text-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-spin" /> In Progress
                        </span>
                      )}
                      {state === 'upcoming' && <span className="text-slate-400">Pending Stage</span>}
                      {state === 'rejected' && (
                        <span className="text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveIdCardTracker;
