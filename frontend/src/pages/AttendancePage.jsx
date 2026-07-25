import React, { useState, useEffect } from 'react';
import { Clock, QrCode, CheckCircle2, AlertCircle, Calendar, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/common/StatusChip';

export const AttendancePage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [scanType, setScanType] = useState('QR_SCAN');

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/attendance');
      if (res?.data?.data?.attendanceLogs) {
        setLogs(res.data.data.attendanceLogs);
      }
    } catch (err) {
      console.error('Failed to load attendance logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const res = await axiosInstance.post('/attendance/check-in', { scanType });
      toast.success(res.data.message || 'Check-in recorded!');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingIn(true);
    try {
      const res = await axiosInstance.post('/attendance/check-out', {});
      toast.success(res.data.message || 'Check-out recorded!');
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-emerald-600" />
            QR & Barcode Attendance Terminal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-Time Gate Scanner Check-In, Working Hours Calculation & Daily Attendance Logs.
          </p>
        </div>

        <button
          onClick={fetchAttendance}
          className="p-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      {/* Terminal Scanner & Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl shadow-md border border-slate-700/60 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                SCANNER GATE TERMINAL #01
              </span>
            </div>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="px-3 py-1 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
            >
              <option value="QR_SCAN">QR CODE SCANNER</option>
              <option value="BARCODE_SCAN">BARCODE OPTICAL</option>
              <option value="BIOMETRIC">BIOMETRIC HARDWARE</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xl flex items-center justify-center shrink-0">
                {user?.firstName ? user.firstName[0] : 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs font-mono text-emerald-400">{user?.employeeId || 'EMP-00001'}</p>
                <p className="text-[11px] text-slate-300">Role: {user?.role?.name || 'Employee'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" /> Check-In Now
              </button>

              <button
                onClick={handleCheckOut}
                disabled={isCheckingIn}
                className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Clock className="w-4 h-4" /> Check-Out
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-700/60 pt-3">
            <span>Terminal Mode: ONLINE</span>
            <span>Policy: Shift Hours Standard 09:00 - 18:00</span>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Attendance Policy Telemetry
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="font-bold text-emerald-900 block">On-Time Standard</span>
              Check-ins logged before 10:00 AM are registered as PRESENT.
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="font-bold text-amber-900 block">Late Shift Policy</span>
              Check-ins logged past 10:00 AM trigger a LATE status tag.
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">Working Hours Calculation</span>
              Total hours automatically computed upon daily Check-Out.
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Activity Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" /> Attendance Terminal Audit Log
          </h3>
          <span className="text-xs text-slate-500 font-mono">Total Logs: {logs.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Employee ID</th>
                <th className="p-3.5">Scan Method</th>
                <th className="p-3.5">Check-In Time</th>
                <th className="p-3.5">Check-Out Time</th>
                <th className="p-3.5">Working Hours</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No attendance records logged for today.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      {log.employee?.firstName} {log.employee?.lastName}
                    </td>
                    <td className="p-3.5 font-mono text-emerald-700 font-bold">
                      {log.employee?.employeeId}
                    </td>
                    <td className="p-3.5 font-mono text-xs">{log.scanType}</td>
                    <td className="p-3.5">{new Date(log.checkInTime).toLocaleTimeString()}</td>
                    <td className="p-3.5">
                      {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : 'Active Session'}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-slate-900">
                      {log.workingHours ? `${log.workingHours} hrs` : '--'}
                    </td>
                    <td className="p-3.5">
                      <StatusChip status={log.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
