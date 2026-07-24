import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, RefreshCw, ShieldCheck, Building2, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { getDesignationTheme, getAllThemes } from '../../utils/designationTheme';

/**
 * IdCardPreview
 *
 * Renders a physical-style, flip-able employee ID card.
 * The card's color theme is automatically derived from the employee's designation.
 * An optional theme override selector lets admins manually switch themes.
 *
 * Props:
 *  - employee    : Employee document (populated)
 *  - idCard      : IdCard document (optional, for cardId/version/status)
 *  - themeKey    : Optional manual theme key override (e.g. 'EXECUTIVE')
 *  - onThemeChange: Callback when admin changes theme manually
 */
export const IdCardPreview = ({ employee, idCard = null, themeKey = null, onThemeChange }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);

  if (!employee) return null;

  // ── Theme Resolution ──────────────────────────────────────────────────────
  // 1. If a manual override key is given, use it
  // 2. Otherwise auto-detect from designation
  const allThemes = getAllThemes();
  const resolvedTheme = themeKey
    ? (allThemes.find((t) => t.key === themeKey)?.theme || getDesignationTheme(employee.designation))
    : getDesignationTheme(employee.designation);

  const theme = resolvedTheme;

  // ── Card metadata ─────────────────────────────────────────────────────────
  const cardId      = idCard?.cardId || `IDC-${employee.employeeId}`;
  const barcodeVal  = idCard?.barcodeValue || `*${employee.employeeId}*`;
  const qrData      = idCard?.qrCodeData || JSON.stringify({ cardId, empId: employee.employeeId, name: `${employee.firstName} ${employee.lastName}`, designation: employee.designation });
  const issueDate   = idCard?.issueDate ? new Date(idCard.issueDate).toLocaleDateString() : new Date().toLocaleDateString();

  // ── High-res PNG download ─────────────────────────────────────────────────
  const handleDownloadPNG = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const image = canvas.toDataURL('image/png');
      const link  = document.createElement('a');
      link.href     = image;
      link.download = `${employee.employeeId}_ID_${isFlipped ? 'Back' : 'Front'}.png`;
      link.click();
      toast.success('ID Card PNG downloaded!');
    } catch {
      toast.error('Failed to export ID Card image.');
    }
  };

  // ── Detected theme label (for display) ───────────────────────────────────
  const autoLabel = getDesignationTheme(employee.designation).label;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* ── Controls Bar ──────────────────────────────────────────────────── */}
      <div className="w-full max-w-sm space-y-2.5">
        {/* Theme indicator */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Palette className="w-3.5 h-3.5" />
            <span>
              Theme:{' '}
              <span className="font-bold" style={{ color: theme.dot }}>
                {theme.label}
              </span>
            </span>
            {!themeKey && (
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                AUTO
              </span>
            )}
          </div>
          {/* Manual override dropdown */}
          {onThemeChange && (
            <select
              value={themeKey || ''}
              onChange={(e) => onThemeChange(e.target.value || null)}
              className="text-[10px] px-2 py-1 border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-1 focus:ring-indigo-400 font-medium"
            >
              <option value="">Auto (by designation)</option>
              {allThemes.map(({ key, theme: t }) => (
                <option key={key} value={key}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
            {isFlipped ? 'View Front' : 'View Back'}
          </button>

          <button
            onClick={handleDownloadPNG}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm transition-colors"
            style={{ background: theme.dot }}
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG
          </button>
        </div>
      </div>

      {/* ── 3D Flip Card Container ────────────────────────────────────────── */}
      {/* The outer div sets the perspective; the inner rotates on Y axis     */}
      <div
        style={{ perspective: '1100px', width: '340px', height: '520px' }}
        onClick={() => setIsFlipped((v) => !v)}
        className="cursor-pointer select-none"
        title="Click to flip card"
      >
        <div
          ref={cardRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ── FRONT FACE ── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: '1rem',
              overflow: 'hidden',
              background: theme.bodyBg,
              border: `1.5px solid ${theme.accentBorder}`,
              boxShadow: theme.glow,
              color: theme.cardText,
            }}
          >
            <div className="h-full flex flex-col justify-between p-5 relative z-10">
            {/* Header band */}
            <div>
              <div
                className="flex items-center justify-between p-3 border-b"
                style={{
                  background: theme.headerBg,
                  borderColor: theme.accentBorder,
                }}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" style={{ color: theme.headerText }} />
                  <div>
                    <h3
                      className="text-xs font-black uppercase tracking-wider"
                      style={{ color: theme.headerText }}
                    >
                      ENTERPRISE GLOBAL
                    </h3>
                    <p className="text-[9px] uppercase tracking-widest font-mono" style={{ color: theme.subText }}>
                      SECURITY IDENTIFICATION PASS
                    </p>
                  </div>
                </div>
                <ShieldCheck className="w-6 h-6" style={{ color: '#34d399', opacity: 0.85 }} />
              </div>

              {/* Photo & identity */}
              <div className="mt-6 flex flex-col items-center">
                <div
                  className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-xl"
                  style={{
                    border: `2.5px solid ${theme.accentBorder}`,
                    background: '#1e293b',
                    boxShadow: `0 0 0 4px ${theme.badgeBg}, 0 8px 24px rgba(0,0,0,0.5)`,
                  }}
                >
                  {employee.avatarUrl ? (
                    <img src={employee.avatarUrl} alt={employee.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-3xl font-black"
                      style={{ color: theme.headerText }}
                    >
                      {employee.firstName?.[0]}
                      {employee.lastName?.[0]}
                    </div>
                  )}
                </div>

                {/* Name, designation, ID */}
                <div className="text-center mt-4">
                  <h2 className="text-lg font-black tracking-tight" style={{ color: theme.cardText }}>
                    {employee.firstName} {employee.lastName}
                  </h2>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: theme.headerText }}>
                    {employee.designation}
                  </p>
                  {/* Department */}
                  {employee.department?.name && (
                    <p className="text-[10px] mt-0.5 font-medium" style={{ color: theme.subText }}>
                      {employee.department.name}
                    </p>
                  )}
                  {/* Employee ID chip */}
                  <span
                    className="inline-block mt-2 px-3 py-0.5 text-[10px] font-mono font-bold rounded-full border"
                    style={{
                      background: theme.badgeBg,
                      color: theme.badgeText,
                      borderColor: theme.badgeBorder,
                    }}
                  >
                    {employee.employeeId}
                  </span>
                </div>
              </div>
            </div>

            {/* Details block */}
            <div
              className="space-y-2 py-3 border-t border-b text-xs"
              style={{ borderColor: theme.divider }}
            >
              <div className="flex justify-between">
                <span style={{ color: theme.subText }} className="font-medium">Branch:</span>
                <span className="font-bold" style={{ color: theme.cardText }}>
                  {employee.branch?.name || 'HQ Branch'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.subText }} className="font-medium">Department:</span>
                <span className="font-bold" style={{ color: theme.cardText }}>
                  {employee.department?.name || '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.subText }} className="font-medium">Issued:</span>
                <span className="font-mono" style={{ color: theme.cardText }}>
                  {issueDate}
                </span>
              </div>
            </div>

            {/* Barcode area */}
            <div className="flex flex-col items-center justify-center pt-1">
              <div
                className="font-mono text-xl tracking-[0.25em] font-black select-none"
                style={{ color: theme.cardText, opacity: 0.9 }}
              >
                {barcodeVal}
              </div>
              <p className="text-[9px] font-mono tracking-widest uppercase mt-0.5" style={{ color: theme.subText }}>
                PROPERTY OF ENTERPRISE CORP • IF FOUND RETURN TO HR
              </p>
            </div>
          </div>
          </div>

          {/* ── BACK FACE ── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: '1rem',
              overflow: 'hidden',
              background: theme.bodyBg,
              border: `1.5px solid ${theme.accentBorder}`,
              boxShadow: theme.glow,
              color: theme.cardText,
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="h-full flex flex-col justify-between p-5 relative z-10">
            {/* Magnetic stripe simulator */}
            <div
              className="-mx-5 -mt-5 h-12 border-b flex items-center justify-end px-4"
              style={{ background: theme.stripBg, borderColor: theme.divider }}
            >
              <div
                className="w-12 h-6 rounded flex items-center justify-center text-[9px] font-mono border"
                style={{ background: theme.chipColor, borderColor: theme.accentBorder, color: theme.chipText }}
              >
                CHIP 2.0
              </div>
            </div>

            {/* QR Code verification */}
            <div className="my-auto flex flex-col items-center text-center space-y-3">
              {/* Theme colour stripe accent */}
              <div
                className="w-16 h-1 rounded-full mx-auto"
                style={{ background: theme.headerText, opacity: 0.7 }}
              />
              <div className="p-3 bg-white rounded-xl shadow-xl">
                <QRCodeSVG value={qrData} size={110} level="H" />
              </div>
              <p className="text-[10px] font-mono" style={{ color: theme.subText }}>
                SCAN QR CODE FOR DIGITAL SECURITY VALIDATION
              </p>

              {/* Card metadata */}
              <div
                className="p-2.5 rounded-lg w-full text-[11px] font-mono text-left space-y-1 border"
                style={{
                  background: `${theme.stripBg}cc`,
                  borderColor: theme.divider,
                  color: theme.subText,
                }}
              >
                <p>
                  Card Reg ID:{' '}
                  <span className="font-bold" style={{ color: theme.headerText }}>
                    {cardId}
                  </span>
                </p>
                <p>
                  Card Version: <span className="font-bold" style={{ color: theme.cardText }}>v{idCard?.version || 1}</span>
                </p>
                <p>
                  Status:{' '}
                  <span className="font-bold" style={{ color: '#34d399' }}>
                    {idCard?.status || 'ACTIVE'}
                  </span>
                </p>
                <p>
                  Theme:{' '}
                  <span className="font-bold" style={{ color: theme.dot }}>
                    {theme.label}
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="text-[9px] text-center leading-relaxed border-t pt-3"
              style={{ color: theme.subText, borderColor: theme.divider }}
            >
              This card is the property of Enterprise Systems. Unauthorized use or forgery is strictly
              prohibited under federal security compliance codes.
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Flip hint */}
      <p className="text-[10px] text-slate-400 text-center">
        🔄 Click the card to flip • or use the button above
      </p>

      {/* Theme auto-detection notice */}
      <p className="text-[10px] text-slate-400 text-center max-w-xs">
        🎨 Card theme auto-assigned from designation:{' '}
        <span className="font-semibold" style={{ color: theme.dot }}>
          &quot;{employee.designation}&quot;
        </span>{' '}
        → <span className="font-semibold">{autoLabel}</span>
      </p>
    </div>
  );
};

export default IdCardPreview;
