import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-2xl">
        <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">403 - Security Authorization Denied</h1>
        <p className="text-xs text-slate-400">
          Your current user role does not possess the required RBAC permissions to access this enterprise module resource.
        </p>
        <div className="pt-4">
          <Link to="/dashboard">
            <Button variant="primary" size="md" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Authorized Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
