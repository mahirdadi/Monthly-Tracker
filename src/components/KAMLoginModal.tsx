import React, { useState } from 'react';
import { KAMUser } from '../types';

interface KAMLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKam: KAMUser;
  kamRoster: KAMUser[];
  onSelectKam: (kam: KAMUser) => void;
  onAddNewKam?: (kam: KAMUser) => void;
  onOpenGoogleSheetSync: () => void;
}

export const KAMLoginModal: React.FC<KAMLoginModalProps> = ({
  isOpen,
  onClose,
  currentKam,
  kamRoster,
  onSelectKam,
  onAddNewKam,
  onOpenGoogleSheetSync,
}) => {
  const [mode, setMode] = useState<'roster' | 'custom'>('roster');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRegion, setCustomRegion] = useState('Delhi NCR & North Hub');
  const [customRole, setCustomRole] = useState<'Senior Strategic KAM' | 'Regional Enterprise KAM' | 'Enterprise QSR KAM'>(
    'Senior Strategic KAM'
  );

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customName.trim()) return;

    // Check if email already matches an existing KAM
    const existing = kamRoster.find(
      (k) => k.email.toLowerCase() === customEmail.trim().toLowerCase()
    );

    if (existing) {
      onSelectKam(existing);
      onClose();
      return;
    }

    // Create new KAM profile
    const newKam: KAMUser = {
      id: `KAM-0${kamRoster.length + 1}`,
      name: customName.trim(),
      email: customEmail.trim(),
      role: customRole,
      region: customRegion,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256`,
      isAdmin: false,
      assignedChains: ['Direct Sheet Mapped'],
      assignedRestaurantCount: 450,
    };

    if (onAddNewKam) {
      onAddNewKam(newKam);
    }
    onSelectKam(newKam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-500/10 via-blue-500/5 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E23744] text-white flex items-center justify-center font-black shadow-xs">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0b1c30]">KAM Login & Account Switcher</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#E23744]">
                  Zomato KAM Portal
                </span>
              </div>
              <p className="text-xs text-[#737686]">
                Each Key Account Manager sees only restaurants mapped to their portfolio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-5 pt-3">
          <button
            onClick={() => setMode('roster')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
              mode === 'roster'
                ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Select from Team KAM Roster ({kamRoster.length})
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
              mode === 'custom'
                ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Login with Corporate Email
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[60vh]">
          {mode === 'roster' ? (
            <div className="space-y-2.5">
              <p className="text-[11px] text-slate-500 font-medium">
                Click any Key Account Manager below to switch views. The entire dashboard, metrics, and restaurant directories will immediately filter to their mapped portfolio:
              </p>

              <div className="space-y-2">
                {kamRoster.map((kam) => {
                  const isCurrent = currentKam.id === kam.id;
                  return (
                    <div
                      key={kam.id}
                      onClick={() => {
                        onSelectKam(kam);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-[#2563eb] bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={kam.avatarUrl}
                            alt={kam.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-2xs"
                          />
                          {isCurrent && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{kam.name}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                kam.isAdmin
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-[#2563eb]'
                              }`}
                            >
                              {kam.isAdmin ? 'Admin (Fleet)' : kam.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">{kam.email}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            <span className="font-semibold text-emerald-700">
                              {kam.isAdmin ? '10,482 Outlets (Full Fleet)' : `${kam.assignedRestaurantCount} Mapped Outlets`}
                            </span>
                            {' · '}
                            <span className="text-slate-500">{kam.region}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2563eb] bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                            <span className="material-symbols-outlined text-[14px]">check</span>
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="text-xs font-semibold text-slate-600 group-hover:text-[#2563eb] bg-slate-100 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corporate Email (@zomato.com or partner)
                </label>
                <div className="flex items-center gap-2 bg-[#eff4ff] border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#2563eb] focus-within:bg-white transition-all">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">mail</span>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. mahir.dadi@zomato.com"
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="flex items-center gap-2 bg-[#eff4ff] border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#2563eb] focus-within:bg-white transition-all">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Mahir Dadi"
                    className="w-full bg-transparent border-none outline-none text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as any)}
                    className="w-full bg-[#eff4ff] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#2563eb]"
                  >
                    <option value="Senior Strategic KAM">Senior Strategic KAM</option>
                    <option value="Regional Enterprise KAM">Regional Enterprise KAM</option>
                    <option value="Enterprise QSR KAM">Enterprise QSR KAM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Region</label>
                  <select
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    className="w-full bg-[#eff4ff] border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#2563eb]"
                  >
                    <option value="Delhi NCR & North Hub">Delhi NCR & North Hub</option>
                    <option value="South Metros (BLR, HYD, MAA)">South Metros (BLR, HYD, MAA)</option>
                    <option value="West Region (Mumbai & Pune)">West Region (Mumbai & Pune)</option>
                    <option value="Central & East Metros">Central & East Metros</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#2563eb] hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Authenticate & Load Mapped Portfolio</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onClose();
              onOpenGoogleSheetSync();
            }}
            className="text-[#2563eb] hover:underline flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">table_chart</span>
            <span>Link Google Sheet to update KAM-restaurant mappings</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
