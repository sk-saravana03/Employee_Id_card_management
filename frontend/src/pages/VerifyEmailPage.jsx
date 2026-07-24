import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Spinner } from '../components/common/Spinner';
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('VERIFYING'); // VERIFYING | SUCCESS | ERROR
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('ERROR');
      setErrorMessage('No verification token provided in request parameters.');
      return;
    }

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('SUCCESS');
      } catch (err) {
        setStatus('ERROR');
        setErrorMessage(err.response?.data?.message || 'Verification failed or link expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-brand-blue flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              ENTERPRISE ID SYSTEM
            </h1>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">Corporate Verification Portal</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-sm shadow-2xl p-8 text-center"
        >
          {status === 'VERIFYING' && (
            <div className="py-8 space-y-4">
              <Spinner size="lg" className="mx-auto text-brand-light" />
              <h2 className="text-lg font-bold text-white">Verifying Corporate Identity Token</h2>
              <p className="text-xs text-slate-400">Communicating with authentication service...</p>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Email Address Verified</h2>
              <p className="text-xs text-slate-300">
                Your corporate email address has been confirmed and attached to your employee security record.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-blue hover:bg-blue-700 text-white font-medium text-xs rounded transition-colors w-full"
                >
                  Proceed to Terminal Login <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="py-6 space-y-4">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <XCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Verification Failed</h2>
              <p className="text-xs text-rose-300 font-mono bg-rose-950/40 p-2 rounded border border-rose-900">
                {errorMessage}
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded transition-colors w-full"
                >
                  Return to Login Terminal
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="p-4 border-t border-slate-900 text-center text-[11px] text-slate-500 font-mono">
        ENTERPRISE EMAIL AUTHENTICATION SERVICE
      </footer>
    </div>
  );
};
