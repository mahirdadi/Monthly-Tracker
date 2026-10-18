import React, { useState } from 'react';
import { ENTERPRISE_CUSTOMERS } from '../data/mockData';
import { EnterpriseCustomer } from '../types';

interface CustomersViewProps {
  onSelectCustomer?: (customer: EnterpriseCustomer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = () => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<EnterpriseCustomer | null>(null);

  const filtered = ENTERPRISE_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase()) ||
    c.primaryContact.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Ether</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Accounts</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563eb]">Tier-1 Customers</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#0b1c30] tracking-tight">Enterprise Client Portfolio</h1>
          <p className="text-[14px] text-[#434655] mt-0.5">
            48 Tier-1 strategic corporate partners across automotive logistics, cold-chain, and cloud infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#eff4ff] border border-[#c3c6d7]/60 rounded-lg px-3 py-1.5 w-64">
            <span className="material-symbols-outlined text-[18px] text-[#737686]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enterprise accounts..."
              className="w-full bg-transparent border-none outline-none text-xs text-[#0b1c30] placeholder-[#737686]"
            />
          </div>
        </div>
      </div>

      {/* Grid of Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCustomer(c)}
            className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${c.badgeBg} ${c.badgeText}`}
                  >
                    {c.initials}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#0b1c30] leading-snug">{c.name}</h3>
                    <p className="text-[12px] text-[#737686]">{c.location}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2563eb]">
                  {c.tier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 my-2 border-y border-slate-100">
                <div>
                  <span className="text-[11px] text-[#737686] uppercase font-semibold">Annual Run-Rate</span>
                  <p className="text-lg font-bold text-[#0b1c30] tabular-nums">{c.annualRunRate}</p>
                </div>
                <div>
                  <span className="text-[11px] text-[#737686] uppercase font-semibold">Health Score</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-lg font-bold text-[#006c49] tabular-nums">{c.healthScore}%</span>
                    <span className="text-[11px] text-[#006c49] font-medium">Optimal</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-[#737686]">Contact:</span>
                  <span className="font-medium text-slate-900">{c.primaryContact.name}</span>
                  <span className="text-slate-400">({c.primaryContact.role})</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.activeCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded bg-slate-100 text-[#434655] text-[10px] font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{c.totalOrders} Completed Orders</span>
              <span className="text-[#2563eb] font-semibold hover:underline">View Ledger →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail Drawer/Modal if selected */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${selectedCustomer.badgeBg} ${selectedCustomer.badgeText}`}
                >
                  {selectedCustomer.initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCustomer.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tier Classification:</span>
                  <span className="font-semibold text-blue-700">{selectedCustomer.tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contract Run-Rate (ARR):</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.annualRunRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Health:</span>
                  <span className="font-semibold text-emerald-700">{selectedCustomer.healthScore}% (High Trust)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Executive Liaison:</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.primaryContact.name} ({selectedCustomer.primaryContact.email})</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Contract Terms & Node Integrations
                </h4>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Dedicated high-bandwidth edge telemetry link connected to Ether Cloud 2.4 (ap-south-mumbai). Sub-24 hour fulfillment SLA guarantee active.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
