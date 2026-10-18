import React, { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
  const [includeProjections, setIncludeProjections] = useState(true);
  const [timeRange, setTimeRange] = useState('Jan 2026 - Dec 2026');
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Export Performance Report</h3>
              <p className="text-[11px] text-slate-500">Ether Executive Financial & Ops Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'csv', label: 'CSV Ledger', icon: 'table_view' },
                { id: 'pdf', label: 'PDF Summary', icon: 'picture_as_pdf' },
                { id: 'xlsx', label: 'Excel (XLSX)', icon: 'grid_on' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormat(fmt.id as any)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    format === fmt.id
                      ? 'border-[#2563eb] bg-blue-50 text-[#2563eb] font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{fmt.icon}</span>
                  <span className="text-[11px]">{fmt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Time Horizon</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 text-xs outline-none focus:border-[#2563eb]"
            >
              <option>Jan 2026 - Dec 2026 (Full Fiscal Year)</option>
              <option>Jan 2026 - Jun 2026 (YTD Certified)</option>
              <option>Q1 2026 (Jan - Mar)</option>
              <option>Q2 2026 (Apr - Jun Surge)</option>
              <option>Historical FY 2025 Audit Baseline</option>
            </select>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeProjections}
                onChange={(e) => setIncludeProjections(e.target.checked)}
                className="w-4 h-4 text-[#2563eb] rounded border-slate-300 focus:ring-0"
              />
              <span className="text-slate-600">
                Include comparative FY 2025 deltas and Q3 trajectory targets
              </span>
            </label>
          </div>

          {success && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-[11px] font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
              <span>Report generated successfully! Download initialized.</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {downloading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Generate & Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
