import React, { useState, useEffect } from 'react';
import { Printer, RefreshCw, Play, CheckCircle2, AlertCircle, RotateCcw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { printService } from '../services/print.service';
import { employeeService } from '../services/employee.service';
import PrinterHardwareCard from '../components/print/PrinterHardwareCard';

export const PrintQueuePage = () => {
  const [printJobs, setPrintJobs] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [selectedStatus, setSelectedStatus] = useState('');
  const [isReprintModalOpen, setIsReprintModalOpen] = useState(false);

  // Reprint Form fields
  const [reprintEmpId, setReprintEmpId] = useState('');
  const [reprintType, setReprintType] = useState('REPRINT_DAMAGED');
  const [reprintReason, setReprintReason] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const fetchPrintQueueData = async () => {
    setIsLoading(true);
    try {
      const [qRes, pRes, eRes] = await Promise.all([
        printService.getPrintQueue({ page: pagination.page, limit: pagination.limit, status: selectedStatus }),
        printService.getPrinterHardware(),
        employeeService.getEmployees({ limit: 100 }),
      ]);

      if (qRes?.data) {
        setPrintJobs(qRes.data.jobs || []);
        setPagination((prev) => ({ ...prev, total: qRes.data.pagination.total }));
      }
      if (pRes?.data?.printers) setPrinters(pRes.data.printers);
      if (eRes?.data?.employees) setEmployees(eRes.data.employees);
    } catch (err) {
      toast.error('Failed to load print queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrintQueueData();
  }, [pagination.page, selectedStatus]);

  const handleTogglePause = async (printerId) => {
    try {
      const res = await printService.togglePrinterPause(printerId);
      toast.success(res.message || 'Printer state updated!');
      fetchPrintQueueData();
    } catch (err) {
      toast.error('Failed to toggle printer pause.');
    }
  };

  const handleProcessJob = async (jobId) => {
    setIsLoading(true);
    try {
      const res = await printService.processPrintJob(jobId);
      toast.success(res.message || 'Print job completed!');
      fetchPrintQueueData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process print job.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReprint = async () => {
    if (!reprintEmpId) {
      toast.error('Please select an employee');
      return;
    }

    setIsLoading(true);
    try {
      const res = await printService.requestReprint({
        employeeId: reprintEmpId,
        requestType: reprintType,
        reprintReason,
      });
      toast.success(res.message || 'Reprint request queued!');
      setIsReprintModalOpen(false);
      fetchPrintQueueData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request reprint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Printer className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Print Management & Hardware Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Live Hardware Telemetry, Print Queue Control, & Employee Reprint Counters.
          </p>
        </div>

        <button
          onClick={() => setIsReprintModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Request Card Reprint
        </button>
      </div>

      {/* Live Hardware Telemetry Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {printers.map((p) => (
          <PrinterHardwareCard key={p._id} printer={p} onTogglePause={handleTogglePause} isLoading={isLoading} />
        ))}
      </div>

      {/* Print Queue Controls & Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" /> Active Print Queue Jobs
          </h3>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">All Queue Statuses</option>
              <option value="QUEUED">QUEUED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
            </select>

            <button
              onClick={fetchPrintQueueData}
              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Job ID</th>
                <th className="p-3.5">Employee / Card</th>
                <th className="p-3.5">Request Type</th>
                <th className="p-3.5">Reprint Counter</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Loading Print Queue...
                  </td>
                </tr>
              ) : printJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No print jobs currently in queue.
                  </td>
                </tr>
              ) : (
                printJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {job.jobId}
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {job.employee?.firstName} {job.employee?.lastName}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">{job.idCard?.cardId || job.employee?.employeeId}</p>
                    </td>

                    <td className="p-3.5 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {job.requestType}
                      </span>
                    </td>

                    <td className="p-3.5 font-bold font-mono">
                      {job.reprintCounter > 0 ? (
                        <span className="text-amber-500">#{job.reprintCounter} Reprints</span>
                      ) : (
                        <span className="text-slate-400">Initial Issue</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          job.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : job.status === 'QUEUED'
                            ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      {job.status === 'QUEUED' && (
                        <button
                          onClick={() => handleProcessJob(job._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5" /> Execute Print
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Reprint Modal */}
      {isReprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" /> Request Card Reprint
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Employee
              </label>
              <select
                value={reprintEmpId}
                onChange={(e) => setReprintEmpId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Choose Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reprint Request Reason Type
              </label>
              <select
                value={reprintType}
                onChange={(e) => setReprintType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="REPRINT_DAMAGED">Card Damaged / Worn Out</option>
                <option value="REPRINT_LOST">Card Lost / Stolen</option>
                <option value="REPRINT_UPDATED_INFO">Info / Designation Updated</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Justification
              </label>
              <input
                type="text"
                placeholder="Brief reason for re-issuance..."
                value={reprintReason}
                onChange={(e) => setReprintReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsReprintModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestReprint}
                disabled={isLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                {isLoading ? 'Queuing Reprint...' : 'Queue Card Reprint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintQueuePage;
