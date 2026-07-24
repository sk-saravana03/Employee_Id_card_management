import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword', '');

  // Password strength checks
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Missing security reset token in URL parameters.');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
      });
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative font-sans">
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-brand-blue flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              ENTERPRISE ID SYSTEM
            </h1>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Password Update Terminal</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-sm shadow-2xl p-8"
        >
          <div className="mb-6 border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Reset Account Password</h2>
            <p className="text-xs text-slate-400 mt-1">
              Construct a compliant new password for your enterprise credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                label="New Enterprise Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••••••"
                error={errors.newPassword?.message}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  validate: {
                    hasUppercase: (v) => /[A-Z]/.test(v) || 'Must contain uppercase letter',
                    hasNumber: (v) => /\d/.test(v) || 'Must contain at least one digit',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              placeholder="••••••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === newPassword || 'Passwords do not match',
              })}
            />

            {/* Password Policy Check Matrix */}
            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] space-y-1">
              <p className="font-mono text-slate-400 font-semibold mb-1">COMPLIANCE CRITERIA:</p>
              <div className="flex items-center gap-2">
                {hasMinLen ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                <span className={hasMinLen ? 'text-slate-200' : 'text-slate-500'}>8+ Characters</span>
              </div>
              <div className="flex items-center gap-2">
                {hasUpper ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                <span className={hasUpper ? 'text-slate-200' : 'text-slate-500'}>At least 1 Uppercase Letter</span>
              </div>
              <div className="flex items-center gap-2">
                {hasDigit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                <span className={hasDigit ? 'text-slate-200' : 'text-slate-500'}>At least 1 Numeric Digit</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-brand-blue hover:bg-blue-700"
            >
              Update & Save Password
            </Button>
          </form>

          <div className="text-center mt-4 pt-3 border-t border-slate-800">
            <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200">
              Return to Login Page
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="p-4 border-t border-slate-900 text-center text-[11px] text-slate-500 font-mono">
        PASSWORD GOVERNANCE ENGINE &bull; RE-AUTHENTICATION MANDATORY
      </footer>
    </div>
  );
};
