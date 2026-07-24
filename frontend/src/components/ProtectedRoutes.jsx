import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './common/Spinner';

export const ProtectedRoutes = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm font-medium tracking-wide text-slate-400">Verifying Security Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role?.name || 'Employee';
    const isSuperAdmin = userRole === 'Super Admin';
    const isAuthorized = isSuperAdmin || allowedRoles.includes(userRole);

    if (!isAuthorized) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};
