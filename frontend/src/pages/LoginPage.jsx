import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
  Server,
  UserCheck,
  Printer,
  Crown,
  Users,
  CreditCard,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoleCard, setSelectedRoleCard] = useState('Super Admin');

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

  const handleQuickFill = (roleName, email, pass) => {
    setValue('email', email, { shouldValidate: true, shouldDirty: true });
    setValue('password', pass, { shouldValidate: true, shouldDirty: true });
    setSelectedRoleCard(roleName);
    toast.success(`Loaded demo credentials for ${roleName}`);
  };

  const roleQuickAccounts = [
    {
      role: 'Super Admin',
      title: 'Super Admin',
      subtitle: 'Full System Governance',
      email: 'admin@enterprise.com',
      pass: 'Admin@123456',
      icon: Crown,
      color: 'border-amber-500/50 text-amber-400 bg-amber-950/20 hover:bg-amber-950/40',
      badgeBg: 'bg-amber-500 text-slate-950',
    },
    {
      role: 'HR/Admin',
      title: 'HR / Admin',
      subtitle: 'Directory & Approvals',
      email: 'sarah.jenkins@enterprise.com',
      pass: 'Sara2834',
      icon: Users,
      color: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40',
      badgeBg: 'bg-emerald-600 text-white',
    },
    {
      role: 'Printer Operator',
      title: 'Printer Operator',
      subtitle: 'Card Print Queue & HW',
      email: 'patrick.miller@enterprise.com',
      pass: 'Patr8765',
      icon: Printer,
      color: 'border-indigo-500/50 text-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40',
      badgeBg: 'bg-indigo-600 text-white',
    },
    {
      role: 'Security Officer',
      title: 'Security Officer',
      subtitle: 'Gate Control & Visitors',
      email: 'sam.officer@enterprise.com',
      pass: 'Samu4321',
      icon: UserCheck,
      color: 'border-blue-500/50 text-blue-400 bg-blue-950/20 hover:bg-blue-950/40',
      badgeBg: 'bg-blue-600 text-white',
    },
    {
      role: 'Employee',
      title: 'Employee Self-Service',
      subtitle: 'Pass Request & Tracker',
      email: 'emily.davis@enterprise.com',
      pass: 'Emil1122',
      icon: CreditCard,
      color: 'border-purple-500/50 text-purple-400 bg-purple-950/20 hover:bg-purple-950/40',
      badgeBg: 'bg-purple-600 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Radial & Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="p-6 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg border border-emerald-400/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              ENTERPRISE ID & ACCESS PORTAL
            </h1>
            <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Corporate Identity & Access Control System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-sm">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>AUTH ENGINE: <strong className="text-emerald-400 font-bold">100% ONLINE</strong></span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 max-w-7xl mx-auto w-full my-4">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (7 Cols): Role Selector Cards Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-7 space-y-5"
          >
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Multi-Role Demo Access Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Select Your Role to Auto-Fill Login Credentials
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                Click any role card below to instantly populate the corresponding corporate email and encrypted credentials into the login text fields on the right.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {roleQuickAccounts.map((account) => {
                const Icon = account.icon;
                const isSelected = selectedRoleCard === account.role;

                return (
                  <div
                    key={account.role}
                    onClick={() => handleQuickFill(account.role, account.email, account.pass)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'border-emerald-400 bg-slate-900 shadow-lg ring-2 ring-emerald-500/30 scale-[1.02]'
                        : `${account.color} backdrop-blur-sm`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${account.badgeBg} shrink-0 shadow-sm`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {account.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{account.subtitle}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 truncate">{account.email}</span>
                      <span className="text-emerald-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Fill <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column (5 Cols): Login Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-5 w-full bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-7 relative backdrop-blur-md"
          >
            <div className="mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-md">
                  <KeyRound className="w-3 h-3" /> Single Sign-On Portal
                </span>
                <span className="text-[10px] font-mono text-slate-400">ROLE: {selectedRoleCard}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Credentials Login</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your authorized email & password or use the 1-click role cards on the left.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  label="Corporate Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="employee@enterprise.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Corporate email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid corporate email syntax',
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    {...register('enforceSingleSession')}
                  />
                  Enforce Single Active Session
                </label>

                <Link
                  to="/forgot-password"
                  className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium text-xs"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-3 font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-lg text-white"
              >
                Sign In to Enterprise Portal
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
              <span>PROTECTED BY AES-256 ENCRYPTION & REFRESH TOKEN COOKIES</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer System Compliance Notice */}
      <footer className="p-4 border-t border-slate-900/80 text-center text-[11px] text-slate-500 font-mono z-10">
        <p>CONFIDENTIAL & PROPRIETARY &bull; ENTERPRISE EMPLOYEE ID CARD MANAGEMENT SYSTEM &bull; ALL RIGHTS RESERVED</p>
      </footer>
    </div>
  );
};
