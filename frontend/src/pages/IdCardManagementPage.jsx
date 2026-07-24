import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Eye,
  Smartphone,
  Printer,
  History,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { idCardService } from '../services/idCard.service';
import { employeeService } from '../services/employee.service';
import IdCardPreview from '../components/idcard/IdCardPreview';
import DigitalIdCardModal from '../components/idcard/DigitalIdCardModal';
import { getDesignationTheme, getAllThemes } from '../utils/designationTheme';

export const IdCardManagementPage = () => {
  const [idCards, setIdCards] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Selected Card for Live Preview
  const [previewCard, setPreviewCard] = useState(null);
  // Manual theme key override (null = auto from designation)
  const [themeOverride, setThemeOverride] = useState(null);

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState(false);
  const [digitalEmployee, setDigitalEmployee] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyCard, setHistoryCard] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const fetchIdCards = async () => {
    setIsLoading(true);
    try {
      const res = await idCardService.getIdCards({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: selectedStatus,
      });

      if (res?.data) {
        setIdCards(res.data.idCards || []);
        setPagination((prev) => ({ ...prev, total: res.data.pagination.total }));
        if (res.data.idCards.length > 0 && !previewCard) {
          setPreviewCard(res.data.idCards[0]);
        }
      }
    } catch (err) {
      toast.error('Failed to load ID card list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchEmps = async () => {
      try {
        const res = await employeeService.getEmployees({ limit: 100 });
        if (res?.data?.employees) setEmployees(res.data.employees);
      } catch (err) {}
    };
    fetchEmps();
  }, []);

  useEffect(() => {
    fetchIdCards();
  }, [pagination.page, search, selectedStatus]);

  const handleGenerateCard = async () => {
    if (!selectedEmpId) {
      toast.error('Please select an employee');
      return;
    }
    setIsLoading(true);
    try {
      // Find selected employee to determine auto theme label
      const emp = employees.find((e) => e._id === selectedEmpId);
      const autoTheme = emp ? getDesignationTheme(emp.designation) : null;
      const res = await idCardService.generateIdCard({
        employeeId: selectedEmpId,
        // Pass the auto-resolved theme key for server-side record keeping
        template: autoTheme?.label?.replace(/\s+/g, '_').toUpperCase() || 'AUTO',
      });
      toast.success(res.message || 'ID Card generated!');
      setIsGenerateModalOpen(false);
      fetchIdCards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate ID card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Employee ID Card Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate, Preview Templates, Issue Cards, & Manage Digital Pass Versions.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Generate ID Card
        </button>
      </div>

      {/* Main Grid: Card Designer Preview + Data Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Card Renderer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Live Interactive Preview
              </h3>
              <span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1">
                <Palette className="w-3 h-3" />
                Designation-Based Theme
              </span>
            </div>

            {/* Live Canvas */}
            {previewCard?.employee ? (
              <IdCardPreview
                employee={previewCard.employee}
                idCard={previewCard}
                themeKey={themeOverride}
                onThemeChange={setThemeOverride}
              />
            ) : (
              <div className="h-[540px] rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-center p-6 text-slate-400 text-xs">
                Select an ID card record from the table to preview canvas
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ID Cards Table & Management (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filters Bar */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Card ID or Employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="PRINTED">Printed</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Card ID / Version</th>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Theme</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-400">
                        Loading Cards...
                      </td>
                    </tr>
                  ) : idCards.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-slate-400">
                        No ID Card records found.
                      </td>
                    </tr>
                  ) : (
                    idCards.map((card) => {
                      // Compute the designation theme dot colour for the table row
                      const empTheme = card.employee?.designation
                        ? getDesignationTheme(card.employee.designation)
                        : null;
                      return (
                        <tr
                          key={card._id}
                          onClick={() => {
                            setPreviewCard(card);
                            setThemeOverride(null); // reset to auto on card change
                          }}
                          className={`cursor-pointer transition-colors ${
                            previewCard?._id === card._id
                              ? 'bg-indigo-50/70'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-3">
                            <p className="font-mono font-bold text-indigo-600">
                              {card.cardId}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">v{card.version}</span>
                          </td>

                          <td className="p-3">
                            <p className="font-bold text-slate-900">
                              {card.employee?.firstName} {card.employee?.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400">{card.employee?.designation}</p>
                          </td>

                          <td className="p-3">
                            {empTheme ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: empTheme.badgeText }}>
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ background: empTheme.dot }}
                                />
                                {empTheme.label}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>

                          <td className="p-3">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              {card.status}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                title="Digital Mobile Wallet Pass"
                                onClick={() => {
                                  setDigitalEmployee(card.employee);
                                  setIsDigitalModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50"
                              >
                                <Smartphone className="w-4 h-4" />
                              </button>

                              <button
                                title="Version History"
                                onClick={() => {
                                  setHistoryCard(card);
                                  setIsHistoryModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                              >
                                <History className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Card Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Generate ID Card & Queue Print
            </h3>

            {/* Employee picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Employee
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="">Choose Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} — {emp.designation} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-theme preview for selected employee */}
            {selectedEmpId && (() => {
              const emp = employees.find((e) => e._id === selectedEmpId);
              if (!emp) return null;
              const t = getDesignationTheme(emp.designation);
              return (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold"
                  style={{
                    background: t.badgeBg,
                    borderColor: t.badgeBorder,
                    color: t.badgeText,
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 shadow-md"
                    style={{ background: t.dot }}
                  />
                  <div>
                    <p style={{ color: t.badgeText }}>Theme: <strong>{t.label}</strong></p>
                    <p className="text-[10px] mt-0.5 font-normal opacity-75">
                      Auto-assigned from designation: &ldquo;{emp.designation}&rdquo;
                    </p>
                  </div>
                  <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold border" style={{ borderColor: t.badgeBorder, color: t.badgeText }}>AUTO</span>
                </div>
              );
            })()}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCard}
                disabled={isLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                {isLoading ? 'Generating...' : 'Issue Card & Send to Queue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital ID Pass Modal */}
      <DigitalIdCardModal
        isOpen={isDigitalModalOpen}
        onClose={() => {
          setIsDigitalModalOpen(false);
          setDigitalEmployee(null);
        }}
        employee={digitalEmployee}
        idCard={previewCard}
      />

      {/* Version History Modal */}
      {isHistoryModalOpen && historyCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" /> Card Version History ({historyCard.cardId})
              </h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {historyCard.versionHistory?.map((ver, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-indigo-600 dark:text-indigo-400">Version v{ver.version}</span>
                    <span className="text-slate-400">{new Date(ver.issuedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">Template: {ver.template}</p>
                  <p className="text-slate-400 italic">Reason: {ver.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdCardManagementPage;
