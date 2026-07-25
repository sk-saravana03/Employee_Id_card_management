import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, UserPlus, Shield, Building, Layers, Lock, Phone, Mail, Calendar, Camera, ChevronDown, Sparkles, HeartPulse, MapPin } from 'lucide-react';
import PhotoCaptureInput from './PhotoCaptureInput';
import { getDynamicDesignations } from '../../utils/designations.util';
import { generatePredefinedPassword } from '../../utils/password.util';

const DEPARTMENT_ROLE_MAP = {
  security: ['Security Officer', 'Super Admin'],
  guard: ['Security Officer'],
  safety: ['Security Officer'],

  it: ['Employee', 'Printer Operator', 'HR/Admin', 'Super Admin'],
  technology: ['Employee', 'Printer Operator', 'Super Admin'],
  engineering: ['Employee', 'Super Admin'],
  software: ['Employee', 'Super Admin'],
  devops: ['Employee', 'Super Admin'],

  'human resources': ['HR/Admin', 'Super Admin'],
  hr: ['HR/Admin', 'Super Admin'],
  talent: ['HR/Admin', 'Super Admin'],
  people: ['HR/Admin', 'Super Admin'],

  print: ['Printer Operator', 'HR/Admin', 'Super Admin'],
  operations: ['Printer Operator', 'Employee', 'Super Admin'],

  finance: ['Employee', 'HR/Admin', 'Super Admin'],
  accounting: ['Employee', 'HR/Admin'],

  sales: ['Employee', 'Super Admin'],
  marketing: ['Employee', 'HR/Admin'],

  admin: ['HR/Admin', 'Super Admin'],
  management: ['HR/Admin', 'Super Admin'],
  default: null,
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
  const [selectedDeptName, setSelectedDeptName] = useState('');
  const [selectedBranchName, setSelectedBranchName] = useState('');

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
  const watchedBranch = watch('branch');
  const watchedFirstName = watch('firstName');
  const watchedPhone = watch('phone');

  // Derive department & branch names
  useEffect(() => {
    if (watchedDept) {
      const deptObj = departments.find((d) => d._id === watchedDept || d._id === watchedDept?._id);
      setSelectedDeptName(deptObj?.name || '');
    } else {
      setSelectedDeptName('');
    }
  }, [watchedDept, departments]);

  useEffect(() => {
    if (watchedBranch) {
      const branchObj = branches.find((b) => b._id === watchedBranch || b._id === watchedBranch?._id);
      setSelectedBranchName(branchObj?.name || '');
    } else {
      setSelectedBranchName('');
    }
  }, [watchedBranch, branches]);

  // Compute dynamic designations based on branch and department
  const dynamicDesignationOptions = useMemo(() => {
    return getDynamicDesignations(selectedDeptName, selectedBranchName);
  }, [selectedDeptName, selectedBranchName]);

  // Auto-fill predefined password (First 4 letters of name + Last 4 digits of phone)
  useEffect(() => {
    if (!initialData && (watchedFirstName || watchedPhone)) {
      const generatedPass = generatePredefinedPassword(watchedFirstName, watchedPhone);
      setValue('password', generatedPass);
    }
  }, [watchedFirstName, watchedPhone, initialData, setValue]);

  // Filtered roles based on selected department name
  const filteredRoles = useMemo(() => {
    if (!selectedDeptName) return roles;
    const lowerDept = selectedDeptName.toLowerCase();
    for (const [key, allowedNames] of Object.entries(DEPARTMENT_ROLE_MAP)) {
      if (key === 'default') continue;
      if (lowerDept.includes(key)) {
        if (!allowedNames) return roles;
        return roles.filter((r) => allowedNames.includes(r.name));
      }
    }
    return roles;
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
        bloodGroup: initialData.bloodGroup || '',
        emergencyContact: initialData.emergencyContact || '',
        address: initialData.address || '',
        role: initialData.role?._id || initialData.role || '',
        status: initialData.status || 'ACTIVE',
        enableLogin: true,
      });
    } else {
      const initialPass = generatePredefinedPassword('Employee', '1234');
      reset({
        enableLogin: true,
        noticePeriodDays: 30,
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        avatarUrl: '',
        password: initialPass,
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
              {initialData ? 'Edit User & Employee Profile' : 'Provision New System User Account'}
            </h3>
            <p className="text-xs text-slate-500">
              Single Source of Truth: Auto-generates ID & Provisions both User Credentials & Employee Record.
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
                  placeholder="e.g. Saravanan"
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
                  placeholder="e.g. Kumar"
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
                  placeholder="saravanan@enterprise.com"
                  {...register('email', { required: 'Corporate email is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
                {errors.email && <span className="text-[10px] text-rose-500">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (Used for Predefined Password)
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  {...register('phone')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Additional Full Details: Blood Group, Emergency Contact, Address */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Blood Group
                </label>
                <select
                  {...register('bloodGroup')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  placeholder="+91 9123456789 (Kin)"
                  {...register('emergencyContact')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Location / Address
                </label>
                <input
                  type="text"
                  placeholder="City / Address"
                  {...register('address')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Employment Details & Dynamic Designation */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
              2. Employment & Dynamic Designation Catalog
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('branch', { required: 'Branch is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-semibold"
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
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-semibold"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>
                    Designation (Dynamic Dropdown) <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {watchedBranch && watchedDept ? 'Unlocked for selection' : 'Locked'}
                  </span>
                </label>

                {/* DYNAMIC DESIGNATION SELECT DROPDOWN - REQUIRES BRANCH AND DEPT FIRST */}
                <select
                  disabled={!watchedBranch || !watchedDept}
                  {...register('designation', { required: 'Designation is required' })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-semibold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!watchedBranch || !watchedDept
                      ? '⚠️ Select Branch & Department first'
                      : 'Select Dynamic Designation'}
                  </option>
                  {watchedBranch && watchedDept && dynamicDesignationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.designation && <span className="text-[10px] text-rose-500">{errors.designation.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Auto-generated Employee ID
                </label>
                <div className="w-full px-3 py-2 text-xs font-mono font-bold border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {initialData?.employeeId
                    ? initialData.employeeId
                    : 'Auto-generated on save (e.g. EMP260000001)'}
                </div>
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

          {/* Section 3: System Login Credentials & Predefined Password */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">System Access & Predefined Password</span>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Predefined Account Password</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">
                      Rule: First 4 Name + Last 4 Phone
                    </span>
                  </label>

                  <input
                    type="text"
                    {...register('password')}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-emerald-300 bg-emerald-50/50 text-slate-900 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pre-filled automatically as e.g. <strong className="text-emerald-700">Sara3210</strong>. Admin can customize if required.
                  </p>
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
