import React from 'react';

export const MarketingView: React.FC = () => {
  return (
    <div className="flex flex-col w-full pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Ether</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Acquisition</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563eb]">Marketing Analytics</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#0b1c30] tracking-tight">Marketing Velocity & Inbound Pipeline</h1>
          <p className="text-[14px] text-[#434655] mt-0.5">
            Enterprise procurement channels, pipeline conversion ratios, and Tier-1 contract acquisition costs.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[12px] text-[#737686] font-semibold uppercase tracking-wider">Enterprise MQLs</span>
          <p className="text-[28px] font-bold text-[#0b1c30] mt-1 tabular-nums">142 Leads</p>
          <span className="text-[11px] text-[#006c49] font-medium">+28.4% Surge in May</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[12px] text-[#737686] font-semibold uppercase tracking-wider">Pipeline Value</span>
          <p className="text-[28px] font-bold text-[#0b1c30] mt-1 tabular-nums">₹1.48 Cr</p>
          <span className="text-[11px] text-[#2563eb] font-medium">Q3 Enterprise Forecast</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[12px] text-[#737686] font-semibold uppercase tracking-wider">Blended CAC</span>
          <p className="text-[28px] font-bold text-[#0b1c30] mt-1 tabular-nums">₹14,200</p>
          <span className="text-[11px] text-[#006c49] font-medium">-12% YoY Efficiency</span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[12px] text-[#737686] font-semibold uppercase tracking-wider">RFP Win Rate</span>
          <p className="text-[28px] font-bold text-[#006c49] mt-1 tabular-nums">41.8%</p>
          <span className="text-[11px] text-[#737686]">vs 32.5% Industry Benchmark</span>
        </div>
      </div>

      {/* Acquisition Channels Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs p-6">
          <h3 className="text-base font-semibold text-[#0b1c30] mb-1">Acquisition Channels & Conversion</h3>
          <p className="text-xs text-[#737686] mb-4">Lead attribution across enterprise touchpoints</p>

          <div className="space-y-4">
            {[
              { name: 'Logistics Tech Summits & Expos (B2B)', leads: 64, value: '₹68.4L', share: 45 },
              { name: 'Direct Enterprise Outreach & ABM', leads: 42, value: '₹44.8L', share: 30 },
              { name: 'Partner Referrals (Fleet OEMs)', leads: 24, value: '₹22.6L', share: 18 },
              { name: 'Organic Search & Technical Whitepapers', leads: 12, value: '₹12.2L', share: 7 },
            ].map((ch) => (
              <div key={ch.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#0b1c30]">{ch.name}</span>
                  <span className="font-semibold text-slate-800">{ch.value} ({ch.leads} leads)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
                    style={{ width: `${ch.share}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#0b1c30] mb-1">Q3 Procurement Forecast</h3>
            <p className="text-xs text-[#737686] mb-4">Pipeline stage velocity</p>

            <div className="space-y-3">
              <div className="p-3 bg-[#eff4ff] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-[#0b1c30]">RFP Initial Scoping</div>
                  <div className="text-[11px] text-[#737686]">18 Qualified Organizations</div>
                </div>
                <span className="text-sm font-bold text-[#2563eb]">₹54.0L</span>
              </div>

              <div className="p-3 bg-[#eff4ff] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-[#0b1c30]">Pilot Fleet Deployment</div>
                  <div className="text-[11px] text-[#737686]">9 Enterprise Trials Active</div>
                </div>
                <span className="text-sm font-bold text-[#2563eb]">₹42.5L</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between border border-emerald-100">
                <div>
                  <div className="font-semibold text-xs text-emerald-900">Contract Final Signoff</div>
                  <div className="text-[11px] text-emerald-700">4 Contracts Scheduled for July</div>
                </div>
                <span className="text-sm font-bold text-[#006c49]">₹28.9L</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#737686]">
            <span>Average deal gestation: 42 days</span>
            <span className="text-[#2563eb] font-semibold">Generate Channel Audit →</span>
          </div>
        </div>
      </div>
    </div>
  );
};
