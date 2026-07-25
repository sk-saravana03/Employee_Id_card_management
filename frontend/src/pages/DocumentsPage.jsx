import React, { useState, useEffect } from 'react';
import { FileText, Upload, Plus, Download, Eye, Trash2, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import StatusChip from '../components/common/StatusChip';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    employeeId: '',
    title: '',
    category: 'PASSPORT',
    fileUrl: '',
    version: 'v1.0',
    expiryDate: '',
  });

  const fetchDocumentsAndEmployees = async () => {
    setIsLoading(true);
    try {
      const [docRes, empRes] = await Promise.all([
        axiosInstance.get('/documents'),
        axiosInstance.get('/employees'),
      ]);

      if (docRes?.data?.data?.documents) setDocuments(docRes.data.data.documents);
      if (empRes?.data?.data) {
        const empList = Array.isArray(empRes.data.data) ? empRes.data.data : empRes.data.data.employees || [];
        setEmployees(empList);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentsAndEmployees();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const res = await axiosInstance.post('/documents/upload', form);
      toast.success(res.data.message || 'Document uploaded and verified!');
      setForm({ employeeId: '', title: '', category: 'PASSPORT', fileUrl: '', version: 'v1.0', expiryDate: '' });
      fetchDocumentsAndEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document record?')) return;
    try {
      await axiosInstance.delete(`/documents/${id}`);
      toast.success('Document record deleted.');
      fetchDocumentsAndEmployees();
    } catch (err) {
      toast.error('Failed to delete document.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-600" />
            Employee Document Management & Validation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Store, Upload, Preview & Verify Passports, National IDs, Contracts, & Tax Certificates.
          </p>
        </div>

        <button
          onClick={fetchDocumentsAndEmployees}
          className="p-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Catalog
        </button>
      </div>

      {/* Document Upload Form & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form Box */}
        <form onSubmit={handleUploadSubmit} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Upload className="w-4 h-4 text-emerald-600" /> Upload Employee Document
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Employee</label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-semibold"
            >
              <option value="PASSPORT">Passport</option>
              <option value="NATIONAL_ID">National ID / SSN</option>
              <option value="EMPLOYMENT_CONTRACT">Employment Contract</option>
              <option value="EDUCATION_CERTIFICATE">Education Certificate</option>
              <option value="TAX_FORM">Tax Form W-2 / W-9</option>
              <option value="OTHER">Other Official Document</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
            <input
              type="text"
              placeholder="e.g. Passport Photo Page 2026"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">File URL / Storage Link</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Version</label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
          >
            {isUploading ? 'Uploading & Verifying...' : 'Save & Verify Document'}
          </button>
        </form>

        {/* Documents Directory List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Employee Document Records
            </h3>
            <span className="text-xs text-slate-500 font-mono">Count: {documents.length}</span>
          </div>

          <div className="overflow-x-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-xs text-slate-400">
                  No employee documents uploaded yet.
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-400 transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{doc.title}</p>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300">
                            {doc.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <p>
                        Employee:{' '}
                        <strong>
                          {doc.employee?.firstName} {doc.employee?.lastName} ({doc.employee?.employeeId})
                        </strong>
                      </p>
                      <p>
                        Version: <span className="font-mono">{doc.version}</span> &bull; Expiry:{' '}
                        {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <StatusChip status={doc.status} />
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview Document
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
