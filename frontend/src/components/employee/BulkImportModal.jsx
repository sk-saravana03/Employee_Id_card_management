import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const BulkImportModal = ({ isOpen, onClose, onImport, branches = [], departments = [], isLoading = false }) => {
  const [parsedData, setParsedData] = useState([]);
  const [fileError, setFileError] = useState('');
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setFileError('Please select a valid CSV (.csv) file format.');
      return;
    }

    setFileError('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== '');

        if (lines.length <= 1) {
          setFileError('CSV file is empty or only contains header.');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
          if (values.length < 3) continue;

          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx] || '';
          });

          // Match Branch by code or name or default to first branch
          const matchedBranch =
            branches.find(
              (b) =>
                b.code.toLowerCase() === (rowObj.branch || '').toLowerCase() ||
                b.name.toLowerCase() === (rowObj.branch || '').toLowerCase()
            ) || branches[0];

          // Match Department by code or name or default to first department
          const matchedDept =
            departments.find(
              (d) =>
                d.code.toLowerCase() === (rowObj.department || '').toLowerCase() ||
                d.name.toLowerCase() === (rowObj.department || '').toLowerCase()
            ) || departments[0];

          rows.push({
            employeeId: rowObj.employeeId || `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
            firstName: rowObj.firstName || '',
            lastName: rowObj.lastName || '',
            email: rowObj.email || '',
            phone: rowObj.phone || '',
            designation: rowObj.designation || 'Staff Member',
            branch: matchedBranch?._id || '',
            branchName: matchedBranch?.name || rowObj.branch || 'Default Branch',
            department: matchedDept?._id || '',
            departmentName: matchedDept?.name || rowObj.department || 'Default Dept',
            joiningDate: rowObj.joiningDate || new Date().toISOString().split('T')[0],
          });
        }

        setParsedData(rows);
      } catch (err) {
        setFileError('Failed to parse CSV file content.');
      }
    };
    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    if (parsedData.length === 0) {
      toast.error('No employee rows ready to import.');
      return;
    }
    const res = await onImport(parsedData);
    if (res?.data) {
      setImportResult(res.data);
    }
  };

  const handleReset = () => {
    setParsedData([]);
    setFileError('');
    setImportResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Bulk Employee CSV Import
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload a `.csv` spreadsheet to batch create employee records.
            </p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          {/* Sample Format Help Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Expected CSV Header Columns:
            </p>
            <code className="block p-2 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 overflow-x-auto">
              employeeId,firstName,lastName,email,phone,designation,branch,department,joiningDate
            </code>
          </div>

          {/* Upload Drop Area */}
          {parsedData.length === 0 && !importResult && (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-950/20">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Click to browse or drop your CSV file here
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports standard CSV files with headers</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}

          {fileError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fileError}
            </div>
          )}

          {/* Import Execution Result Report */}
          {importResult && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" /> Import Process Completed
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="block text-slate-400 font-medium">Total</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">{importResult.totalAttempted}</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 text-emerald-600">
                  <span className="block font-medium">Success</span>
                  <span className="text-base font-bold">{importResult.successCount}</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-rose-200 text-rose-600">
                  <span className="block font-medium">Errors</span>
                  <span className="text-base font-bold">{importResult.errorCount}</span>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-rose-500">Error Details:</p>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside max-h-32 overflow-y-auto">
                    {importResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Parsed CSV Preview Data Table */}
          {parsedData.length > 0 && !importResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Preview Import Records ({parsedData.length} rows found)
                </h4>
                <button
                  onClick={handleReset}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Clear & Select Another File
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Emp ID</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Designation</th>
                      <th className="p-2.5">Branch</th>
                      <th className="p-2.5">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {parsedData.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {row.employeeId}
                        </td>
                        <td className="p-2.5 font-medium">
                          {row.firstName} {row.lastName}
                        </td>
                        <td className="p-2.5 text-slate-500">{row.email}</td>
                        <td className="p-2.5">{row.designation}</td>
                        <td className="p-2.5">{row.branchName}</td>
                        <td className="p-2.5">{row.departmentName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end gap-3">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
          {parsedData.length > 0 && !importResult && (
            <button
              onClick={handleStartImport}
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              {isLoading ? 'Importing Dataset...' : `Import ${parsedData.length} Employee Records`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
