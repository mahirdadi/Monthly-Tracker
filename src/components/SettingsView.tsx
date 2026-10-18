import React, { useState } from 'react';
import { GoogleSheetConfig, KAMUser } from '../types';
import { KAM_ROSTER } from '../data/mockData';

interface SettingsViewProps {
  onOpenGoogleSheetSync?: () => void;
  googleSheetConfig?: GoogleSheetConfig;
  currentKam?: KAMUser;
  onSwitchKam?: (kam: KAMUser) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenGoogleSheetSync,
  googleSheetConfig,
  currentKam = KAM_ROSTER[0],
  onSwitchKam,
}) => {
  const [currency, setCurrency] = useState('inr_lakhs');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [autoSync, setAutoSync] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Ether</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Platform</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563eb]">Settings</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#0b1c30] tracking-tight">System & Cluster Configuration</h1>
          <p className="text-[14px] text-[#434655] mt-0.5">
            Configure Google Sheet integrations, KAM portfolio mapping, and Ether Cloud 2.4 operational clusters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-blue-700 transition-all self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          <span>Save Preferences</span>
        </button>
      </div>

      {savedAlert && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>Configuration preferences updated successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Google Sheet Live Data Integration */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#0b1c30] flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">table_chart</span>
                  <span>Google Sheet Live Sync & KAM Mapping</span>
                </h3>
                <p className="text-xs text-[#737686] mt-0.5">
                  Update restaurant records, preparation SLAs, and KAM assignments via Google Sheets.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Connected
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Connected Document:</span>
                <span className="font-mono text-slate-800 truncate max-w-xs">
                  {googleSheetConfig?.sheetUrl || 'https://docs.google.com/spreadsheets/d/1ZOMATO_KAM...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Active Tab Name:</span>
                <span className="font-semibold text-slate-800">
                  {googleSheetConfig?.sheetName || 'KAM_Restaurant_Mapping'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Synced Rows:</span>
                <span className="font-semibold text-emerald-700">10,482 Restaurant Outlets</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Last Successful Sync:</span>
                <span className="font-mono text-slate-700">{googleSheetConfig?.lastSyncTime || '14:02 IST'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#737686]">
                Syncs every {googleSheetConfig?.autoSyncMinutes || 5} minutes automatically.
              </span>
              <button
                onClick={onOpenGoogleSheetSync}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Configure & Sync Sheet</span>
              </button>
            </div>
          </div>

          {/* Active KAM Profile & Role Switching */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-[#0b1c30]">Key Account Manager (KAM) Profile</h3>

            <div className="p-4 bg-[#eff4ff] rounded-xl border border-blue-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  alt={currentKam.name}
                  src={currentKam.avatarUrl}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#0b1c30]">{currentKam.name}</span>
                    <span className="text-[10px] bg-blue-100 text-[#2563eb] font-bold px-1.5 py-0.2 rounded">
                      {currentKam.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#737686] font-mono">{currentKam.email}</p>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    {currentKam.assignedRestaurantCount} Restaurants Mapped · {currentKam.region}
                  </p>
                </div>
              </div>

              {onSwitchKam && (
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block mb-1">Switch Account:</span>
                  <select
                    value={currentKam.id}
                    onChange={(e) => {
                      const match = KAM_ROSTER.find((k) => k.id === e.target.value);
                      if (match) onSwitchKam(match);
                    }}
                    className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1 text-slate-800 outline-none focus:border-[#2563eb]"
                  >
                    {KAM_ROSTER.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* General Localization */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-[#0b1c30]">Localization & Numerics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Currency & Denomination Format
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-[#2563eb]"
                >
                  <option value="inr_lakhs">Indian Rupee (₹ Lakhs & Crores)</option>
                  <option value="inr_standard">Indian Rupee (₹ Full Standard)</option>
                  <option value="usd">US Dollar ($ Thousands / Millions)</option>
                </select>
                <span className="text-[11px] text-[#737686] mt-1 block">
                  Controls charts and metric tile display units.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Timezone & Timestamp Clock
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full bg-[#eff4ff] border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-[#2563eb]"
                >
                  <option value="Asia/Kolkata">IST (UTC +05:30) — Mumbai / New Delhi</option>
                  <option value="Asia/Dubai">GST (UTC +04:00) — Dubai</option>
                  <option value="UTC">UTC (Universal Time)</option>
                </select>
                <span className="text-[11px] text-[#737686] mt-1 block">
                  Applied to live sync tickers and transaction audit trails.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cluster Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#0b1c30]">Cluster Health</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[#006c49] text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]"></span>
                Healthy
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cluster Engine:</span>
                <span className="font-semibold text-slate-900">Ether Cloud 2.4.1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Region:</span>
                <span className="font-mono text-slate-900">ap-south-1 (Mumbai)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Google Sheet Pipeline:</span>
                <span className="font-mono text-emerald-600 font-semibold">10,482 Active Rows</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cluster Latency:</span>
                <span className="font-mono text-emerald-600 font-semibold">14ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">30-Day SLA Uptime:</span>
                <span className="font-mono text-slate-900 font-semibold">99.98%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Security Invariant:</span>
                <span className="font-medium text-blue-600">TLS 1.3 / mTLS Active</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert('Diagnostic telemetry ping sent to Mumbai edge nodes & Google Sheet pipeline. Status: 0 packet loss.')}
                className="w-full py-2 bg-[#eff4ff] hover:bg-blue-100 text-[#2563eb] rounded-lg text-xs font-semibold transition-colors"
              >
                Run Health Diagnostics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
