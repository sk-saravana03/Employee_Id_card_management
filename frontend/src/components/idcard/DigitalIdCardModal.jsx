import React from 'react';
import { X, Smartphone, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import IdCardPreview from './IdCardPreview';

export const DigitalIdCardModal = ({ isOpen, onClose, employee, idCard }) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col items-center">
        {/* Mobile Mockup Header */}
        <div className="w-full bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Smartphone className="w-4 h-4 text-indigo-400" /> Digital Wallet Pass
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Pass Status Badge */}
        <div className="my-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Live Mobile Security Pass Active
        </div>

        {/* Card Component */}
        <div className="p-2 w-full flex justify-center">
          <IdCardPreview employee={employee} idCard={idCard} template={idCard?.template || 'EXECUTIVE_CORPORATE'} />
        </div>

        {/* Footer */}
        <div className="w-full p-4 bg-slate-950/60 border-t border-slate-800 text-center text-xs text-slate-400">
          Scan at Gate Scanner or Access NFC Terminal
        </div>
      </div>
    </div>
  );
};

export default DigitalIdCardModal;
