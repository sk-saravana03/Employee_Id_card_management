import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Building } from 'lucide-react';

export const BranchModal = ({ isOpen, onClose, onSubmit, branch = null, users = [], isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name || '',
        code: branch.code || '',
        city: branch.city || '',
        country: branch.country || 'United States',
        address: branch.address || '',
        branchAdmin: branch.branchAdmin?._id || branch.branchAdmin || '',
        status: branch.status || 'ACTIVE',
      });
    } else {
      reset({
        name: '',
        code: `BR-${Math.floor(10 + Math.random() * 90)}`,
        city: '',
        country: 'United States',
        address: '',
        branchAdmin: '',
        status: 'ACTIVE',
      });
    }
  }, [branch, isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-500" />
              {branch ? 'Edit Branch Office' : 'Provision New Branch Office'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Corporate Headquarters"
                {...register('name', { required: 'Branch name is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && <span className="text-[10px] text-rose-500">{errors.name.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={!!branch}
                placeholder="e.g. HQ-01"
                {...register('code', { required: 'Branch code is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 uppercase font-mono disabled:opacity-60"
              />
              {errors.code && <span className="text-[10px] text-rose-500">{errors.code.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City / Region
              </label>
              <input
                type="text"
                placeholder="New York"
                {...register('city')}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                placeholder="United States"
                {...register('country')}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Street Address
            </label>
            <input
              type="text"
              placeholder="100 Technology Plaza, Suite 400"
              {...register('address')}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Administrator
              </label>
              <select
                {...register('branchAdmin')}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Operational Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {isLoading ? 'Saving...' : branch ? 'Update Branch' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchModal;
