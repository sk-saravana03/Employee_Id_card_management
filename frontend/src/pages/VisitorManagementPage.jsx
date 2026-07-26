import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Printer,
  ShieldAlert,
  Clock,
  Trash2,
  Timer,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { visitorService } from '../services/visitor.service';
import { employeeService } from '../services/employee.service';
import { useAuth } from '../context/AuthContext';
import VisitorModal from '../components/visitor/VisitorModal';
import VisitorPassPreview from '../components/visitor/VisitorPassPreview';

export const VisitorManagementPage = () => {
  const { user } = useAuth();
  const userRole = user?.role?.name || '';
  const canRegister  = ['Super Admin', 'Security Officer', 'HR/Admin'].includes(userRole);
  const canCleanup   = ['Super Admin', 'HR/Admin'].includes(userRole);

  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPassPreviewOpen, setIsPassPreviewOpen] = useState(false);
  const [previewVisitor, setPreviewVisitor] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const fetchVisitors = async () => {
    setIsLoading(true);
    try {
      const [vRes, eRes] = await Promise.all([
        visitorService.getVisitors({ page: pagination.page, limit: pagination.limit, search, status: selectedStatus, purpose: selectedPurpose }),
        employeeService.getEmployees({ limit: 100 }),
      ]);

      if (vRes?.data) {
        setVisitors(vRes.data.visitors || []);
        setPagination((prev) => ({ ...prev, total: vRes.data.pagination.total }));
      }
      if (eRes?.data?.employees) setEmployees(eRes.data.employees);
    } catch (err) {
      toast.error('Failed to load visitor logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [pagination.page, search, selectedStatus, selectedPurpose]);

  const handleRegisterVisitor = async (formData) => {
    setIsLoading(true);
    try {
      const res = await visitorService.registerVisitor(formData);
      toast.success(res.message || 'Visitor registered!');
      setIsRegisterModalOpen(false);
      fetchVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register visitor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (id, status) => {
    const notes = window.prompt(`Enter approval notes for ${status}:`, status === 'APPROVED' ? 'Pass approved' : 'Security restriction');
    if (notes === null) return;

    try {
      const res = await visitorService.updateApproval(id, status, notes);
      toast.success(res.message || `Visitor pass ${status.toLowerCase()}!`);
      fetchVisitors();
    } catch (err) {
      toast.error('Failed to update visitor approval status.');
    }
  };

  const handleCheckIn = async (id) => {
    try {
      const res = await visitorService.checkInVisitor(id);
      toast.success(res.message || 'Visitor checked in at security gate!');
      fetchVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check-in visitor.');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const res = await visitorService.checkOutVisitor(id);
      toast.success(res.message || 'Visitor checked out!');
      fetchVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check-out visitor.');
    }
  };

  const handleCleanupExpired = async () => {
    if (!window.confirm('Permanently purge all expired & checked-out visitor records past their auto-delete window?')) return;
    try {
      const res = await visitorService.cleanupExpired();
      toast.success(res.message || 'Cleanup complete.');
      fetchVisitors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cleanup failed.');
    }
  };

  // Compute colour-coded expiry label for a visitor
  const getExpiryInfo = (visitor) => {
    const now = new Date();
    const expiry = new Date(visitor.expiryTime);
    const diffMs = expiry - now;
    if (diffMs < 0) return { label: 'EXPIRED', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffH < 1) return { label: `${diffM}m left`, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: `${diffH}h ${diffM}m`, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Visitor & Gate Pass Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visitor Pass Registration, Host Approvals, Temporary QR/Barcode Badges, & Security Logging.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Cleanup: only Super Admin / HR Admin */}
          {canCleanup && (
            <button
              onClick={handleCleanupExpired}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Purge Expired
            </button>
          )}

          {/* Register: only Security Officer + Super Admin */}
          {canRegister && (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Register Visitor Pass
            </button>
          )}

          {!canRegister && (
            <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Security Officers register visitor passes at the gate
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Visitor Name, Pass #, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-semibold"
        >
          <option value="">All Pass Statuses</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="CHECKED_OUT">Checked Out</option>
        </select>

        <select
          value={selectedPurpose}
          onChange={(e) => setSelectedPurpose(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100"
        >
          <option value="">All Visit Purposes</option>
          <option value="MEETING">Business Meeting</option>
          <option value="INTERVIEW">Interview</option>
          <option value="VENDOR">Vendor</option>
          <option value="DELIVERY">Delivery</option>
          <option value="MAINTENANCE">Maintenance</option>
        </select>
      </div>

      {/* Main Visitor Log Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Visitor Pass</th>
                <th className="p-3.5">Visiting Host</th>
                <th className="p-3.5">Purpose</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Entry / Exit Log</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Loading Visitor Log...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No visitor records found.
                  </td>
                </tr>
              ) : (
                visitors.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0">
                          {v.photoUrl ? (
                            <img src={v.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            v.fullName[0]
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{v.fullName}</p>
                          <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                            {v.passNumber} • {v.company}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {v.employeeToVisit?.firstName} {v.employeeToVisit?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400">{v.employeeToVisit?.designation}</p>
                    </td>

                    <td className="p-3.5 font-medium">{v.purpose}</td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          v.status === 'APPROVED' || v.status === 'CHECKED_IN'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : v.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}
                      >
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        {v.entryTime ? (
                          <p className="text-emerald-600 font-medium text-[11px]">
                            In: {new Date(v.entryTime).toLocaleTimeString()}
                          </p>
                        ) : (
                          <p className="text-slate-400 text-[11px]">Expected: {new Date(v.expectedEntryTime).toLocaleTimeString()}</p>
                        )}
                        {v.exitTime && (
                          <p className="text-slate-500 text-[11px]">Out: {new Date(v.exitTime).toLocaleTimeString()}</p>
                        )}
                        {/* Expiry countdown chip */}
                        {['PENDING_APPROVAL', 'APPROVED', 'CHECKED_IN'].includes(v.status) && (() => {
                          const { label, color } = getExpiryInfo(v);
                          return (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold rounded border ${color}`}>
                              <Timer className="w-2.5 h-2.5" />{label}
                            </span>
                          );
                        })()}
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {v.status === 'PENDING_APPROVAL' && (
                          <>
                            <button
                              title="Approve Pass"
                              onClick={() => handleApproval(v._id, 'APPROVED')}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              title="Reject Pass"
                              onClick={() => handleApproval(v._id, 'REJECTED')}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {v.status === 'APPROVED' && (
                          <button
                            title="Check-In Visitor"
                            onClick={() => handleCheckIn(v._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                          >
                            <LogIn className="w-3.5 h-3.5" /> Check-In
                          </button>
                        )}

                        {v.status === 'CHECKED_IN' && (
                          <button
                            title="Check-Out Visitor"
                            onClick={() => handleCheckOut(v._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Check-Out
                          </button>
                        )}

                        <button
                          title="Print Visitor Pass Badge"
                          onClick={() => {
                            setPreviewVisitor(v);
                            setIsPassPreviewOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Registration Modal */}
      <VisitorModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterVisitor}
        employees={employees}
        isLoading={isLoading}
      />

      {/* Printable Visitor Pass Preview Dialog */}
      <VisitorPassPreview
        isOpen={isPassPreviewOpen}
        onClose={() => {
          setIsPassPreviewOpen(false);
          setPreviewVisitor(null);
        }}
        visitor={previewVisitor}
      />
    </div>
  );
};

export default VisitorManagementPage;
