import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-sm shadow-2xl">
        <div className="w-14 h-14 bg-blue-500/10 text-brand-light rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white">404 - Terminal Route Not Found</h1>
        <p className="text-xs text-slate-400 font-mono">
          The requested URL path does not correspond to an active system route.
        </p>
        <div className="pt-4">
          <Link to="/dashboard">
            <Button variant="primary" size="md" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Safety
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
