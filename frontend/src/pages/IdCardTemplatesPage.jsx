import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const IdCardTemplatesPage = () => {
  const [activeTemplate, setActiveTemplate] = useState('EMERALD_MODERN');

  const templates = [
    {
      id: 'EMERALD_MODERN',
      title: 'Emerald Enterprise (Default)',
      description: 'Modern vibrant teal gradient banner with clean font hierarchy and embedded QR scanner code.',
      accent: 'from-emerald-700 to-teal-900',
      badgeColor: 'bg-emerald-600',
    },
    {
      id: 'NAVY_EXECUTIVE',
      title: 'Executive Navy & Gold',
      description: 'Sophisticated deep blue styling with gold accent borders, designed for executive badges.',
      accent: 'from-blue-900 via-indigo-950 to-slate-900',
      badgeColor: 'bg-blue-600',
    },
    {
      id: 'SLATE_MINIMAL',
      title: 'Minimalist Dark Slate',
      description: 'High-contrast monochrome dark theme optimized for high-security industrial clearance.',
      accent: 'from-slate-900 to-slate-800',
      badgeColor: 'bg-slate-700',
    },
    {
      id: 'GOLD_SECURITY',
      title: 'Gold Hologram Security',
      description: 'High-tier security card template featuring double QR verification and security hologram watermark.',
      accent: 'from-amber-700 to-slate-900',
      badgeColor: 'bg-amber-600',
    },
  ];

  const handleSelectTemplate = (id) => {
    setActiveTemplate(id);
    toast.success(`Active ID Card Template updated to: ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-emerald-600" />
          ID Card Template Catalog & Design Selector
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select & Customize Corporate Branding, Layout Schemes, Barcode Placement, & Hologram Watermarks.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => {
          const isSelected = activeTemplate === tpl.id;

          return (
            <div
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl.id)}
              className={`cursor-pointer rounded-2xl border-2 transition-all p-5 space-y-4 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {tpl.id}
                </span>
                {isSelected && (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ACTIVE TEMPLATE
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{tpl.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{tpl.description}</p>
              </div>

              {/* Template Card Visual Mockup */}
              <div className={`p-5 rounded-xl bg-gradient-to-r ${tpl.accent} text-white shadow-inner space-y-3`}>
                <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                  <span>ENTERPRISE BADGE</span>
                  <span>ID: EMP-00001</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 font-bold flex items-center justify-center text-white">
                    SK
                  </div>
                  <div>
                    <p className="text-xs font-bold">Saravanan Kumar</p>
                    <p className="text-[10px] opacity-75">Senior Software Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IdCardTemplatesPage;
