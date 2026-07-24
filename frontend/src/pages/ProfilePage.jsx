import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { User, KeyRound, Lock, ShieldCheck, Mail, Building, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword', '');

  const onChangePasswordSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully.');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Security Profile & Credentials
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your enterprise user identity credentials and account security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Identity Summary */}
        <Card title="Employee Identity" subtitle="System Account Record" className="lg:col-span-1">
          <div className="flex flex-col items-center py-4 text-center border-b border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xl border-2 border-slate-700 shadow-md">
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
              <span className="text-slate-500 dark:text-slate-400">Branch</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.branch?.name || 'Headquarters'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Department</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {user?.department?.name || 'Information Technology'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Status</span>
              <Badge variant="success">ACTIVE</Badge>
            </div>
          </div>
        </Card>

        {/* Change Password Form */}
        <Card
          title="Change Password"
          subtitle="Update Password in Compliance with Enterprise Policy"
          className="lg:col-span-2"
        >
          <form onSubmit={handleSubmit(onChangePasswordSubmit)} className="space-y-4 max-w-lg">
            <div className="relative">
              <Input
                label="Current Password"
                type={showCurrentPass ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••••••"
                error={errors.currentPassword?.message}
                {...register('currentPassword', {
                  required: 'Current password is required',
                })}
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
                error={errors.newPassword?.message}
                {...register('newPassword', {
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
              error={errors.confirmNewPassword?.message}
              {...register('confirmNewPassword', {
                required: 'Please confirm new password',
                validate: (v) => v === newPassword || 'Passwords do not match',
              })}
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Update Security Credentials
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
