import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, User, Mail, Phone, Building, Layers, Calendar, Clock } from 'lucide-react';

export const EmployeeModal = ({ isOpen, onClose, onSubmit, employee = null, branches = [], departments = [], isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const avatarUrlWatch = watch('avatarUrl');

  useEffect(() => {
    if (employee) {
      reset({
        employeeId: employee.employeeId || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        avatarUrl: employee.avatarUrl || '',
        designation: employee.designation || '',
        branch: employee.branch?._id || employee.branch || '',
        department: employee.department?._id || employee.department || '',
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
        noticePeriodDays: employee.noticePeriodDays || 30,
        terminationDate: employee.terminationDate ? new Date(employee.terminationDate).toISOString().split('T')[0] : '',
      });
    } else {
      reset({
        employeeId: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        avatarUrl: '',
        designation: '',
        branch: branches[0]?._id || '',
        department: departments[0]?._id || '',
        joiningDate: new Date().toISOString().split('T')[0],
        noticePeriodDays: 30,
        terminationDate: '',
      });
    }
  }, [employee, isOpen, reset, branches, departments]);

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {employee ? 'Edit Employee Details' : 'Create New Employee Record'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {employee ? `Updating record for ${employee.employeeId}` : 'Add a new member to the corporate directory.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
          {/* Avatar & Basic Identity Section */}
          <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="relative group w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
              {avatarUrlWatch ? (
                <img src={avatarUrlWatch} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  {...register('avatarUrl')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Employee ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!!employee}
                    {...register('employeeId', { required: 'Employee ID is required' })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 uppercase font-mono disabled:opacity-60"
                  />
                  {errors.employeeId && <span className="text-[10px] text-rose-500">{errors.employeeId.message}</span>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    {...register('designation', { required: 'Designation is required' })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.designation && <span className="text-[10px] text-rose-500">{errors.designation.message}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Name & Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Corporate Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="name@enterprise.com"
                {...register('email', { required: 'Corporate Email is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
              {errors.email && <span className="text-[10px] text-rose-500">{errors.email.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...register('phone')}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Branch & Department Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Location <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('branch', { required: 'Branch is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              {errors.branch && <span className="text-[10px] text-rose-500">{errors.branch.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('department', { required: 'Department is required' })}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
              {errors.department && <span className="text-[10px] text-rose-500">{errors.department.message}</span>}
            </div>
          </div>

          {/* Lifecycle & Dates Section */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" /> Lifecycle & Contract Dates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Joining Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('joiningDate', { required: 'Joining date is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
                {errors.joiningDate && <span className="text-[10px] text-rose-500">{errors.joiningDate.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Period (Days)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  {...register('noticePeriodDays')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Termination Date (Optional)
                </label>
                <input
                  type="date"
                  {...register('terminationDate')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {isLoading ? 'Saving Record...' : employee ? 'Update Employee' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
