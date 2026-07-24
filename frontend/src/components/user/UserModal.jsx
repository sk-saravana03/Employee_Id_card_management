import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, ShieldCheck, UserCheck } from 'lucide-react';

export const UserModal = ({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  roles = [],
  branches = [],
  departments = [],
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        employeeId: user.employeeId || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role?._id || user.role || '',
        branch: user.branch?._id || user.branch || '',
        department: user.department?._id || user.department || '',
        status: user.status || 'ACTIVE',
      });
    } else {
      reset({
        employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: roles[0]?._id || '',
        branch: branches[0]?._id || '',
        department: departments[0]?._id || '',
        status: 'ACTIVE',
      });
    }
  }, [user, isOpen, reset, roles, branches, departments]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              {user ? 'Edit System Account' : 'Create New System Account'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage system permissions, roles, and branch access.
            </p>
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
                Employee ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={!!user}
                {...register('employeeId', { required: 'Employee ID is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 uppercase font-mono disabled:opacity-60"
              />
              {errors.employeeId && <span className="text-[10px] text-rose-500">{errors.employeeId.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role Permission <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-600 dark:text-indigo-400"
              >
                <option value="">Select System Role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.role && <span className="text-[10px] text-rose-500">{errors.role.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('firstName', { required: 'First Name is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
              {errors.firstName && <span className="text-[10px] text-rose-500">{errors.firstName.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('lastName', { required: 'Last Name is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
              {errors.lastName && <span className="text-[10px] text-rose-500">{errors.lastName.message}</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Corporate Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              disabled={!!user}
              placeholder="user@enterprise.com"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
            {errors.email && <span className="text-[10px] text-rose-500">{errors.email.message}</span>}
          </div>

          {!user && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 chars' } })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
              {errors.password && <span className="text-[10px] text-rose-500">{errors.password.message}</span>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Branch
              </label>
              <select
                {...register('branch')}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Global / All Branches</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
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
              {isLoading ? 'Saving Account...' : user ? 'Update Account' : 'Create User Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
