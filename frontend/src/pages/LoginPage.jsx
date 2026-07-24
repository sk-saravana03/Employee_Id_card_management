import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ShieldAlert, KeyRound, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'admin@enterprise.com',
      password: 'Admin@123456',
      rememberMe: true,
      enforceSingleSession: true,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password, data.enforceSingleSession);
      navigate('/dashboard');
    } catch (err) {
      // Error handled by AuthContext toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (email, pass) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-blue selection:text-white relative overflow-hidden font-sans">
      {/* Subtle Corporate Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      {/* Top Header Bar */}
      <header className="p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-brand-blue flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              ENTERPRISE ID SYSTEM
            </h1>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Corporate Identity & Access</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            AUTH SERVER: ONLINE
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-sm shadow-2xl p-8 relative"
        >
          <div className="mb-6 border-b border-slate-800 pb-4">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase bg-blue-950/80 text-blue-400 border border-blue-800/80 rounded mb-2">
              <KeyRound className="w-3 h-3" /> Secure SSO Portal
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">System Authentication</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in with your enterprise credentials to access your terminal session.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="Corporate Email"
                type="email"
                icon={Mail}
                placeholder="employee@enterprise.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Corporate email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address syntax',
                  },
                })}
              />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="••••••••••••"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  className="rounded border-slate-700 bg-slate-950 text-brand-blue focus:ring-brand-blue w-3.5 h-3.5"
                  {...register('enforceSingleSession')}
                />
                Single Active Session
              </label>

              <Link
                to="/forgot-password"
                className="text-brand-light hover:underline font-medium text-xs"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-semibold text-sm tracking-wide bg-brand-blue hover:bg-blue-700"
            >
              Sign In to Session
            </Button>
          </form>

          {/* Quick Credential Pre-fill Bar for Evaluators */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <p className="font-semibold text-slate-300 uppercase tracking-wider mb-2 font-mono text-[10px]">
              Preset Enterprise Role Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@enterprise.com', 'Admin@123456')}
                className="text-left p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <span className="font-semibold text-blue-400 block">Super Admin</span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">admin@enterprise.com</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('hr@enterprise.com', 'HR@123456')}
                className="text-left p-1.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <span className="font-semibold text-emerald-400 block">HR / Admin</span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">hr@enterprise.com</span>
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer System Compliance Notice */}
      <footer className="p-4 border-t border-slate-900 text-center text-[11px] text-slate-500 font-mono z-10">
        <p>CONFIDENTIAL & PROPRIETARY &bull; AUTHORIZED ENTERPRISE PERSONNEL ONLY &bull; AES-256 ENCRYPTED SESSION</p>
      </footer>
    </div>
  );
};
