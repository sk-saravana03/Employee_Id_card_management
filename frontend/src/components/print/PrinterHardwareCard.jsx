import React from 'react';
import { Printer, Pause, Play, Wrench, Cpu, AlertTriangle } from 'lucide-react';

export const PrinterHardwareCard = ({ printer, onTogglePause, isLoading = false }) => {
  if (!printer) return null;

  const getRibbonColor = (level) => {
    if (level < 20) return 'bg-rose-500';
    if (level < 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {printer.printerName}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {printer.modelNumber} • {printer.ipAddress}
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
            printer.status === 'ONLINE'
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : printer.status === 'PAUSED'
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
          }`}
        >
          {printer.status}
        </span>
      </div>

      {/* Ribbon & Card Stock Meter */}
      <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
        {/* Ribbon % Meter */}
        <div>
          <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <span>Color Ribbon</span>
            <span className="font-mono">{printer.ribbonLevelPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full ${getRibbonColor(printer.ribbonLevelPercent)} transition-all duration-500`}
              style={{ width: `${printer.ribbonLevelPercent}%` }}
            />
          </div>
        </div>

        {/* Card Stock Meter */}
        <div>
          <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <span>Blank Stock</span>
            <span className="font-mono">{printer.cardStockRemaining} Cards</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (printer.cardStockRemaining / 300) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Telemetry Stats & Action Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <p>Total Printed: <strong className="text-slate-800 dark:text-slate-200">{printer.totalCardsPrinted}</strong></p>
        </div>

        <button
          onClick={() => onTogglePause(printer._id)}
          disabled={isLoading}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm ${
            printer.isPaused
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          {printer.isPaused ? (
            <>
              <Play className="w-3.5 h-3.5" /> Resume Printer
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause Queue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PrinterHardwareCard;
