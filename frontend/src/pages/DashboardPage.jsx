import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Users,
  CreditCard,
  UserCheck,
  Building,
  Printer,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Bell,
  AlertCircle,
  QrCode,
  RefreshCw,
  Activity,
  FileText,
  TrendingUp,
} from 'lucide-react';
import NotificationBox from '../components/common/NotificationBox';
import LiveIdCardTracker from '../components/idcard/LiveIdCardTracker';
import axiosInstance from '../api/axiosInstance';

export const DashboardPage = () => {
  const { user } = useAuth();
  const userRole = user?.role?.name || 'Employee';
  const branchName = user?.branch?.name || 'Corporate HQ';
  const deptName = user?.department?.name || 'Information Technology';

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [stats, setStats] = useState({
    employeesCount: 0,
    totalIdCards: 0,
    pendingHr: 0,
    pendingAdmin: 0,
    inQueue: 0,
    printedCount: 0,
    totalVisitors: 0,
    checkedInVisitors: 0,
    pendingVisitors: 0,
  });

  const fetchDashboardMetrics = async () => {
    setIsLoadingStats(true);
    try {
      // Execute parallel calls for dashboard telemetry
      const [empRes, cardRes, visRes] = await Promise.allSettled([
        axiosInstance.get('/employees'),
        axiosInstance.get('/id-cards'),
        axiosInstance.get('/visitors'),
      ]);

      let empCount = 0;
      if (empRes.status === 'fulfilled' && empRes.value?.data?.data) {
        empCount = Array.isArray(empRes.value.data.data)
          ? empRes.value.data.data.length
          : empRes.value.data.data.employees?.length || 0;
      }

      let cards = [];
      if (cardRes.status === 'fulfilled' && cardRes.value?.data?.data) {
        cards = Array.isArray(cardRes.value.data.data)
          ? cardRes.value.data.data
          : cardRes.value.data.data.idCards || [];
      }

      let visitors = [];
      if (visRes.status === 'fulfilled' && visRes.value?.data?.data) {
        visitors = Array.isArray(visRes.value.data.data)
          ? visRes.value.data.data
          : visRes.value.data.data.visitors || [];
      }

      const pendingHr = cards.filter((c) => c.status === 'REQUESTED_PENDING_HR').length;
      const pendingAdmin = cards.filter((c) => c.status === 'APPROVED_BY_HR').length;
      const inQueue = cards.filter((c) => c.status === 'APPROVED_BY_ADMIN' || c.status === 'PRINTING').length;
      const printedCount = cards.filter((c) => c.status === 'PRINTED' || c.status === 'DELIVERED').length;

      const checkedInVisitors = visitors.filter((v) => v.status === 'CHECKED_IN').length;
      const pendingVisitors = visitors.filter((v) => v.approvalStatus === 'PENDING' || v.status === 'EXPECTED').length;

      setStats({
        employeesCount: empCount,
        totalIdCards: cards.length,
        pendingHr,
        pendingAdmin,
        inQueue,
        printedCount,
        totalVisitors: visitors.length,
        checkedInVisitors,
        pendingVisitors,
      });
    } catch (err) {
      console.error('Error fetching dashboard telemetry:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  // Determine role-based action banner
  const getActionBanner = () => {
    if (userRole === 'HR/Admin' || userRole === 'Super Admin') {
      const totalPending = stats.pendingHr + stats.pendingAdmin;
      if (totalPending > 0) {
        return {
          title: `${totalPending} ID Card Requests Awaiting Review & Approval`,
          message: `There are ${stats.pendingHr} pending HR verification requests and ${stats.pendingAdmin} pending Admin authorizations in the workflow queue.`,
          link: '/id-cards',
          linkText: 'Review Pending Cards',
          color: 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200',
          badgeBg: 'bg-amber-500 text-white',
        };
      }
    }

    if (userRole === 'Security Officer' || userRole === 'Super Admin') {
      if (stats.checkedInVisitors > 0 || stats.pendingVisitors > 0) {
        return {
          title: `Security Gate Control: ${stats.checkedInVisitors} Active Visitors On Premise`,
          message: `${stats.checkedInVisitors} visitor passes currently checked-in at security gates. ${stats.pendingVisitors} passes awaiting gate confirmation.`,
          link: '/visitors',
          linkText: 'Manage Gate Operations',
          color: 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200',
          badgeBg: 'bg-blue-600 text-white',
        };
      }
    }

    if (userRole === 'Printer Operator' || userRole === 'Super Admin') {
      if (stats.inQueue > 0) {
        return {
          title: `Print Queue Telemetry: ${stats.inQueue} ID Cards Ready for Physical Printing`,
          message: `High-volume thermal card printers have ${stats.inQueue} authorized cards queued for barcode and NFC chip encoding.`,
          link: '/print-queue',
          linkText: 'Open Print Hub',
          color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-900 dark:text-indigo-200',
          badgeBg: 'bg-indigo-600 text-white',
        };
      }
    }

    return null;
  };

  const actionBanner = getActionBanner();

  return (
    <div className="space-y-6">
      {/* Top Corporate Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl p-6 border border-emerald-700/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              ENTERPRISE SECURITY PORTAL
            </span>
            <span className="text-xs font-mono text-slate-300">
              ID: <span className="text-white font-bold">{user?.employeeId || 'EMP-00001'}</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-xs text-emerald-100/80 flex items-center gap-2">
            <span>{branchName}</span> &bull; <span>{deptName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="info" className="text-xs font-bold px-3 py-1 bg-white/10 text-white border-white/20">
            {userRole}
          </Badge>

          <button
            onClick={fetchDashboardMetrics}
            className="p-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all"
            title="Refresh Live Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
          </button>

          <NavLink
            to="/id-cards"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl shadow-sm transition-all transform active:scale-95"
          >
            <CreditCard className="w-4 h-4 text-emerald-600" /> ID Card Hub
          </NavLink>
        </div>
      </div>

      {/* Role-Based Urgent Action Required Alert Banner */}
      {actionBanner && (
        <div className={`p-4 rounded-2xl border ${actionBanner.color} flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${actionBanner.badgeBg} shrink-0`}>
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                Role Action Required &bull; {userRole}
              </span>
              <p className="text-sm font-bold">{actionBanner.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{actionBanner.message}</p>
            </div>
          </div>

          <NavLink
            to={actionBanner.link}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all"
          >
            {actionBanner.linkText} <ArrowRight className="w-4 h-4 text-emerald-600" />
          </NavLink>
        </div>
      )}

      {/* Real-Time Live KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                System Members
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {isLoadingStats ? '...' : stats.employeesCount || 0}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Employee DB
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pending ID Approvals
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {isLoadingStats ? '...' : stats.pendingHr + stats.pendingAdmin}
              </p>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 4-Stage Workflow Queue
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Gate Visitors
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {isLoadingStats ? '...' : stats.checkedInVisitors}
              </p>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Checked-In On Premise
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Print Hub Queue
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {isLoadingStats ? '...' : stats.inQueue}
              </p>
              <p className="text-[11px] text-indigo-600 font-medium mt-0.5 flex items-center gap-1">
                <Printer className="w-3.5 h-3.5" /> Ready for Badge Print
              </p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600">
              <Printer className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Layout Grid: Left 2-Cols (Tracker & Digital Card) | Right 1-Col (Notifications & Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Physical ID Card Tracker & Analytical Estimated Processing Banner */}
          <LiveIdCardTracker />

          {/* Digital Virtual Badge Card Preview & Dynamic Hologram Widget */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/60 relative overflow-hidden">
            {/* Background Decorative Watermark */}
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <ShieldCheck className="w-64 h-64 text-emerald-400" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/80">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                    Official Digital Identity Badge
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Enterprise Virtual Access Pass
                </h3>
              </div>

              <button
                onClick={() => setShowQrModal(!showQrModal)}
                className="px-3.5 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-xl flex items-center gap-1.5 transition-all"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                {showQrModal ? 'Hide Gate QR' : 'Show Gate Pass QR'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
              {/* Virtual Badge Front Card Visual */}
              <div className="sm:col-span-2 bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-emerald-900/60 border-2 border-emerald-500/40 text-emerald-300 font-bold text-xl flex items-center justify-center shrink-0 shadow-inner">
                  {user?.firstName ? user.firstName[0] : 'E'}
                  {user?.lastName ? user.lastName[0] : 'M'}
                </div>

                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs font-mono text-emerald-400">{user?.employeeId || 'EMP-00001'}</p>
                  <p className="text-[11px] text-slate-300 truncate">
                    {deptName} &bull; {branchName}
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACCESS: ACTIVE
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ROLE: {userRole}</span>
                  </div>
                </div>
              </div>

              {/* Security Hologram / Encrypted Gate Scan QR preview */}
              <div className="bg-slate-950/80 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <QrCode className="w-12 h-12 text-emerald-400" />
                <p className="text-[10px] font-mono text-slate-300 uppercase tracking-wider">
                  Gate Security Scanner QR
                </p>
                <span className="text-[9px] font-mono text-emerald-400/80 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                  ENCRYPTED AES-256
                </span>
              </div>
            </div>

            {/* QR Scanner Expanded Modal Overlay */}
            {showQrModal && (
              <div className="mt-4 p-4 rounded-xl bg-white text-slate-900 border border-emerald-400 shadow-xl flex flex-col items-center space-y-2 animate-fade-in">
                <p className="text-xs font-bold text-slate-900">Present to Security Gate Scanner</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <QrCode className="w-32 h-32 text-slate-900" />
                </div>
                <p className="text-[10px] font-mono text-slate-500">
                  Token: EMP-SEC-{user?.id?.substring(0, 8) || 'VAL-8829'}
                </p>
              </div>
            )}
          </div>

          {/* Quick Enterprise Workspace Actions Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Quick Enterprise Workspace Shortcuts
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Role: {userRole}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NavLink
                to="/id-cards"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      ID Card Management Hub
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {stats.pendingHr + stats.pendingAdmin > 0
                        ? `${stats.pendingHr + stats.pendingAdmin} Approvals Pending`
                        : 'Submit & Track ID Card Requests'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1" />
              </NavLink>

              <NavLink
                to="/visitors"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                      Visitor & Gate Passes
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {stats.checkedInVisitors > 0
                        ? `${stats.checkedInVisitors} Active On Premise`
                        : 'Gate Check-In / Register Visitor'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-transform group-hover:translate-x-1" />
              </NavLink>

              <NavLink
                to="/employees"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                      Employee Directory
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {stats.employeesCount > 0 ? `${stats.employeesCount} Directory Members` : 'Manage Active User Database'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 transition-transform group-hover:translate-x-1" />
              </NavLink>

              <NavLink
                to="/print-queue"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                      Print Queue Hub
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {stats.inQueue > 0 ? `${stats.inQueue} Cards Ready in Queue` : 'Hardware Printers & Telemetry'}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 transition-transform group-hover:translate-x-1" />
              </NavLink>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Notifications Box & Security Policy Governance */}
        <div className="lg:col-span-1 space-y-6">
          {/* Notification Box Widget */}
          <NotificationBox isWidget={true} />

          {/* Quick System Governance & Operational Status */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold tracking-tight">Security & Policy Governance</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Physical ID card requests follow strict 4-stage validation (Employee ➔ HR/Manager Approval ➔ Admin Authorization ➔ Printer Queue). Visitor passes are registered at the security gate and accepted by HR/Admin.
            </p>
            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Status: OPERATIONAL</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                100% ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

