'use client';

import { AlertTriangle, Globe, Save, Shield } from 'lucide-react';
import { useState } from 'react';

export default function GlobalSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'LuxeSaaS Platform',
    allowPublicRegistration: true,
    maintenanceMode: false,
    supportEmail: 'support@luxesaas.com',
    requireEmailVerification: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      alert('Global settings updated successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Configure global behavior and defaults for the entire multi-tenant system.</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Platform Identity */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 font-bold flex items-center gap-3">
            <Globe className="w-5 h-5 text-indigo-600" />
            Identity & Branding
          </div>
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Platform Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* System Policies */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 font-bold flex items-center gap-3">
            <Shield className="w-5 h-5 text-indigo-600" />
            System Policies
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Public Registration</p>
                <p className="text-sm text-slate-500">Allow new users to sign up and create stores automatically.</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, allowPublicRegistration: !settings.allowPublicRegistration })}
                className={`w-14 h-8 rounded-full transition-all relative ${settings.allowPublicRegistration ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.allowPublicRegistration ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Platform Maintenance Mode
                </p>
                <p className="text-sm text-slate-500">When active, all tenants and marketing sites will show a maintenance page.</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`w-14 h-8 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-70"
          >
            {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save className="w-5 h-5" />}
            Save Global Settings
          </button>
        </div>
      </div>
    </div>
  );
}
