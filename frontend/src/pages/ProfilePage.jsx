import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { User, KeyRound, Lock, ShieldCheck, Mail, Building, Eye, EyeOff, Phone, MapPin, Heart, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, login } = useAuth();
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isPassLoading, setIsPassLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Form for changing password
  const {
    register: registerPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    watch: watchPass,
    formState: { errors: passErrors },
  } = useForm();

  // Form for updating personal details & sensitive encrypted data
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm();

  useEffect(() => {
    if (user) {
      setProfileValue('phone', user.phone || '');
      setProfileValue('emergencyContact', user.emergencyContact || '');
      setProfileValue('address', user.address || '');
      setProfileValue('bloodGroup', user.bloodGroup || '');
      setProfileValue('nationalId', '');
    }
  }, [user, setProfileValue]);

  const newPassword = watchPass('newPassword', '');

  const onChangePasswordSubmit = async (data) => {
    setIsPassLoading(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully.');
      resetPass();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed.');
    } finally {
      setIsPassLoading(false);
    }
  };

  const onUpdateProfileSubmit = async (data) => {
    setIsProfileLoading(true);
    try {
      const res = await authService.updateProfile(data);
      toast.success(res.message || 'Personal profile updated with AES-256 encryption.');
      // Refresh current user state in context if updated
      const freshUser = await authService.getCurrentUser();
      if (freshUser?.data?.user) {
        // Trigger a light reload or update state
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed.');
    } finally {
      setIsProfileLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          Personal Profile & AES-256 Security Credentials
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details and identity settings with hardware-grade AES-256 database encryption.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Identity Summary */}
        <Card title="Employee Identity" subtitle="System Account Record" className="lg:col-span-1">
          <div className="flex flex-col items-center py-4 text-center border-b border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl border-2 border-emerald-500 shadow-md">
              {user?.firstName?.[0] || 'E'}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
            <div className="mt-2">
              <Badge variant="info">{user?.role?.name || 'Employee'}</Badge>
            </div>
          </div>

          <div className="space-y-3 pt-4 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Employee ID</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                {user?.employeeId}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Designation</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {user?.designation || 'Staff Member'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Branch</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.branch?.name || 'Corporate HQ'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Department</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.department?.name || 'Information Technology'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Encryption Status</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> AES-256 Active
              </span>
            </div>
          </div>
        </Card>

        {/* Personal Details & Sensitive Encrypted Data Form */}
        <Card
          title="Update Personal Details & Encrypted Sensitive Data"
          subtitle="All sensitive fields are stored with hardware AES-256 encryption"
          className="lg:col-span-2"
        >
          <form onSubmit={handleProfileSubmit(onUpdateProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-[10px] text-emerald-600 font-mono">AES-256 Encrypted</span>
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  {...registerProfile('phone')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>National ID / SSN</span>
                  <span className="text-[10px] text-emerald-600 font-mono">AES-256 Encrypted</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter National ID / SSN"
                  {...registerProfile('nationalId')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 999-0000 (Relative)"
                  {...registerProfile('emergencyContact')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group
                </label>
                <select
                  {...registerProfile('bloodGroup')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Residential Address / Location
              </label>
              <input
                type="text"
                placeholder="123 Corporate District, Suite 100"
                {...registerProfile('address')}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" isLoading={isProfileLoading}>
                Save Encrypted Personal Details
              </Button>
            </div>
          </form>

          {/* Change Password Form inside right column */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              Update Account Password
            </h4>

            <form onSubmit={handlePassSubmit(onChangePasswordSubmit)} className="space-y-4 max-w-lg">
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showCurrentPass ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="••••••••••••"
                  error={passErrors.currentPassword?.message}
                  {...registerPass('currentPassword', { required: 'Current password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass((prev) => !prev)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-200"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  type={showNewPass ? 'text' : 'password'}
                  icon={KeyRound}
                  placeholder="••••••••••••"
                  error={passErrors.newPassword?.message}
                  {...registerPass('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters long' },
                    validate: {
                      hasUppercase: (v) => /[A-Z]/.test(v) || 'Must contain at least 1 uppercase letter',
                      hasNumber: (v) => /\d/.test(v) || 'Must contain at least 1 numeric digit',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass((prev) => !prev)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-200"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Input
                label="Confirm New Password"
                type="password"
                icon={Lock}
                placeholder="••••••••••••"
                error={passErrors.confirmNewPassword?.message}
                {...registerPass('confirmNewPassword', {
                  required: 'Please confirm new password',
                  validate: (v) => v === newPassword || 'Passwords do not match',
                })}
              />

              <div className="pt-2">
                <Button type="submit" variant="secondary" isLoading={isPassLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
