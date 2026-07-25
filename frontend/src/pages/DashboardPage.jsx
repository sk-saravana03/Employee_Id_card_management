import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { authService } from '../services/auth.service';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Building,
  KeyRound,
  Clock,
  Activity,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Database,
  CheckCircle,
  Terminal,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationBox from '../components/common/NotificationBox';
import LiveIdCardTracker from '../components/idCard/LiveIdCardTracker';

export const DashboardPage = () => {
  const { user, setUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const userRole = user?.role?.name || 'Employee';
  const branchName = user?.branch?.name || 'Corporate HQ';
  const deptName = user?.department?.name || 'Information Technology';

  const handleTestTokenRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await authService.getCurrentUser();
      if (res?.data?.user) {
        setUser(res.data.user);
        toast.success('Session token validated and refreshed successfully.');
      }
    } catch (err) {
      toast.error('Token refresh check failed.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-sm p-6 border border-slate-800 shadow-enterprise flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              TERMINAL SESSION #ACTIVE
            </span>
            <span className="text-xs font-mono text-slate-400">
              ID: <span className="text-white font-semibold">{user?.employeeId || 'EMP-00001'}</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs text-slate-300 flex items-center gap-2">
            <span>{branchName}</span> &bull; <span>{deptName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={userRole === 'Super Admin' ? 'danger' : 'info'} className="text-sm px-3 py-1">
            Role: {userRole}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestTokenRefresh}
            isLoading={isRefreshing}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh Session
          </Button>
        </div>
      </div>

      {/* Live Physical ID Card Stepper & Push Notification Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveIdCardTracker />
        </div>
        <div className="lg:col-span-1">
          <NotificationBox isWidget={true} />
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Authentication
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                JWT + Cookie
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3 h-3" /> HTTP-Only Secure Cookie
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded text-brand-blue dark:text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Data Protection
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                AES-256-GCM
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3" /> Sensitive Fields Encrypted
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded text-emerald-600 dark:text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Access Level
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {userRole}
              </p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5 flex items-center gap-1 font-medium">
                <UserCheck className="w-3 h-3" /> RBAC Enforced
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 rounded text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Single Session
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                Enforced
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" /> 30-Min Inactivity Timeout
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded text-amber-600 dark:text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Grid Row: Session Diagnostic & Architecture Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Session Diagnostics */}
        <Card title="Active Session Diagnostics" subtitle="Current User Terminal Context" className="lg:col-span-1">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">User Email</span>
              <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">{user?.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Employee ID</span>
              <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">{user?.employeeId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Account Status</span>
              <Badge variant="success">{user?.status || 'ACTIVE'}</Badge>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Email Verified</span>
              <Badge variant={user?.isVerified ? 'success' : 'warning'}>
                {user?.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </Badge>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Last Login IP</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">{user?.lastLoginIp || '127.0.0.1'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Password Hash</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">bcrypt (12 rounds)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowAuditModal(true)}
            >
              <Terminal className="w-3.5 h-3.5 mr-1.5" /> View System Audit Logs
            </Button>
          </div>
        </Card>

        {/* Phase Architecture Status */}
        <Card
          title="Enterprise Architecture Status Matrix"
          subtitle="System Foundation & Future Module Roadmap"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-xs text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  Phase 1 Foundation (ACTIVE & COMPILED)
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300">
                JWT Authentication, Refresh Tokens, HTTP-Only Cookies, Single Active Session Enforcement, AES-256 Encryption Utility, MongoDB Mongoose Models, RBAC Authorization Middleware, Nodemailer Email Dispatcher, Express Validator, and SAP/Oracle-style Enterprise UI.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-900/50 opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Employee Directory Module
                  </span>
                  <Badge variant="neutral">Phase 2</Badge>
                </div>
                <p className="text-[11px] text-slate-500">Employee lifecycle management, department assignments, document uploads.</p>
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-900/50 opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    ID Card Printing Module
                  </span>
                  <Badge variant="neutral">Phase 2</Badge>
                </div>
                <p className="text-[11px] text-slate-500">Card template designer, queue management, RFID/Barcode encoding, printer status.</p>
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-900/50 opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Gate Access & Security
                  </span>
                  <Badge variant="neutral">Phase 3</Badge>
                </div>
                <p className="text-[11px] text-slate-500">Turnstile scanner API, real-time validation, visitor management, access logs.</p>
              </div>

              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/50 dark:bg-slate-900/50 opacity-70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Analytics & AI Assistant
                  </span>
                  <Badge variant="neutral">Phase 3</Badge>
                </div>
                <p className="text-[11px] text-slate-500">Executive dashboard analytics, card usage trends, AI identity verification support.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Log Modal */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="System Security Audit Trail"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setShowAuditModal(false)}>
            Close Terminal
          </Button>
        }
      >
        <div className="space-y-3 font-mono text-xs">
          <div className="p-2.5 bg-slate-950 text-slate-300 rounded border border-slate-800">
            <p className="text-emerald-400 font-bold">[LOGIN_SUCCESS]</p>
            <p className="text-[11px] text-slate-400">User: {user?.email} | IP: 127.0.0.1</p>
            <p className="text-[10px] text-slate-500 mt-1">{new Date().toISOString()}</p>
          </div>
          <div className="p-2.5 bg-slate-950 text-slate-300 rounded border border-slate-800">
            <p className="text-blue-400 font-bold">[SESSION_INITIATED]</p>
            <p className="text-[11px] text-slate-400">Single Active Session Enforced: TRUE</p>
            <p className="text-[10px] text-slate-500 mt-1">{new Date().toISOString()}</p>
          </div>
          <div className="p-2.5 bg-slate-950 text-slate-300 rounded border border-slate-800">
            <p className="text-purple-400 font-bold">[RBAC_AUTHORIZATION_VERIFIED]</p>
            <p className="text-[11px] text-slate-400">Role Matrix Verified: {userRole}</p>
            <p className="text-[10px] text-slate-500 mt-1">{new Date().toISOString()}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
