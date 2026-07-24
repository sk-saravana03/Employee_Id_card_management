import React from 'react';
import { useForm } from 'react-hook-form';
import { X, UserCheck, Calendar, Phone, Mail, Building, Shield } from 'lucide-react';
import PhotoCaptureInput from '../common/PhotoCaptureInput';

export const VisitorModal = ({ isOpen, onClose, onSubmit, employees = [], isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const photoUrl = watch('photoUrl');

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" /> Visitor Pass Registration
            </h3>
            <p className="text-xs text-slate-500">
              Register visitor pass details for host approval & security gate entry.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Visitor Photo Selector (File Upload or Camera Capture) */}
          <PhotoCaptureInput
            value={photoUrl}
            onChange={(url) => setValue('photoUrl', url)}
            label="Visitor Photo (Upload File or Live Security Snapshot)"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Visitor Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. John Smith"
                {...register('fullName', { required: 'Visitor name is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
              {errors.fullName && <span className="text-[10px] text-rose-500">{errors.fullName.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organization / Company
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                {...register('company')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
              {errors.email && <span className="text-[10px] text-rose-500">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-1111"
                {...register('phone', { required: 'Phone is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
              {errors.phone && <span className="text-[10px] text-rose-500">{errors.phone.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee Host to Visit <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('employeeToVisit', { required: 'Host employee is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Employee Host</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.designation})
                  </option>
                ))}
              </select>
              {errors.employeeToVisit && <span className="text-[10px] text-rose-500">{errors.employeeToVisit.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Visit Purpose <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('purpose', { required: 'Purpose is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="MEETING">Business Meeting</option>
                <option value="INTERVIEW">Job Interview</option>
                <option value="VENDOR">Vendor / Supplier</option>
                <option value="DELIVERY">Delivery</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Government ID Type
              </label>
              <select
                {...register('govtIdType')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Driver License">Driver License</option>
                <option value="Passport">Passport</option>
                <option value="National ID">National ID / SSN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Government ID Number
              </label>
              <input
                type="text"
                placeholder="Encrypted upon saving"
                {...register('govtIdNumber')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Entry Date & Time
              </label>
              <input
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                {...register('expectedEntryTime')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pass Validity (Hours) <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('validityHours', { required: true })}
                defaultValue="12"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="1">1 hour (Short visit)</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours (Half day)</option>
                <option value="8">8 hours (Full day)</option>
                <option value="12">12 hours (Default)</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours (2 days)</option>
                <option value="72">72 hours (3 days max)</option>
              </select>
              <p className="text-[9px] text-slate-400 mt-0.5">MongoDB TTL auto-deletes record 24h after expiry.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {isLoading ? 'Submitting Registration...' : 'Register Visitor Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitorModal;
