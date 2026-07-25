import React, { useState } from 'react';
import { Sliders, ShieldCheck, Mail, Lock, Database, Building, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Enterprise Access Security Portal',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300',
    supportEmail: 'security-admin@enterprise.com',
    passwordMinLength: 8,
    requireSpecialChar: true,
    accountLockoutAttempts: 5,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    sessionTimeoutMins: 60,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('System Governance & Security Preferences saved!');
    }, 600);
  };

  const handleBackup = () => {
    toast.success('Database backup initiated! Snapshot saved to system archive.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-7 h-7 text-emerald-600" />
            System Preferences & Security Governance Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure Company Profile, Email Server, Password Policies, & Database Snapshots.
          </p>
        </div>

        <button
          onClick={handleBackup}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <Database className="w-4 h-4 text-emerald-600" /> Trigger System Backup
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Profile Settings */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-emerald-600" /> Corporate Branding & Identity
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Logo URL</label>
            <input
              type="url"
              value={settings.companyLogo}
              onChange={(e) => setSettings({ ...settings, companyLogo: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Security Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Security & Password Policies */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-emerald-600" /> Password & Account Lockout Policies
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Password Length</label>
              <input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lockout Fail Threshold</label>
              <input
                type="number"
                value={settings.accountLockoutAttempts}
                onChange={(e) => setSettings({ ...settings, accountLockoutAttempts: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Inactivity Timeout (Minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeoutMins}
              onChange={(e) => setSettings({ ...settings, sessionTimeoutMins: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Email & SMTP Integration */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mail className="w-4 h-4 text-emerald-600" /> SMTP Server Email Dispatch Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Host Server</label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SMTP Port</label>
              <input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving Settings...' : 'Save All Preferences'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
