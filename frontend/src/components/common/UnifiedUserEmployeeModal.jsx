import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, UserPlus, Shield, Building, Layers, Lock, Phone, Mail, Calendar, Camera, ChevronDown } from 'lucide-react';
import PhotoCaptureInput from './PhotoCaptureInput';

/**
 * Maps department names (case-insensitive substring match) to the system roles
 * that make sense for that department. Falls back to ALL roles if no match.
 *
 * Keys are lowercase department-name substrings.
 * Values are arrays of role names that should appear for that department.
 */
const DEPARTMENT_ROLE_MAP = {
  // Security / Guard department → Security Officer role
  security: ['Security Officer', 'Super Admin'],
  guard:    ['Security Officer'],
  safety:   ['Security Officer'],

  // IT / Engineering / Tech → Printer Operator (for print staff) or Employee
  it:          ['Employee', 'Printer Operator', 'HR/Admin', 'Super Admin'],
  technology:  ['Employee', 'Printer Operator', 'Super Admin'],
  engineering: ['Employee', 'Super Admin'],
  software:    ['Employee', 'Super Admin'],
  devops:      ['Employee', 'Super Admin'],

  // HR / People / Talent → HR/Admin
  'human resources': ['HR/Admin', 'Super Admin'],
  hr:        ['HR/Admin', 'Super Admin'],
  talent:    ['HR/Admin', 'Super Admin'],
  people:    ['HR/Admin', 'Super Admin'],
  training:  ['HR/Admin', 'Employee'],

  // Print / Operations
  print:      ['Printer Operator', 'HR/Admin', 'Super Admin'],
  operations: ['Printer Operator', 'Employee', 'Super Admin'],
  logistics:  ['Employee', 'Super Admin'],
  warehouse:  ['Employee', 'Printer Operator'],

  // Finance / Accounting
  finance:    ['Employee', 'HR/Admin', 'Super Admin'],
  accounting: ['Employee', 'HR/Admin'],

  // Sales / Marketing / Business
  sales:      ['Employee', 'Super Admin'],
  marketing:  ['Employee', 'HR/Admin'],
  business:   ['Employee', 'HR/Admin', 'Super Admin'],

  // Admin / Management
  admin:      ['HR/Admin', 'Super Admin'],
  management: ['HR/Admin', 'Super Admin'],
  executive:  ['Super Admin'],
  leadership: ['Super Admin', 'HR/Admin'],

  // Default fallback key — used when no match
  default:    null, // null = show all roles
};

export const UnifiedUserEmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  roles = [],
  branches = [],
  departments = [],
  isLoading = false,
}) => {
  // Track which department name is selected for role filtering
  const [selectedDeptName, setSelectedDeptName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      enableLogin: true,
      noticePeriodDays: 30,
      joiningDate: new Date().toISOString().split('T')[0],
    },
  });

  const enableLogin = watch('enableLogin');
  const avatarUrl = watch('avatarUrl');
  const watchedDept = watch('department');

  // Derive the selected department name whenever the department field changes
  useEffect(() => {
    if (watchedDept) {
      const deptObj = departments.find((d) => d._id === watchedDept || d._id === watchedDept?._id);
      setSelectedDeptName(deptObj?.name?.toLowerCase() || '');
    } else {
      setSelectedDeptName('');
    }
  }, [watchedDept, departments]);

  // Filtered roles based on selected department name
  const filteredRoles = useMemo(() => {
    if (!selectedDeptName) return roles; // no dept selected → show all
    // Try each key in DEPARTMENT_ROLE_MAP as a substring match
    for (const [key, allowedNames] of Object.entries(DEPARTMENT_ROLE_MAP)) {
      if (key === 'default') continue;
      if (selectedDeptName.includes(key)) {
        if (!allowedNames) return roles; // explicit null = all roles
        return roles.filter((r) => allowedNames.includes(r.name));
      }
    }
    return roles; // no match → show all
  }, [selectedDeptName, roles]);

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        avatarUrl: initialData.avatarUrl || '',
        employeeId: initialData.employeeId || '',
        designation: initialData.designation || '',
        branch: initialData.branch?._id || initialData.branch || '',
        department: initialData.department?._id || initialData.department || '',
        joiningDate: initialData.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        noticePeriodDays: initialData.noticePeriodDays || 30,
        role: initialData.role?._id || initialData.role || '',
        status: initialData.status || 'ACTIVE',
        enableLogin: true,
      });
    } else {
      reset({
        enableLogin: true,
        noticePeriodDays: 30,
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        avatarUrl: '',
      });
    }
  }, [initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              {initialData ? 'Edit Unified Member Record' : 'Add New Member & System Account'}
            </h3>
            <p className="text-xs text-slate-500">
              Unified creation form: Automatically provisions both Employee Record & System User Credentials.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Section 1: Personal Profile */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
              1. Personal Profile & Photo
            </h4>

            {/* Photo Capture & Upload Selector */}
            <PhotoCaptureInput
              value={avatarUrl}
              onChange={(url) => setValue('avatarUrl', url)}
              label="Member Profile Photo (Upload File or Live Camera Snapshot)"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  {...register('firstName', { required: 'First name is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
                {errors.firstName && <span className="text-[10px] text-rose-500">{errors.firstName.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jenkins"
                  {...register('lastName', { required: 'Last name is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
                {errors.lastName && <span className="text-[10px] text-rose-500">{errors.lastName.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="sarah.jenkins@enterprise.com"
                  {...register('email', { required: 'Corporate email is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
                {errors.email && <span className="text-[10px] text-rose-500">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  {...register('phone')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Employment Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
              2. Employment & Organization Structure
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employee ID Number
                </label>
                <div className="w-full px-3 py-2 text-xs font-mono font-bold border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-700 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {initialData?.employeeId
                    ? initialData.employeeId
                    : 'Auto-generated on save (e.g. EMP260000001)'}
                </div>
              </div>


              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Security Specialist"
                  {...register('designation', { required: 'Designation is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
                {errors.designation && <span className="text-[10px] text-rose-500">{errors.designation.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('branch', { required: 'Branch is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('department', { required: 'Department is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Joining Date
                </label>
                <input
                  type="date"
                  {...register('joiningDate')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Period (Days)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  {...register('noticePeriodDays')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: System Login Credentials & System Role */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">System Access & Login Account</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-700">
                <input
                  type="checkbox"
                  {...register('enableLogin')}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                Provision Portal Account
              </label>
            </div>

            {enableLogin && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Authorization Role <span className="text-rose-500">*</span>
                  </label>

                  {/* Department context hint */}
                  {selectedDeptName && filteredRoles.length < roles.length && (
                    <p className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-2 py-1 mb-1.5 flex items-center gap-1">
                      <ChevronDown className="w-3 h-3" />
                      Showing roles for <strong className="capitalize">{selectedDeptName}</strong> dept
                    </p>
                  )}

                  <select
                    {...register('role', { required: enableLogin ? 'Role is required' : false })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="">Select System Role</option>
                    {filteredRoles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  {errors.role && <span className="text-[10px] text-rose-500">{errors.role.message}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {initialData ? 'New Password (Optional)' : 'Account Password *'}
                  </label>
                  <input
                    type="password"
                    placeholder={initialData ? 'Leave blank to keep unchanged' : 'Min 8 chars (e.g. Pass@123)'}
                    {...register('password', {
                      required: !initialData && enableLogin ? 'Password is required' : false,
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.password && <span className="text-[10px] text-rose-500">{errors.password.message}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
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
              {isLoading ? 'Saving Member Record...' : initialData ? 'Update Unified Record' : 'Create Member & User Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnifiedUserEmployeeModal;
