import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoutes } from './components/ProtectedRoutes';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { EmployeesPage } from './pages/EmployeesPage';
import { BranchesPage } from './pages/BranchesPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { UsersPage } from './pages/UsersPage';
import { IdCardManagementPage } from './pages/IdCardManagementPage';
import { PrintQueuePage } from './pages/PrintQueuePage';
import { VisitorManagementPage } from './pages/VisitorManagementPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'font-sans text-xs border border-slate-700 bg-slate-900 text-slate-100 shadow-lg',
                duration: 4000,
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected System Routes */}
              <Route element={<ProtectedRoutes />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/employees" element={<EmployeesPage />} />
                  <Route path="/branches" element={<BranchesPage />} />
                  <Route path="/departments" element={<DepartmentsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/id-cards" element={<IdCardManagementPage />} />
                  <Route path="/print-queue" element={<PrintQueuePage />} />
                  <Route path="/visitors" element={<VisitorManagementPage />} />
                  {/* Default root redirect to dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
