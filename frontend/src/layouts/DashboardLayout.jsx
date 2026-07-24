import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { AiAssistant } from '../components/common/AiAssistant';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto min-w-0">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global AI Assistant — visible on all authenticated pages */}
      <AiAssistant />
    </div>
  );
};
