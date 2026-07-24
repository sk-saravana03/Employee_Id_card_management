import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Password recovery instructions sent.');
    } catch (err) {
      toast.error('Failed to request password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <header className="p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-brand-blue flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              ENTERPRISE ID SYSTEM
            </h1>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Password Recovery Console</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-sm shadow-2xl p-8"
        >
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Security Link Dispatched</h2>
              <p className="text-xs text-slate-300">
                If <span className="font-mono text-blue-400 font-semibold">{submittedEmail}</span> matches a registered corporate identity, an encrypted password reset token has been dispatched via Nodemailer.
              </p>
              <div className="pt-4 border-t border-slate-800">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-brand-light hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to Login Terminal
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">Forgot Password</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your registered corporate email to receive a high-security reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Corporate Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="employee@enterprise.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid corporate email format',
                    },
                  })}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full bg-brand-blue hover:bg-blue-700"
                >
                  Dispatch Security Reset Link
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </Link>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </main>

      <footer className="p-4 border-t border-slate-900 text-center text-[11px] text-slate-500 font-mono">
        IDENTITY ACCESS CONSOLE &bull; ALL ACTIONS AUDITED
      </footer>
    </div>
  );
};
