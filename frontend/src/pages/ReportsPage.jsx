import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Filter, FileText, CheckCircle2, RefreshCw, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import axiosInstance from '../api/axiosInstance';

export const ReportsPage = () => {
  const [reportType, setReportType] = useState('EMPLOYEES');
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReportData = async (type = reportType) => {
    setIsLoading(true);
    try {
      if (type === 'EMPLOYEES') {
        const res = await axiosInstance.get('/employees');
        setDataList(res.data?.data?.employees || res.data?.data || []);
      } else if (type === 'ID_CARDS') {
        const res = await axiosInstance.get('/id-cards');
        setDataList(res.data?.data?.idCards || res.data?.data || []);
      } else if (type === 'VISITORS') {
        const res = await axiosInstance.get('/visitors');
        setDataList(res.data?.data?.visitors || res.data?.data || []);
      } else if (type === 'ATTENDANCE') {
        const res = await axiosInstance.get('/attendance');
        setDataList(res.data?.data?.attendanceLogs || []);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(reportType);
  }, [reportType]);

  const handleExportExcel = () => {
    if (dataList.length === 0) {
      toast.error('No data records available to export.');
      return;
    }

    let exportRows = [];
    if (reportType === 'EMPLOYEES') {
      exportRows = dataList.map((item) => ({
        'Employee ID': item.employeeId,
        Name: `${item.firstName} ${item.lastName}`,
        Email: item.email,
        Designation: item.designation,
        Branch: item.branch?.name || 'N/A',
        Department: item.department?.name || 'N/A',
        Status: item.status,
      }));
    } else if (reportType === 'ID_CARDS') {
      exportRows = dataList.map((item) => ({
        'Card ID': item.cardId,
        Employee: `${item.employee?.firstName} ${item.employee?.lastName} (${item.employee?.employeeId})`,
        Status: item.status,
        'Issue Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
      }));
    } else if (reportType === 'VISITORS') {
      exportRows = dataList.map((item) => ({
        Visitor: item.fullName,
        Company: item.company || 'N/A',
        Email: item.email,
        Phone: item.phone,
        Status: item.status,
        'Check-In': item.checkInTime ? new Date(item.checkInTime).toLocaleString() : 'N/A',
      }));
    } else if (reportType === 'ATTENDANCE') {
      exportRows = dataList.map((item) => ({
        Employee: `${item.employee?.firstName} ${item.employee?.lastName}`,
        'Employee ID': item.employee?.employeeId,
        'Check-In': new Date(item.checkInTime).toLocaleTimeString(),
        'Check-Out': item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : 'N/A',
        'Working Hours': item.workingHours || 0,
        Status: item.status,
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType}_Report`);
    XLSX.writeFile(workbook, `${reportType}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`Exported ${reportType} report to Excel!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            Enterprise Reports & Analytics Export Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate, Filter & Export PDF/Excel Audit Reports for Employees, ID Cards, Visitors, & Attendance.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all transform active:scale-95"
        >
          <Download className="w-4 h-4" /> Export Report to Excel (.xlsx)
        </button>
      </div>

      {/* Report Selector Tabs */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3 overflow-x-auto">
        <button
          onClick={() => setReportType('EMPLOYEES')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'EMPLOYEES'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Employee Directory Report
        </button>

        <button
          onClick={() => setReportType('ID_CARDS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'ID_CARDS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ID Cards Pipeline Report
        </button>

        <button
          onClick={() => setReportType('VISITORS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'VISITORS'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Visitor Gate Audit Report
        </button>

        <button
          onClick={() => setReportType('ATTENDANCE')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            reportType === 'ATTENDANCE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Attendance Telemetry Report
        </button>
      </div>

      {/* Report Preview Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" /> Active Report Preview ({reportType})
          </h3>
          <span className="text-xs text-slate-500 font-mono">Row Count: {dataList.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">Primary Record Identifier</th>
                <th className="p-3.5">Category / Department</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Audit Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No records found for the selected report category.
                  </td>
                </tr>
              ) : (
                dataList.slice(0, 50).map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {row.employeeId || row.cardId || row.fullName || row.title || 'Record #'}
                    </td>
                    <td className="p-3.5">
                      {row.department?.name || row.branch?.name || row.category || row.company || 'Corporate'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {row.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-400">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
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

export default ReportsPage;
