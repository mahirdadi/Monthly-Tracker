import React, { useState, useMemo } from 'react';
import { Restaurant, KAMUser } from '../types';
import { KAM_ROSTER } from '../data/mockData';

interface MasterSheetViewProps {
  restaurants: Restaurant[];
  currentKam: KAMUser;
  onSwitchKam: (kam: KAMUser) => void;
  onSelectAndNavigate: (restaurant: Restaurant) => void;
  onOpenGoogleSheetSync: () => void;
}

export const MasterSheetView: React.FC<MasterSheetViewProps> = ({
  restaurants,
  currentKam,
  onSwitchKam,
  onSelectAndNavigate,
  onOpenGoogleSheetSync,
}) => {
  const [selectedKamId, setSelectedKamId] = useState<string>('all');
  const [metricPillar, setMetricPillar] = useState<'all' | 'commercial' | 'operations' | 'quality'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [inspectRestaurant, setInspectRestaurant] = useState<Restaurant | null>(null);

  const cities = ['All', 'Gurugram', 'Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Lucknow'];
  const statuses = ['All', 'Operational', 'Peak Surge', 'Optimal'];

  // Filter master dataset
  const filteredList = useMemo(() => {
    let list = restaurants;

    if (selectedKamId !== 'all') {
      list = list.filter((r) => r.kamId === selectedKamId);
    }

    if (selectedCity !== 'All') {
      list = list.filter((r) => r.city === selectedCity);
    }

    if (selectedStatus !== 'All') {
      list = list.filter((r) => r.status === selectedStatus);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.chain.toLowerCase().includes(q) ||
          r.zone.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.kamName.toLowerCase().includes(q) ||
          r.kamEmail.toLowerCase().includes(q)
      );
    }

    return list;
  }, [restaurants, selectedKamId, selectedCity, selectedStatus, searchTerm]);

  // Aggregate stats across the master sheet
  const masterStats = useMemo(() => {
    const totalOrders = restaurants.reduce((acc, r) => acc + r.totalOrdersYTD, 0);
    const totalRev = restaurants.reduce((acc, r) => acc + r.netRevenueLakhs, 0);
    const avgAov = Math.round(restaurants.reduce((acc, r) => acc + r.aov, 0) / (restaurants.length || 1));
    const avgKpt = (restaurants.reduce((acc, r) => acc + (r.kitchenPrepTimeMinutes || 13.5), 0) / (restaurants.length || 1)).toFixed(1);
    const avgCancellation = (restaurants.reduce((acc, r) => acc + (r.cancellationRate || 0.6), 0) / (restaurants.length || 1)).toFixed(2);
    const avgDiscount = (restaurants.reduce((acc, r) => acc + (r.discountPercentage || 14.2), 0) / (restaurants.length || 1)).toFixed(1);
    const avgSla = (restaurants.reduce((acc, r) => acc + r.fulfillmentRate, 0) / (restaurants.length || 1)).toFixed(1);
    const avgRating = (restaurants.reduce((acc, r) => acc + r.rating, 0) / (restaurants.length || 1)).toFixed(2);

    return {
      totalOutlets: 10482,
      collatedRows: restaurants.length,
      totalOrders,
      totalRev: totalRev.toFixed(1),
      avgAov,
      avgKpt,
      avgCancellation,
      avgDiscount,
      avgSla,
      avgRating,
    };
  }, [restaurants]);

  const handleDownloadCollatedCsv = () => {
    const headers = [
      'Restaurant ID',
      'Restaurant Name',
      'Chain / Brand',
      'City',
      'Zone',
      'KAM Name',
      'KAM Email',
      'Orders YTD',
      'Net Revenue Lakhs',
      'AOV',
      'Fulfillment SLA %',
      'Kitchen Prep Time (mins)',
      'Cancellation %',
      'Discount %',
      'Refund %',
      'Online Uptime %',
      'Repeat %',
      'Ad ROAS',
      'Rating ★',
      'Status',
    ];

    const rows = filteredList.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.chain.replace(/"/g, '""')}"`,
      r.city,
      `"${r.zone.replace(/"/g, '""')}"`,
      `"${r.kamName}"`,
      r.kamEmail,
      r.totalOrdersYTD,
      r.netRevenueLakhs,
      r.aov,
      `${r.fulfillmentRate}%`,
      r.kitchenPrepTimeMinutes || 13.5,
      `${r.cancellationRate || 0.6}%`,
      `${r.discountPercentage || 14.5}%`,
      `${r.refundRate || 0.8}%`,
      `${r.onlineUptime || 99.4}%`,
      `${r.repeatCustomerRate || 48}%`,
      `${r.adRoas || 4.8}x`,
      r.rating,
      r.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'zomato_master_sheet_all_kams_collated_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Hero Master Collation Header */}
      <div className="mb-6 p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl shadow-md border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">table_chart</span>
              </span>
              <h2 className="text-xl font-black tracking-tight text-white">
                Unified Master Sheet — Central Fleet Data Warehouse
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Auto-Collated Across All KAMs
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 max-w-3xl leading-relaxed">
              All 10,482+ restaurants are centrally mapped in this single master sheet. Individual Key Account Managers
              <strong> never need to upload files manually</strong> — when they log in, their specific restaurant numbers,
              commercials, and prep SLAs are automatically filtered and served directly to their dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleDownloadCollatedCsv}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              title="Download entire collated sheet for all KAMs in CSV format"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              <span>Export Master Sheet (.CSV)</span>
            </button>
            <button
              onClick={onOpenGoogleSheetSync}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 backdrop-blur-xs"
              title="Configure central Google Sheet sync URL and auto-refresh schedule"
            >
              <span className="material-symbols-outlined text-[17px] text-emerald-300">sync</span>
              <span>Central Sheet Settings</span>
            </button>
          </div>
        </div>

        {/* Live sync pill ticker */}
        <div className="mt-4 pt-3.5 border-t border-emerald-800/60 flex flex-wrap items-center justify-between text-[11px] text-emerald-200/90 gap-2">
          <div className="flex items-center gap-4 flex-wrap font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Source: Google Sheet ID <code>1ZOMATO_MASTER_ALL_KAMS_2026</code></span>
            </span>
            <span>·</span>
            <span>Cadence: <strong>Auto-sync every 5 min</strong></span>
            <span>·</span>
            <span>Last Collated: <strong>14:02 IST Today</strong></span>
          </div>
          <span className="text-emerald-300 font-semibold">
            {masterStats.totalOutlets.toLocaleString('en-IN')} Total Registered Outlets
          </span>
        </div>
      </div>

      {/* KAM Portfolio Comparison Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#2563eb]">groups</span>
            <h3 className="font-bold text-sm text-[#0b1c30]">KAM Team Portfolios in Master Sheet</h3>
            <span className="text-xs text-slate-500 font-normal">
              (Click any KAM to inspect their pre-mapped slice)
            </span>
          </div>
          <button
            onClick={() => setSelectedKamId('all')}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
              selectedKamId === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Show All Portfolios ({restaurants.length} Outlets)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {KAM_ROSTER.filter((k) => !k.isAdmin).map((kam) => {
            const kamRestaurants = restaurants.filter(
              (r) => r.kamId === kam.id || r.kamEmail.toLowerCase() === kam.email.toLowerCase()
            );
            const isSelected = selectedKamId === kam.id;
            const isUserLoggedIn = currentKam.id === kam.id;
            const kamOrders = kamRestaurants.reduce((acc, r) => acc + r.totalOrdersYTD, 0);
            const kamRev = kamRestaurants.reduce((acc, r) => acc + r.netRevenueLakhs, 0).toFixed(1);
            const kamAvgKpt = (kamRestaurants.reduce((acc, r) => acc + (r.kitchenPrepTimeMinutes || 13.5), 0) / (kamRestaurants.length || 1)).toFixed(1);
            const kamSla = (kamRestaurants.reduce((acc, r) => acc + r.fulfillmentRate, 0) / (kamRestaurants.length || 1)).toFixed(1);

            return (
              <div
                key={kam.id}
                onClick={() => setSelectedKamId(isSelected ? 'all' : kam.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-[#2563eb] bg-blue-50/70 shadow-sm ring-1 ring-blue-500'
                    : isUserLoggedIn
                    ? 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-400'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-2xs'
                }`}
              >
                {isUserLoggedIn && (
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                    Logged In
                  </span>
                )}

                <div className="flex items-center gap-2.5 mb-2.5">
                  <img
                    src={kam.avatarUrl}
                    alt={kam.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{kam.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{kam.email}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Mapped Outlets</span>
                    <span className="font-bold text-[#0b1c30]">
                      {kamRestaurants.length > 0 ? `${kamRestaurants.length} in sheet (${kam.assignedRestaurantCount})` : `${kam.assignedRestaurantCount} outlets`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Portfolio NOV</span>
                    <span className="font-bold text-emerald-700 font-mono">₹{kamRev}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Prep KPT / SLA</span>
                    <span className="font-medium text-slate-800 font-mono">{kamAvgKpt}m / {kamSla}%</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate text-[10px]">{kam.region.split('(')[0]}</span>
                  {!isUserLoggedIn && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwitchKam(kam);
                      }}
                      className="text-[#2563eb] hover:underline font-bold text-[10px]"
                    >
                      Login as KAM →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Pillar Tabs & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-4">
        {/* Metric Pillar Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setMetricPillar('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                metricPillar === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>All 14 Master Metrics</span>
            </button>
            <button
              onClick={() => setMetricPillar('commercial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                metricPillar === 'commercial'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
              <span>Commercials & Growth</span>
            </button>
            <button
              onClick={() => setMetricPillar('operations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                metricPillar === 'operations'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">timer</span>
              <span>Kitchen Prep (KPT) & Operations</span>
            </button>
            <button
              onClick={() => setMetricPillar('quality')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                metricPillar === 'quality'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Customer Quality & NPS</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredList.length}</strong> outlets in collated master sheet
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#eff4ff] border border-slate-300 rounded-xl px-3 py-1.5 focus-within:border-blue-600 focus-within:bg-white transition-all flex-1 max-w-md">
            <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Restaurant ID (e.g. REST-10492), Outlet, Brand, City, or KAM..."
              className="w-full bg-transparent border-none outline-none text-xs text-slate-900 placeholder-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-xs text-slate-400 hover:text-slate-700">
                ×
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* KAM Filter */}
            <select
              value={selectedKamId}
              onChange={(e) => setSelectedKamId(e.target.value)}
              className="bg-[#eff4ff] border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600"
            >
              <option value="all">KAM: All Assigned</option>
              {KAM_ROSTER.filter((k) => !k.isAdmin).map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name} ({k.assignedRestaurantCount} outlets)
                </option>
              ))}
            </select>

            {/* City Filter */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-[#eff4ff] border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  City: {c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#eff4ff] border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-600"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* High Density Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-20">
              <tr>
                <th className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 shadow-2xs">Restaurant ID & Outlet</th>
                <th className="py-2.5 px-3">Brand / Chain</th>
                <th className="py-2.5 px-3">Mapped KAM Email</th>
                <th className="py-2.5 px-3">City & Zone</th>

                {(metricPillar === 'all' || metricPillar === 'commercial') && (
                  <>
                    <th className="py-2.5 px-3 text-right">Orders (YTD)</th>
                    <th className="py-2.5 px-3 text-right">Net Rev (NOV)</th>
                    <th className="py-2.5 px-3 text-right">AOV</th>
                    <th className="py-2.5 px-3 text-right">Discount %</th>
                    <th className="py-2.5 px-3 text-right">Take Rate</th>
                    <th className="py-2.5 px-3 text-right">Ad ROAS</th>
                  </>
                )}

                {(metricPillar === 'all' || metricPillar === 'operations') && (
                  <>
                    <th className="py-2.5 px-3 text-right">Kitchen Prep (KPT)</th>
                    <th className="py-2.5 px-3 text-right">Rider Wait</th>
                    <th className="py-2.5 px-3 text-right">Cancel %</th>
                    <th className="py-2.5 px-3 text-right">SLA Prep %</th>
                  </>
                )}

                {(metricPillar === 'all' || metricPillar === 'quality') && (
                  <>
                    <th className="py-2.5 px-3 text-right">Rating ★</th>
                    <th className="py-2.5 px-3 text-right">NPS Score</th>
                    <th className="py-2.5 px-3 text-right">Refund %</th>
                    <th className="py-2.5 px-3 text-right">Uptime %</th>
                    <th className="py-2.5 px-3 text-right">Repeat %</th>
                  </>
                )}

                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredList.map((r) => {
                const isMappedToCurrentKam =
                  currentKam.isAdmin ||
                  r.kamId === currentKam.id ||
                  r.kamEmail.toLowerCase() === currentKam.email.toLowerCase();

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isMappedToCurrentKam ? 'bg-blue-50/15' : ''
                    }`}
                  >
                    {/* ID & Name */}
                    <td className="py-2.5 px-3 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#2563eb]">{r.id}</span>
                        {isMappedToCurrentKam && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="In your mapped portfolio"></span>
                        )}
                      </div>
                      <div className="font-sans font-semibold text-slate-900 truncate max-w-[180px]">
                        {r.name}
                      </div>
                    </td>

                    {/* Chain */}
                    <td className="py-2.5 px-3 font-sans text-slate-700 font-medium">
                      {r.chain}
                    </td>

                    {/* KAM Email */}
                    <td className="py-2.5 px-3">
                      <span className="text-slate-800 font-sans font-semibold block">{r.kamName}</span>
                      <span className="text-slate-500 text-[10px]">{r.kamEmail}</span>
                    </td>

                    {/* City & Zone */}
                    <td className="py-2.5 px-3 font-sans text-slate-600">
                      <span className="font-medium text-slate-800">{r.city}</span>
                      <span className="block text-[10px] text-slate-500 truncate max-w-[140px]">{r.zone}</span>
                    </td>

                    {/* Commercial Metrics */}
                    {(metricPillar === 'all' || metricPillar === 'commercial') && (
                      <>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {r.totalOrdersYTD.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                          ₹{r.netRevenueLakhs}L
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          ₹{r.aov.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-700 font-semibold">
                          {r.discountPercentage || 14.5}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {r.takeRateCommission || 18.5}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                          {r.adRoas || 4.8}x
                        </td>
                      </>
                    )}

                    {/* Operational Metrics */}
                    {(metricPillar === 'all' || metricPillar === 'operations') && (
                      <>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                          {r.kitchenPrepTimeMinutes || 13.5}m
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {r.riderWaitMinutes || 3.8}m
                        </td>
                        <td className="py-2.5 px-3 text-right text-red-600 font-semibold">
                          {r.cancellationRate || 0.6}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                          {r.fulfillmentRate}%
                        </td>
                      </>
                    )}

                    {/* Quality Metrics */}
                    {(metricPillar === 'all' || metricPillar === 'quality') && (
                      <>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-600">
                          {r.rating} ★
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                          {r.npsScore || 78}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {r.refundRate || 0.8}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-700">
                          {r.onlineUptime || 99.4}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-blue-700 font-semibold">
                          {r.repeatCustomerRate || 48}%
                        </td>
                      </>
                    )}

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                          r.status === 'Peak Surge'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'Optimal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectRestaurant(r)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-sans text-[11px] font-semibold transition-colors"
                          title="Inspect all metrics for this restaurant"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onSelectAndNavigate(r)}
                          className="px-2 py-1 bg-[#2563eb] hover:bg-blue-700 text-white rounded-md font-sans text-[11px] font-semibold transition-colors"
                          title="View this restaurant in dashboard"
                        >
                          Dashboard
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outlet Detail Inspection Drawer / Modal */}
      {inspectRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">storefront</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#2563eb] bg-blue-100/60 px-1.5 py-0.5 rounded">
                      {inspectRestaurant.id}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{inspectRestaurant.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    {inspectRestaurant.chain} · {inspectRestaurant.city} ({inspectRestaurant.zone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectRestaurant(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs max-h-[65vh]">
              {/* KAM Assignment Card */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-0.5">
                    Mapped Key Account Manager
                  </span>
                  <p className="font-bold text-sm text-slate-900">{inspectRestaurant.kamName}</p>
                  <p className="text-xs text-slate-500 font-mono">{inspectRestaurant.kamEmail}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-blue-700 border border-blue-200">
                  {inspectRestaurant.status}
                </span>
              </div>

              {/* Grid of 14 Metrics */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Complete 14-Metric Restaurant Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Total Orders (YTD)</span>
                    <span className="font-bold text-sm text-slate-900">{inspectRestaurant.totalOrdersYTD.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">{inspectRestaurant.ordersYoyDelta} YoY</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Net Order Value (NOV)</span>
                    <span className="font-bold text-sm text-emerald-700 font-mono">₹{inspectRestaurant.netRevenueLakhs}L</span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">{inspectRestaurant.revenueYoyDelta} YoY</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Average Order Value (AOV)</span>
                    <span className="font-bold text-sm text-slate-900 font-mono">₹{inspectRestaurant.aov.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-blue-700 block font-semibold">{inspectRestaurant.aovYoyDelta} YoY</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Kitchen Prep Time (KPT)</span>
                    <span className="font-bold text-sm text-slate-900">{inspectRestaurant.kitchenPrepTimeMinutes || 13.5}m</span>
                    <span className="text-[10px] text-slate-500 block">Target: &lt;15 mins</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Rider Wait at Outlet</span>
                    <span className="font-bold text-sm text-slate-900">{inspectRestaurant.riderWaitMinutes || 3.8}m</span>
                    <span className="text-[10px] text-slate-500 block">Optimal handover</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Cancellation Rate</span>
                    <span className="font-bold text-sm text-red-600">{inspectRestaurant.cancellationRate || 0.6}%</span>
                    <span className="text-[10px] text-slate-500 block">Stockouts & drops</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Promo Discount %</span>
                    <span className="font-bold text-sm text-amber-700">{inspectRestaurant.discountPercentage || 14.5}%</span>
                    <span className="text-[10px] text-slate-500 block">Funded co-burn</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Take Rate / Commission</span>
                    <span className="font-bold text-sm text-slate-900">{inspectRestaurant.takeRateCommission || 18.5}%</span>
                    <span className="text-[10px] text-slate-500 block">Tier-1 contract</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Sponsored Ads ROAS</span>
                    <span className="font-bold text-sm text-blue-700">{inspectRestaurant.adRoas || 4.8}x</span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">Healthy return</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Customer Rating ★</span>
                    <span className="font-bold text-sm text-amber-600">{inspectRestaurant.rating} ★</span>
                    <span className="text-[10px] text-slate-500 block">Based on 2.4K reviews</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Customer NPS</span>
                    <span className="font-bold text-sm text-slate-900">{inspectRestaurant.npsScore || 78}</span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">Promoters &gt; 80%</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">30-Day Repeat Rate</span>
                    <span className="font-bold text-sm text-blue-700">{inspectRestaurant.repeatCustomerRate || 48}%</span>
                    <span className="text-[10px] text-slate-500 block">High retention</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Synced from central master sheet · Real-time telemetry
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectRestaurant(null)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setInspectRestaurant(null);
                    onSelectAndNavigate(inspectRestaurant);
                  }}
                  className="px-4 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                >
                  Open in Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
