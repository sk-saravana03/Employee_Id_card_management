import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldAlert, UserCheck, Calendar, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export const VisitorPassPreview = ({ isOpen, onClose, visitor }) => {
  const passRef = useRef(null);

  if (!isOpen || !visitor) return null;

  const handlePrint = async () => {
    if (!passRef.current) return;
    try {
      const canvas = await html2canvas(passRef.current, { scale: 3, useCORS: true });
      const image = canvas.toDataURL('image/png');
      const win = window.open('');
      win.document.write(`<img src="${image}" style="width:100%; max-width:400px; display:block; margin:20px auto;" onload="window.print();window.close();"/>`);
      win.document.close();
    } catch (err) {
      toast.error('Print preview generation failed.');
    }
  };

  const qrData = visitor.qrCodeData || JSON.stringify({ passNumber: visitor.passNumber, visitor: visitor.fullName });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Header */}
        <div className="w-full px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-500" /> Temporary Visitor Badge
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pass Render Canvas */}
        <div className="p-6">
          <div
            ref={passRef}
            className="w-[320px] bg-slate-900 text-white rounded-2xl p-5 border-2 border-emerald-500/40 shadow-2xl flex flex-col justify-between space-y-4"
          >
            {/* Header Badge Strip */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-center uppercase tracking-widest text-[11px] font-black text-white shadow-md">
              VISITOR PASS • OFFICIAL ENTRY
            </div>

            {/* Visitor Details */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight">{visitor.fullName}</h2>
              <p className="text-xs font-semibold text-emerald-400">{visitor.company || 'Visitor'}</p>
              <div className="mt-2 inline-block px-3 py-0.5 text-xs font-mono font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {visitor.passNumber}
              </div>
            </div>

            {/* Host & Purpose Table */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">Visiting Host:</span>
                <span className="font-bold text-slate-100">
                  {visitor.employeeToVisit?.firstName} {visitor.employeeToVisit?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Purpose:</span>
                <span className="font-semibold text-indigo-400">{visitor.purpose}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Valid Until:</span>
                <span className="font-mono text-amber-400">
                  {new Date(visitor.expiryTime).toLocaleString()}
                </span>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center pt-1">
              <div className="p-2.5 bg-white rounded-xl shadow-lg">
                <QRCodeSVG value={qrData} size={100} level="M" />
              </div>
              <div className="mt-2 font-mono text-base font-black tracking-widest text-slate-300">
                {visitor.barcodeValue || `*${visitor.passNumber}*`}
              </div>
            </div>

            <p className="text-[9px] font-mono text-center text-slate-500 uppercase tracking-wider">
              ALWAYS WEAR VISITOR BADGE VISIBLY ON CORPORATE PREMISES
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="w-full px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Visitor Pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitorPassPreview;
