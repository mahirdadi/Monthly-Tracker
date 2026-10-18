import React, { useState, useMemo } from 'react';
import { Restaurant, KAMUser } from '../types';
import { FEATURED_RESTAURANTS, findOrCreateRestaurant, getRestaurantsForKam, KAM_ROSTER } from '../data/mockData';

interface RestaurantsViewProps {
  onSelectAndNavigate: (restaurant: Restaurant) => void;
  currentKam: KAMUser;
  onOpenGoogleSheetSync: () => void;
  onSwitchKam: (kam: KAMUser) => void;
  restaurants?: Restaurant[];
  onOpenKAMLogin?: () => void;
}

export const RestaurantsView: React.FC<RestaurantsViewProps> = ({
  onSelectAndNavigate,
  currentKam,
  onOpenGoogleSheetSync,
  onSwitchKam,
  restaurants,
  onOpenKAMLogin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedKamFilter, setSelectedKamFilter] = useState<string>(currentKam.isAdmin ? 'All' : currentKam.id);
  const [inspectModalRestaurant, setInspectModalRestaurant] = useState<Restaurant | null>(null);

  const cities = ['All', 'Gurugram', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai'];
  const statuses = ['All', 'Operational', 'Peak Surge', 'Optimal'];

  // Base pool filtered by current KAM unless admin
  const basePool = useMemo(() => {
    const pool = restaurants && restaurants.length > 0 ? restaurants : FEATURED_RESTAURANTS;
    if (currentKam.isAdmin && selectedKamFilter !== 'All') {
      return pool.filter((r) => r.kamId === selectedKamFilter);
    }
    return getRestaurantsForKam(currentKam, pool);
  }, [currentKam, selectedKamFilter, restaurants]);

  const filtered = useMemo(() => {
    let list = basePool;

    if (selectedCity !== 'All') {
      list = list.filter((r) => r.city === selectedCity);
    }
    if (selectedStatus !== 'All') {
      list = list.filter((r) => r.status === selectedStatus);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const direct = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.chain.toLowerCase().includes(q) ||
          r.zone.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.kamName.toLowerCase().includes(q) ||
          r.kamEmail.toLowerCase().includes(q)
      );

      if (direct.length === 0) {
        const dynamicRes = findOrCreateRestaurant(searchTerm, currentKam);
        if (dynamicRes) return [dynamicRes];
      }
      return direct;
    }

    return list;
  }, [basePool, searchTerm, selectedCity, selectedStatus, currentKam]);

  return (
    <div className="flex flex-col w-full pb-8">
      {/* KAM Mapping Info Banner */}
      <div className="mb-5 p-4 bg-gradient-to-r from-blue-50/90 via-emerald-50/50 to-white rounded-xl border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#0b1c30]">KAM Portfolio: {currentKam.name}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-[#2563eb]">
                {currentKam.role}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {currentKam.assignedRestaurantCount} Restaurants Mapped
              </span>
            </div>
            <p className="text-xs text-[#434655] mt-0.5">
              Region: <strong>{currentKam.region}</strong> · Direct Zomato Key Account Coverage ·{' '}
              <span className="text-emerald-700 font-medium">Google Sheet Synchronized</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGoogleSheetSync}
            className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-700">table_chart</span>
            <span>Update via Google Sheet</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Ether</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Kitchens</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563eb]">
              {currentKam.name} Fleet
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[30px] font-bold text-[#0b1c30] tracking-tight">
              {currentKam.isAdmin ? 'All India Restaurant Directory' : `${currentKam.name}'s Mapped Outlets`}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#2563eb] text-xs font-bold font-mono">
              {filtered.length} Displayed
            </span>
          </div>
          <p className="text-[14px] text-[#434655] mt-0.5">
            Real-time outlet performance, kitchen sensor telemetry, and restaurant-level sales velocity mapped to you.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006c49] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div>
              <div className="text-[11px] text-[#737686] uppercase font-semibold">Assigned Fleet Health</div>
              <div className="text-sm font-bold text-[#006c49]">99.4% SLA Compliance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#eff4ff] border border-[#c3c6d7]/60 rounded-lg px-3 py-1.5 w-full md:w-96">
          <span className="material-symbols-outlined text-[18px] text-[#737686]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Restaurant ID (e.g. REST-10492), chain, city..."
            className="w-full bg-transparent border-none outline-none text-xs text-[#0b1c30] placeholder-[#737686]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-700 text-xs px-1">
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin KAM Filter */}
          {currentKam.isAdmin && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#737686] font-medium">KAM Assignment:</span>
              <select
                value={selectedKamFilter}
                onChange={(e) => setSelectedKamFilter(e.target.value)}
                className="bg-[#eff4ff] border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:border-[#2563eb]"
              >
                <option value="All">All KAMs (10,482 Fleet)</option>
                {KAM_ROSTER.filter((k) => !k.isAdmin).map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({k.assignedRestaurantCount})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#737686] font-medium">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-[#eff4ff] border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:border-[#2563eb]"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#737686] font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#eff4ff] border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:border-[#2563eb]"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table of Restaurants */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/80 text-[#737686] text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200/50">
                <th className="py-3 px-4">Restaurant ID</th>
                <th className="py-3 px-4">Restaurant & Chain</th>
                <th className="py-3 px-4">Zone & Metro</th>
                <th className="py-3 px-4">Assigned KAM</th>
                <th className="py-3 px-4 text-center">YTD Orders</th>
                <th className="py-3 px-4 text-right">Net Revenue (NOV)</th>
                <th className="py-3 px-4 text-right">AOV</th>
                <th className="py-3 px-4 text-center">KPT Prep</th>
                <th className="py-3 px-4 text-center">Cancel %</th>
                <th className="py-3 px-4 text-center">Discount %</th>
                <th className="py-3 px-4 text-center">SLA Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0b1c30] text-[13px]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2563eb]">
                    {r.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0b1c30]">{r.name}</div>
                    <div className="text-[11px] text-[#737686]">{r.cuisine} · ★ {r.rating}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{r.zone}</div>
                    <div className="text-[11px] text-[#737686]">{r.city}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-xs text-slate-800 block">{r.kamName}</span>
                    <span className="text-[10px] text-indigo-700 font-mono block">{r.kamEmail}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold tabular-nums">
                    {r.totalOrdersYTD.toLocaleString('en-IN')}
                    <span className="text-[11px] text-[#006c49] font-medium block">
                      {r.ordersYoyDelta}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#0b1c30] tabular-nums">
                    ₹{r.netRevenueLakhs}L
                    <span className="text-[11px] text-[#006c49] font-medium block">
                      {r.revenueYoyDelta}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium tabular-nums text-slate-700">
                    ₹{r.aov.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-slate-800">
                    {r.kitchenPrepTimeMinutes || 13.5}m
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-red-600 font-semibold">
                    {r.cancellationRate || 0.6}%
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-amber-700 font-semibold">
                    {r.discountPercentage || 14.5}%
                  </td>
                  <td className="py-3.5 px-4 text-center tabular-nums">
                    <span className="font-semibold text-emerald-700">{r.fulfillmentRate}%</span>
                    <span className="text-[10px] text-slate-400 block">{r.slaMinutes}m prep</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        r.status === 'Peak Surge'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectAndNavigate(r)}
                        className="px-3 py-1.5 bg-[#2563eb] text-white hover:bg-blue-700 rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
                        title="View Dashboard for this Restaurant"
                      >
                        <span className="material-symbols-outlined text-[14px]">monitoring</span>
                        <span>View Data</span>
                      </button>
                      <button
                        onClick={() => setInspectModalRestaurant(r)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors"
                        title="Inspect Equipment & Hardware"
                      >
                        <span className="material-symbols-outlined text-[16px]">info</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 text-[#737686] text-xs flex items-center justify-between">
          <span>
            Displaying {filtered.length} restaurants mapped to <strong>{currentKam.name}</strong>
          </span>
          <span className="text-[11px]">Synced with Google Sheet & Zomato Enterprise Hub</span>
        </div>
      </div>

      {/* Inspect Equipment / Details Modal */}
      {inspectModalRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-blue-100 text-[#2563eb] px-2 py-0.5 rounded">
                    {inspectModalRestaurant.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{inspectModalRestaurant.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {inspectModalRestaurant.zone}, {inspectModalRestaurant.city}
                </p>
              </div>
              <button
                onClick={() => setInspectModalRestaurant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned KAM Manager:</span>
                  <span className="font-semibold text-slate-900">
                    {inspectModalRestaurant.kamName} ({inspectModalRestaurant.kamEmail})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cuisine & Category:</span>
                  <span className="font-semibold text-slate-800">{inspectModalRestaurant.cuisine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Average Preparation SLA:</span>
                  <span className="font-semibold text-emerald-700">{inspectModalRestaurant.slaMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fulfillment Compliance:</span>
                  <span className="font-semibold text-emerald-700">{inspectModalRestaurant.fulfillmentRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Quality Score:</span>
                  <span className="font-semibold text-amber-700">★ {inspectModalRestaurant.rating} / 5.0</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Installed Kitchen Telemetry Hardware
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {inspectModalRestaurant.equipmentInstalled.map((eq) => (
                    <span
                      key={eq}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563eb] font-medium text-[11px] border border-blue-200"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setInspectModalRestaurant(null)}
                className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const res = inspectModalRestaurant;
                  setInspectModalRestaurant(null);
                  onSelectAndNavigate(res);
                }}
                className="px-4 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1"
              >
                <span>Launch Restaurant Analytics</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
