import React, { useState } from 'react';
import { GLOBAL_MONTHLY_DATA, INITIAL_ORDERS } from '../data/mockData';
import { Order, NavigationTab, Restaurant, KAMUser } from '../types';

interface DashboardViewProps {
  onSelectOrder: (order: Order) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenExport: () => void;
  selectedRestaurant: Restaurant | null;
  onOpenRestaurantFilter: () => void;
  onClearRestaurant: () => void;
  currentKam: KAMUser;
  onOpenGoogleSheetSync: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectOrder,
  onNavigate,
  onOpenExport,
  selectedRestaurant,
  onOpenRestaurantFilter,
  onClearRestaurant,
  currentKam,
  onOpenGoogleSheetSync,
}) => {
  // Chart viewing mode: '2026vs2025' or 'qoq'
  const [comparisonMode, setComparisonMode] = useState<'2026vs2025' | 'qoq'>('2026vs2025');
  // Orders chart granualarity: 'monthly' or 'quarterly'
  const [ordersGranularity, setOrdersGranularity] = useState<'monthly' | 'quarterly'>('monthly');
  // Active metric pillar for high-level cards: 'commercial' | 'operations' | 'quality'
  const [metricPillar, setMetricPillar] = useState<'commercial' | 'operations' | 'quality'>('commercial');
  // Timeframe filter
  const [timeframe, setTimeframe] = useState<string>('YTD (Jan - Jun)');
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false);
  // Live sync time simulation
  const [syncTime, setSyncTime] = useState<string>('14:02 IST');
  const [isSyncing, setIsSyncing] = useState(false);

  // Table pagination & filter
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Hover state for chart points
  const [hoveredOrderPoint, setHoveredOrderPoint] = useState<{
    index: number;
    month: string;
    orders2026: number | null;
    orders2025: number;
    x: number;
    y: number;
  } | null>(null);

  const [hoveredRevPoint, setHoveredRevPoint] = useState<{
    index: number;
    month: string;
    rev2026: number | null;
    rev2025: number;
    x: number;
    y: number;
  } | null>(null);

  const handleRefreshSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setSyncTime(`${hours}:${mins} IST`);
      setIsSyncing(false);
    }, 400);
  };

  // Active chart data (either restaurant-level or global aggregate)
  const activeChartData = selectedRestaurant
    ? selectedRestaurant.monthlyChartData
    : GLOBAL_MONTHLY_DATA;

  // Filter orders by restaurant if selected
  const allOrders = INITIAL_ORDERS;
  const filteredOrders = allOrders.filter((ord) => {
    if (selectedRestaurant && ord.restaurantId !== selectedRestaurant.id) {
      const hasSpecificOrders = allOrders.some((o) => o.restaurantId === selectedRestaurant.id);
      if (hasSpecificOrders) {
        return ord.restaurantId === selectedRestaurant.id;
      }
    }
    if (statusFilter === 'all') return true;
    return ord.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const ordersPerPage = 4;
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const displayedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Key metrics calculation (Single Restaurant vs KAM Portfolio vs Global Central)
  const stats = selectedRestaurant
    ? {
        totalOrders: selectedRestaurant.totalOrdersYTD.toLocaleString('en-IN'),
        ordersBaseline: `vs ${selectedRestaurant.ordersVsLastYear.toLocaleString('en-IN')} in FY 2025`,
        ordersDelta: selectedRestaurant.ordersYoyDelta,
        ordersAnnotation: 'Surpassing Plan',
        netRev: `₹${selectedRestaurant.netRevenueLakhs}L`,
        revBaseline: `vs ₹${selectedRestaurant.revenueVsLastYearLakhs}L in FY 2025`,
        revDelta: selectedRestaurant.revenueYoyDelta,
        revAnnotation: `+₹${(selectedRestaurant.netRevenueLakhs - selectedRestaurant.revenueVsLastYearLakhs).toFixed(1)}L Delta`,
        aov: `₹${selectedRestaurant.aov.toLocaleString('en-IN')}`,
        aovBaseline: `vs ₹${selectedRestaurant.aovVsLastYear.toLocaleString('en-IN')} in FY 2025`,
        aovDelta: selectedRestaurant.aovYoyDelta,
        aovAnnotation: `₹${selectedRestaurant.aov - selectedRestaurant.aovVsLastYear} Expansion`,
        fulfillment: `${selectedRestaurant.fulfillmentRate}%`,
        fulfillmentBaseline: `SLA prep ${selectedRestaurant.slaMinutes}m avg`,
        fulfillmentDelta: '+1.4%',
        fulfillmentAnnotation: 'Optimal Grade',

        // Extended Metrics for Single Restaurant
        kpt: `${selectedRestaurant.kitchenPrepTimeMinutes || 13.5} mins`,
        kptBaseline: 'vs 15.2 mins FY 2025',
        kptDelta: '-1.7 mins',
        kptAnnotation: 'Faster Handover',

        riderWait: `${selectedRestaurant.riderWaitMinutes || 3.8} mins`,
        riderWaitBaseline: 'vs 4.8 mins FY 2025',
        riderWaitDelta: '-1.0 mins',
        riderWaitAnnotation: 'Optimal Dispatch',

        cancellation: `${selectedRestaurant.cancellationRate || 0.6}%`,
        cancellationBaseline: 'vs 1.2% in FY 2025',
        cancellationDelta: '-0.6%',
        cancellationAnnotation: 'Low Stockouts',

        discount: `${selectedRestaurant.discountPercentage || 14.5}%`,
        discountBaseline: 'vs 17.0% in FY 2025',
        discountDelta: '-2.5%',
        discountAnnotation: 'Margin Positive',

        takeRate: `${selectedRestaurant.takeRateCommission || 18.5}%`,
        takeRateBaseline: 'vs 18.0% standard',
        takeRateDelta: '+0.5%',
        takeRateAnnotation: 'Tier-1 Contract',

        adRoas: `${selectedRestaurant.adRoas || 4.8}x`,
        adRoasBaseline: 'vs 4.1x in FY 2025',
        adRoasDelta: '+0.7x',
        adRoasAnnotation: 'High ROI',

        rating: `${selectedRestaurant.rating} ★`,
        ratingBaseline: 'vs 4.4 ★ in FY 2025',
        ratingDelta: '+0.3 ★',
        ratingAnnotation: 'Top 5% Category',

        nps: `${selectedRestaurant.npsScore || 78} NPS`,
        npsBaseline: 'vs 71 in FY 2025',
        npsDelta: '+7 pts',
        npsAnnotation: 'Promoters > 80%',

        uptime: `${selectedRestaurant.onlineUptime || 99.4}%`,
        uptimeBaseline: 'vs 98.6% in FY 2025',
        uptimeDelta: '+0.8%',
        uptimeAnnotation: 'Peak Reliability',

        repeatRate: `${selectedRestaurant.repeatCustomerRate || 48.0}%`,
        repeatRateBaseline: 'vs 42.1% in FY 2025',
        repeatRateDelta: '+5.9%',
        repeatRateAnnotation: 'High Retention',
      }
    : !currentKam.isAdmin
    ? {
        totalOrders: (currentKam.assignedRestaurantCount * 4.16).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        ordersBaseline: `vs ${(currentKam.assignedRestaurantCount * 3.42).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} in FY 2025`,
        ordersDelta: '+21.6%',
        ordersAnnotation: `${currentKam.assignedRestaurantCount} Mapped Outlets`,
        netRev: `₹${(currentKam.assignedRestaurantCount * 0.014).toFixed(1)}L`,
        revBaseline: `vs ₹${(currentKam.assignedRestaurantCount * 0.0113).toFixed(1)}L in FY 2025`,
        revDelta: '+23.9%',
        revAnnotation: 'Portfolio On-Track',
        aov: '₹3,377',
        aovBaseline: 'vs ₹3,297 in FY 2025',
        aovDelta: '+2.4%',
        aovAnnotation: '₹80 Expansion',
        fulfillment: '98.6%',
        fulfillmentBaseline: 'SLA delivery <20m avg',
        fulfillmentDelta: '+1.5%',
        fulfillmentAnnotation: 'Optimal Grade',

        // Extended Metrics for KAM Portfolio
        kpt: '13.8 mins',
        kptBaseline: 'vs 15.4 mins in FY 2025',
        kptDelta: '-1.6 mins',
        kptAnnotation: 'Fleet Optimized',

        riderWait: '3.6 mins',
        riderWaitBaseline: 'vs 4.6 mins in FY 2025',
        riderWaitDelta: '-1.0 mins',
        riderWaitAnnotation: 'Fast Pickup',

        cancellation: '0.58%',
        cancellationBaseline: 'vs 1.15% in FY 2025',
        cancellationDelta: '-0.57%',
        cancellationAnnotation: 'Low Leakage',

        discount: '14.2%',
        discountBaseline: 'vs 16.5% in FY 2025',
        discountDelta: '-2.3%',
        discountAnnotation: 'Promo Efficiency',

        takeRate: '18.4%',
        takeRateBaseline: 'vs 18.0% base',
        takeRateDelta: '+0.4%',
        takeRateAnnotation: 'KAM Portfolio Avg',

        adRoas: '4.9x',
        adRoasBaseline: 'vs 4.2x in FY 2025',
        adRoasDelta: '+0.7x',
        adRoasAnnotation: 'Strong Conversion',

        rating: '4.7 ★',
        ratingBaseline: 'vs 4.5 ★ in FY 2025',
        ratingDelta: '+0.2 ★',
        ratingAnnotation: 'Excellent Quality',

        nps: '77 NPS',
        npsBaseline: 'vs 70 in FY 2025',
        npsDelta: '+7 pts',
        npsAnnotation: 'Customer Delight',

        uptime: '99.5%',
        uptimeBaseline: 'vs 98.8% in FY 2025',
        uptimeDelta: '+0.7%',
        uptimeAnnotation: 'Central Uptime',

        repeatRate: '49.2%',
        repeatRateBaseline: 'vs 43.0% in FY 2025',
        repeatRateDelta: '+6.2%',
        repeatRateAnnotation: 'Loyal Base',
      }
    : {
        totalOrders: '13,300',
        ordersBaseline: 'vs 11,650 in FY 2025',
        ordersDelta: '+14.2%',
        ordersAnnotation: 'Surpassing Plan',
        netRev: '₹44.1L',
        revBaseline: 'vs ₹37.2L in FY 2025',
        revDelta: '+18.5%',
        revAnnotation: '+₹6.9L Delta',
        aov: '₹3,315',
        aovBaseline: 'vs ₹3,193 in FY 2025',
        aovDelta: '+3.8%',
        aovAnnotation: '₹122 Expansion',
        fulfillment: '98.4%',
        fulfillmentBaseline: 'SLA delivery <24hrs',
        fulfillmentDelta: '+1.2%',
        fulfillmentAnnotation: 'Optimal Grade',

        kpt: '14.1 mins',
        kptBaseline: 'vs 15.8 mins in FY 2025',
        kptDelta: '-1.7 mins',
        kptAnnotation: 'Fleet Average',

        riderWait: '3.9 mins',
        riderWaitBaseline: 'vs 4.9 mins in FY 2025',
        riderWaitDelta: '-1.0 mins',
        riderWaitAnnotation: 'Central Dispatch',

        cancellation: '0.64%',
        cancellationBaseline: 'vs 1.22% in FY 2025',
        cancellationDelta: '-0.58%',
        cancellationAnnotation: 'Low Risk',

        discount: '14.8%',
        discountBaseline: 'vs 17.2% in FY 2025',
        discountDelta: '-2.4%',
        discountAnnotation: 'Fleet Margins',

        takeRate: '18.2%',
        takeRateBaseline: 'vs 18.0% standard',
        takeRateDelta: '+0.2%',
        takeRateAnnotation: 'National Tier-1',

        adRoas: '4.7x',
        adRoasBaseline: 'vs 4.0x in FY 2025',
        adRoasDelta: '+0.7x',
        adRoasAnnotation: 'Zomato Ads Network',

        rating: '4.6 ★',
        ratingBaseline: 'vs 4.4 ★ in FY 2025',
        ratingDelta: '+0.2 ★',
        ratingAnnotation: 'National Fleet',

        nps: '76 NPS',
        npsBaseline: 'vs 69 in FY 2025',
        npsDelta: '+7 pts',
        npsAnnotation: 'Positive Brand',

        uptime: '99.3%',
        uptimeBaseline: 'vs 98.5% in FY 2025',
        uptimeDelta: '+0.8%',
        uptimeAnnotation: '99.98% Service SLA',

        repeatRate: '47.5%',
        repeatRateBaseline: 'vs 41.8% in FY 2025',
        repeatRateDelta: '+5.7%',
        repeatRateAnnotation: 'Fleet Retention',
      };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Active KAM Portfolio Mode Banner (When viewing all mapped restaurants for this KAM) */}
      {!selectedRestaurant && !currentKam.isAdmin && (
        <div className="mb-5 p-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white rounded-xl border border-blue-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              KAM
            </div>
            <div>
              <div className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                <span>{currentKam.name}'s Mapped Portfolio</span>
                <span className="text-[10px] bg-blue-100 text-[#2563eb] font-mono px-1.5 py-0.2 rounded font-semibold">
                  {currentKam.assignedRestaurantCount} Outlets
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-medium">
                  Google Sheet Connected
                </span>
              </div>
              <p className="text-[11px] text-[#434655]">
                Role: <strong>{currentKam.role}</strong> · Region: {currentKam.region} · Email: {currentKam.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenRestaurantFilter}
              className="px-3 py-1.5 bg-white border border-blue-200 text-[#2563eb] hover:bg-blue-50 rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">search</span>
              <span>Filter by Restaurant ID</span>
            </button>
            <button
              onClick={onOpenGoogleSheetSync}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">table_chart</span>
              <span>Sync Google Sheet</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Single Restaurant Filter Banner */}
      {selectedRestaurant && (
        <div className="mb-5 p-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white rounded-xl border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center font-bold shadow-xs">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold bg-white text-[#2563eb] px-2 py-0.5 rounded border border-blue-200">
                  {selectedRestaurant.id}
                </span>
                <h2 className="text-base font-bold text-[#0b1c30]">{selectedRestaurant.name}</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {selectedRestaurant.status}
                </span>
                <span className="text-xs text-amber-600 font-semibold">
                  ★ {selectedRestaurant.rating}
                </span>
              </div>
              <p className="text-xs text-[#434655] mt-0.5">
                {selectedRestaurant.zone}, {selectedRestaurant.city} ·{' '}
                <span className="text-[#737686]">{selectedRestaurant.cuisine}</span> ·{' '}
                <span className="text-indigo-700 font-medium">Mapped KAM: {selectedRestaurant.kamName}</span>
              </p>

              <div className="mt-2 pt-2 border-t border-blue-200/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700 font-medium">
                  KPT: <strong>{selectedRestaurant.kitchenPrepTimeMinutes || 13.5}m</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700 font-medium">
                  Rider Wait: <strong>{selectedRestaurant.riderWaitMinutes || 3.8}m</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-red-200 font-mono text-red-700 font-medium">
                  Cancel: <strong>{selectedRestaurant.cancellationRate || 0.6}%</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-amber-200 font-mono text-amber-700 font-medium">
                  Discount: <strong>{selectedRestaurant.discountPercentage || 14.5}%</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-emerald-200 font-mono text-emerald-700 font-medium">
                  Uptime: <strong>{selectedRestaurant.onlineUptime || 99.4}%</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-blue-200 font-mono text-blue-700 font-medium">
                  30d Repeat: <strong>{selectedRestaurant.repeatCustomerRate || 48}%</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-purple-200 font-mono text-purple-700 font-medium">
                  ROAS: <strong>{selectedRestaurant.adRoas || 4.8}x</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700 font-medium">
                  NPS: <strong>{selectedRestaurant.npsScore || 78}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenRestaurantFilter}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>Switch Restaurant</span>
            </button>
            <button
              onClick={onClearRestaurant}
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-[#2563eb] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
              <span>View All {currentKam.name} Outlets</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Command & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Ether</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Analytics</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563eb]">Performance</span>
            {selectedRestaurant && (
              <>
                <span className="text-[#c3c6d7] text-[11px]">/</span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                  {selectedRestaurant.id}
                </span>
              </>
            )}
          </div>
          <h1 className="text-[30px] font-bold text-[#0b1c30] tracking-tight">
            {selectedRestaurant ? `${selectedRestaurant.name} Overview` : 'Dashboard Overview'}
          </h1>
          <p className="text-[14px] text-[#434655] mt-0.5">
            {selectedRestaurant
              ? `Real-time outlet velocity, preparation SLA telemetry, and revenue performance for ${selectedRestaurant.id}.`
              : 'Real-time sales velocity, order metrics, and revenue breakdown compared with FY 2025.'}
          </p>
        </div>

        {/* Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Restaurant Quick Selector Button */}
          <button
            onClick={onOpenRestaurantFilter}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all shadow-xs ${
              selectedRestaurant
                ? 'bg-blue-50 border-blue-300 text-[#2563eb] font-semibold'
                : 'bg-white border-slate-200/60 text-[#0b1c30] hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#2563eb]">storefront</span>
            <span>{selectedRestaurant ? selectedRestaurant.id : '10,482 Restaurants'}</span>
            <span className="material-symbols-outlined text-[15px] text-[#737686]">tune</span>
          </button>

          {/* Live Sync Badge */}
          <button
            onClick={handleRefreshSync}
            title="Click to sync now"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-xs border border-slate-200/60 text-[#0b1c30] text-[12px] font-medium hover:bg-slate-50 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full bg-[#006c49] ${isSyncing ? 'animate-ping' : 'animate-pulse'}`}></span>
            <span className="text-[#434655]">Live Sync:</span>
            <span className="font-semibold text-[#0b1c30] tabular-nums">{syncTime}</span>
            <span className={`material-symbols-outlined text-[14px] text-[#737686] ml-0.5 ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>

          {/* 2026 vs 2025 / QoQ Trajectory Toggle */}
          <div className="inline-flex items-center gap-1 bg-white border border-slate-200/60 rounded-lg p-1 shadow-xs">
            <button
              onClick={() => setComparisonMode('2026vs2025')}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                comparisonMode === '2026vs2025'
                  ? 'bg-[#2563eb] text-white shadow-xs font-semibold'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              2026 vs 2025
            </button>
            <button
              onClick={() => setComparisonMode('qoq')}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                comparisonMode === 'qoq'
                  ? 'bg-[#2563eb] text-white shadow-xs font-semibold'
                  : 'text-[#434655] hover:text-[#0b1c30]'
              }`}
            >
              QoQ Trajectory
            </button>
          </div>

          {/* Timeframe Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTimeframeMenu(!showTimeframeMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/60 rounded-lg shadow-xs text-[#0b1c30] text-[12px] font-medium hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[17px] text-[#737686]">tune</span>
              <span>{timeframe}</span>
              <span className="material-symbols-outlined text-[16px] text-[#737686]">expand_more</span>
            </button>

            {showTimeframeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30">
                {['YTD (Jan - Jun)', 'Q1 (Jan - Mar)', 'Q2 (Apr - Jun)', 'Full Year Projected'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      setShowTimeframeMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors ${
                      timeframe === tf ? 'font-semibold text-[#2563eb] bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report CTA */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563eb] text-white rounded-lg text-[12px] font-medium shadow-xs hover:bg-blue-700 active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Metric Focus Pillar Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Metric View:
          </span>
          <button
            onClick={() => setMetricPillar('commercial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              metricPillar === 'commercial'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Commercials & Revenue</span>
          </button>
          <button
            onClick={() => setMetricPillar('operations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              metricPillar === 'operations'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>Kitchen Prep & SLA</span>
          </button>
          <button
            onClick={() => setMetricPillar('quality')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              metricPillar === 'quality'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Customer Quality & NPS</span>
          </button>
        </div>

        <button
          onClick={() => onNavigate('master-sheet')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition-colors shrink-0"
          title="Open Master Sheet containing all 10,482+ restaurants collated across all KAMs"
        >
          <span className="material-symbols-outlined text-[16px] text-emerald-600">table_chart</span>
          <span>Open All KAMs Master Sheet</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* Primary Metric Highlights (4 Dynamic Cards based on Metric Pillar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricPillar === 'commercial' && (
          <>
            {/* Stat 1: Total Orders */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  TOTAL ORDERS (YTD)
                </span>
                <span className="p-1.5 rounded-lg bg-[#eff4ff] text-[#2563eb]">
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.totalOrders}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.ordersBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e8fbf3] text-[#006c49] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>{stats.ordersDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-[#006c49] mt-1">{stats.ordersAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Net Revenue (NOV) */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  NET REVENUE (NOV)
                </span>
                <span className="p-1.5 rounded-lg bg-[#e8fbf3] text-[#006c49]">
                  <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.netRev}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.revBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e8fbf3] text-[#006c49] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>{stats.revDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-[#006c49] mt-1">{stats.revAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Avg. Order Value */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  AVG. ORDER VALUE
                </span>
                <span className="p-1.5 rounded-lg bg-[#f0efff] text-[#3e3fcc]">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.aov}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.aovBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e8fbf3] text-[#006c49] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_upward</span>{stats.aovDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-[#737686] mt-1">{stats.aovAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Stat 4: Promo Discount % */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  PROMO DISCOUNT %
                </span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <span className="material-symbols-outlined text-[18px]">percent</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.discount}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.discountBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_down</span>{stats.discountDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1">{stats.discountAnnotation}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {metricPillar === 'operations' && (
          <>
            {/* Stat 1: Kitchen Prep Time */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  KITCHEN PREP (KPT)
                </span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <span className="material-symbols-outlined text-[18px]">skillet</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.kpt}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.kptBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">timer</span>{stats.kptDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1">{stats.kptAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Rider Wait Time */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  RIDER WAIT AT OUTLET
                </span>
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.riderWait}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.riderWaitBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_downward</span>{stats.riderWaitDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1">{stats.riderWaitAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Merchant Cancellation % */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  CANCELLATION RATE
                </span>
                <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.cancellation}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.cancellationBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_down</span>{stats.cancellationDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1">{stats.cancellationAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Stat 4: Fulfillment SLA Rate */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  FULFILLMENT SLA
                </span>
                <span className="p-1.5 rounded-lg bg-[#eff4ff] text-[#2563eb]">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.fulfillment}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.fulfillmentBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e8fbf3] text-[#006c49] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>{stats.fulfillmentDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-[#006c49] mt-1">{stats.fulfillmentAnnotation}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {metricPillar === 'quality' && (
          <>
            {/* Stat 1: Customer Rating */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  CUSTOMER RATING
                </span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
                  <span className="material-symbols-outlined text-[18px]">star</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.rating}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.ratingBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>{stats.ratingDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 mt-1">{stats.ratingAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Stat 2: NPS Score */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  NET PROMOTER (NPS)
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.nps}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.npsBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_upward</span>{stats.npsDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1">{stats.npsAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Online Uptime % */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  ONLINE UPTIME %
                </span>
                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
                  <span className="material-symbols-outlined text-[18px]">wifi</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.uptime}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.uptimeBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>{stats.uptimeDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-teal-700 mt-1">{stats.uptimeAnnotation}</span>
                </div>
              </div>
            </div>

            {/* Stat 4: 30-Day Repeat Rate */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#737686] font-semibold tracking-wider uppercase">
                  30-DAY REPEAT %
                </span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex flex-col">
                  <span className="text-[28px] font-bold text-[#0b1c30] tracking-tight tabular-nums">
                    {stats.repeatRate}
                  </span>
                  <span className="text-[12px] text-[#737686] mt-0.5">{stats.repeatRateBaseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e8fbf3] text-[#006c49] text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>{stats.repeatRateDelta}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-700 mt-1">{stats.repeatRateAnnotation}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dual Comparison Visualizations Replicating the Target Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CARD 1: Orders (Year-over-Year Dual Line Chart) */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs p-6 flex flex-col justify-between relative hover:shadow-md transition-shadow">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] text-[#0b1c30] font-semibold tracking-tight">Orders</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#434655] text-[11px] font-semibold">
                {selectedRestaurant ? `${selectedRestaurant.id} YoY` : 'YoY Comparison'}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
              <button
                onClick={() => setOrdersGranularity('monthly')}
                className={`px-2.5 py-1 text-[11px] rounded transition-all ${
                  ordersGranularity === 'monthly'
                    ? 'font-semibold bg-white text-[#0b1c30] shadow-2xs'
                    : 'text-[#434655] hover:text-[#0b1c30]'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setOrdersGranularity('quarterly')}
                className={`px-2.5 py-1 text-[11px] rounded transition-all ${
                  ordersGranularity === 'quarterly'
                    ? 'font-semibold bg-white text-[#0b1c30] shadow-2xs'
                    : 'text-[#434655] hover:text-[#0b1c30]'
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>

          {/* Chart Canvas Wrapper */}
          <div className="w-full relative overflow-x-auto select-none pt-2">
            <svg
              aria-label="Orders comparison line graph 2025 vs 2026"
              className="w-full h-auto min-w-[560px] overflow-visible"
              viewBox="0 0 760 380"
            >
              <defs>
                <linearGradient id="ordersBlueGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18"></stop>
                  <stop offset="70%" stopColor="#2563EB" stopOpacity="0.04"></stop>
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00"></stop>
                </linearGradient>
                <filter height="140%" id="softGlow" width="140%" x="-20%" y="-20%">
                  <feDropShadow dx="0" dy="2" floodColor="#004AC6" floodOpacity="0.25" stdDeviation="3"></feDropShadow>
                </filter>
              </defs>

              {/* Horizontal Grid Lines */}
              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="45" y2="45" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="49">
                {selectedRestaurant ? '450' : '2.8K'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="85" y2="85" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="89">
                {selectedRestaurant ? '380' : '2.6K'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="125" y2="125" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="129">
                {selectedRestaurant ? '320' : '2.4K'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="165" y2="165" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="169">
                {selectedRestaurant ? '270' : '2.2K'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="205" y2="205" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="209">
                {selectedRestaurant ? '230' : '2.0K'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="245" y2="245" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="249">
                {selectedRestaurant ? '190' : '1.8K'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="285" y2="285" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="289">
                {selectedRestaurant ? '150' : '1.6K'}
              </text>

              <line stroke="#E2E8F0" strokeWidth="1.25" x1="55" x2="745" y1="325" y2="325" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="329">
                {selectedRestaurant ? '100' : '1.4K'}
              </text>

              {/* 2026 Area Gradient Fill under solid blue line */}
              <polygon
                fill="url(#ordersBlueGradient)"
                points="75,325 75,165 136,225 197,85 258,165 319,85 380,285 380,325"
              />

              {/* 2025 Comparative Baseline: Dashed Grey Line */}
              <path
                d="M 75 245 L 136 315 L 197 265 L 258 225 L 319 205 L 380 238 L 441 265 L 502 185 L 563 192 L 624 125 L 685 120 L 735 115"
                fill="none"
                stroke="#94A3B8"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />

              {/* 2025 Node Rings */}
              <g fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2">
                {[
                  [75, 245], [136, 315], [197, 265], [258, 225],
                  [319, 205], [380, 238], [441, 265], [502, 185],
                  [563, 192], [624, 125], [685, 120], [735, 115]
                ].map(([cx, cy], idx) => (
                  <circle key={idx} cx={cx} cy={cy} r="4.5" />
                ))}
              </g>

              {/* 2025 Value Annotations */}
              <g className="text-[11px] font-semibold" fill="#94A3B8" textAnchor="middle">
                {activeChartData.map((pt, idx) => {
                  const xs = [75, 136, 197, 258, 319, 380, 441, 502, 563, 624, 685, 735];
                  const ys = [235, 303, 254, 214, 194, 228, 254, 174, 181, 112, 108, 102];
                  return (
                    <text key={idx} x={xs[idx]} y={ys[idx]}>
                      {pt.ordersLabel2025}
                    </text>
                  );
                })}
              </g>

              {/* 2026 Current Period: Solid Blue Curved Line */}
              <path
                d="M 75 165 C 95 185, 115 225, 136 225 C 158 225, 175 85, 197 85 C 218 85, 238 165, 258 165 C 278 165, 298 85, 319 85 C 342 85, 360 285, 380 285"
                fill="none"
                stroke="#2563EB"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />

              {/* 2026 Interactive Nodes */}
              <g fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5">
                {[
                  { cx: 75, cy: 165, idx: 0, r: 5.5 },
                  { cx: 136, cy: 225, idx: 1, r: 5.5 },
                  { cx: 197, cy: 85, idx: 2, r: 6, filter: 'url(#softGlow)' },
                  { cx: 258, cy: 165, idx: 3, r: 5.5 },
                  { cx: 319, cy: 85, idx: 4, r: 6, filter: 'url(#softGlow)' },
                  { cx: 380, cy: 285, idx: 5, r: 5.5 },
                ].map((pt) => {
                  const dataPt = activeChartData[pt.idx];
                  return (
                    <circle
                      key={pt.idx}
                      cx={pt.cx}
                      cy={pt.cy}
                      r={hoveredOrderPoint?.index === pt.idx ? 8 : pt.r}
                      filter={pt.filter}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() =>
                        setHoveredOrderPoint({
                          index: pt.idx,
                          month: dataPt.month,
                          orders2026: dataPt.orders2026,
                          orders2025: dataPt.orders2025,
                          x: pt.cx,
                          y: pt.cy,
                        })
                      }
                      onMouseLeave={() => setHoveredOrderPoint(null)}
                    />
                  );
                })}
              </g>

              {/* 2026 Direct Value Labels above Nodes in Blue */}
              <g className="text-[11px] font-semibold" fill="#2563EB" textAnchor="middle">
                {activeChartData.slice(0, 6).map((pt, idx) => {
                  const xs = [75, 136, 197, 258, 319, 380];
                  const ys = [152, 212, 70, 152, 70, 272];
                  return (
                    <text key={idx} x={xs[idx]} y={ys[idx]}>
                      {pt.ordersLabel2026 || `${pt.orders2026}`}
                    </text>
                  );
                })}
              </g>

              {/* X-Axis Month Labels */}
              <g className="text-[12px]" fill="#737686" textAnchor="middle">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
                  (m, idx) => {
                    const xs = [75, 136, 197, 258, 319, 380, 441, 502, 563, 624, 685, 735];
                    return (
                      <text key={m} x={xs[idx]} y="352">
                        {m}
                      </text>
                    );
                  }
                )}
              </g>
            </svg>

            {/* Hover Tooltip Box */}
            {hoveredOrderPoint && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl"
                style={{
                  left: `${(hoveredOrderPoint.x / 760) * 100}%`,
                  top: `${(hoveredOrderPoint.y / 380) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="font-semibold text-slate-200">
                  {selectedRestaurant ? `${selectedRestaurant.id} · ` : ''}
                  {hoveredOrderPoint.month} 2026
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-blue-400 font-bold">{hoveredOrderPoint.orders2026} orders</span>
                  <span className="text-slate-400">vs {hoveredOrderPoint.orders2025} (2025)</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-0.5">
                  +{(((hoveredOrderPoint.orders2026! - hoveredOrderPoint.orders2025) / hoveredOrderPoint.orders2025) * 100).toFixed(1)}% YoY
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-2">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="inline-block w-4 h-3 border-2 border-dashed border-[#737686] rounded-xs"></span>
              <span className="text-[12px] text-[#434655] font-medium">2025</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="inline-block w-3.5 h-3.5 bg-[#2563eb] rounded-xs"></span>
              <span className="text-[12px] text-[#0b1c30] font-semibold">2026</span>
            </div>
          </div>
        </div>

        {/* CARD 2: NOV (Net Order Value in ₹ Lakhs - Dual Line Chart) */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs p-6 flex flex-col justify-between relative hover:shadow-md transition-shadow">
          {/* Card Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] text-[#0b1c30] font-semibold tracking-tight">NOV</h2>
              <span className="text-[13px] text-[#737686]">
                {selectedRestaurant ? `(${selectedRestaurant.id} Net Order Value in ₹ Lakhs)` : '(Net Order Value in ₹ Lakhs)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8fbf3] text-[#006c49] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">insights</span>
              <span>{selectedRestaurant ? `${selectedRestaurant.revenueYoyDelta} Expansion` : '+24.3% Peak (May)'}</span>
            </div>
          </div>

          {/* Chart Canvas Wrapper */}
          <div className="w-full relative overflow-x-auto select-none pt-2">
            <svg
              aria-label="NOV Revenue comparison line graph 2025 vs 2026"
              className="w-full h-auto min-w-[560px] overflow-visible"
              viewBox="0 0 760 380"
            >
              <defs>
                <linearGradient id="novGreenGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#006C49" stopOpacity="0.20"></stop>
                  <stop offset="70%" stopColor="#006C49" stopOpacity="0.05"></stop>
                  <stop offset="100%" stopColor="#006C49" stopOpacity="0.00"></stop>
                </linearGradient>
                <filter height="140%" id="greenGlow" width="140%" x="-20%" y="-20%">
                  <feDropShadow dx="0" dy="2" floodColor="#006C49" floodOpacity="0.25" stdDeviation="3"></feDropShadow>
                </filter>
              </defs>

              {/* Horizontal Grid Lines */}
              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="45" y2="45" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="49">
                {selectedRestaurant ? '₹1.5L' : '₹9.0L'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="76" y2="76" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="80">
                {selectedRestaurant ? '₹1.3L' : '₹8.5L'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="107" y2="107" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="111">
                {selectedRestaurant ? '₹1.1L' : '₹8.0L'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="138" y2="138" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="142">
                {selectedRestaurant ? '₹0.9L' : '₹7.5L'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="169" y2="169" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="173">
                {selectedRestaurant ? '₹0.8L' : '₹7.0L'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="200" y2="200" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="204">
                {selectedRestaurant ? '₹0.7L' : '₹6.5L'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="231" y2="231" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="235">
                {selectedRestaurant ? '₹0.6L' : '₹6.0L'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="262" y2="262" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="266">
                {selectedRestaurant ? '₹0.5L' : '₹5.5L'}
              </text>

              <line stroke="#F1F5F9" strokeWidth="1.25" x1="55" x2="745" y1="293" y2="293" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="297">
                {selectedRestaurant ? '₹0.4L' : '₹5.0L'}
              </text>

              <line stroke="#E2E8F0" strokeWidth="1.25" x1="55" x2="745" y1="325" y2="325" />
              <text className="text-[12px]" fill="#94A3B8" textAnchor="end" x="44" y="329">
                {selectedRestaurant ? '₹0.3L' : '₹4.5L'}
              </text>

              {/* 2026 Area Gradient Fill under solid green line */}
              <polygon
                fill="url(#novGreenGradient)"
                points="75,325 75,150 136,218 197,76 258,150 319,64 380,244 380,325"
              />

              {/* 2025 Dashed Grey Line */}
              <path
                d="M 75 237 L 136 312 L 197 268 L 258 256 L 319 225 L 380 244 L 441 256 L 502 219 L 563 219 L 624 132 L 685 175 L 735 163"
                fill="none"
                stroke="#94A3B8"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />

              {/* 2025 Node Rings */}
              <g fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2">
                {[
                  [75, 237], [136, 312], [197, 268], [258, 256],
                  [319, 225], [380, 244], [441, 256], [502, 219],
                  [563, 219], [624, 132], [685, 175], [735, 163]
                ].map(([cx, cy], idx) => (
                  <circle key={idx} cx={cx} cy={cy} r="4.5" />
                ))}
              </g>

              {/* 2025 Value Annotations */}
              <g className="text-[11px] font-semibold" fill="#94A3B8" textAnchor="middle">
                {activeChartData.map((pt, idx) => {
                  const xs = [75, 136, 197, 258, 319, 380, 441, 502, 563, 624, 685, 735];
                  const ys = [227, 300, 257, 245, 214, 234, 245, 208, 208, 120, 163, 151];
                  return (
                    <text key={idx} x={xs[idx]} y={ys[idx]}>
                      {pt.revLabel2025}
                    </text>
                  );
                })}
              </g>

              {/* 2026 Current Period: Solid Green Line */}
              <path
                d="M 75 150 C 95 170, 115 218, 136 218 C 158 218, 175 76, 197 76 C 218 76, 238 150, 258 150 C 278 150, 298 64, 319 64 C 342 64, 360 244, 380 244"
                fill="none"
                stroke="#006C49"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />

              {/* 2026 Interactive Nodes */}
              <g fill="#FFFFFF" stroke="#006C49" strokeWidth="2.5">
                {[
                  { cx: 75, cy: 150, idx: 0, r: 5.5 },
                  { cx: 136, cy: 218, idx: 1, r: 5.5 },
                  { cx: 197, cy: 76, idx: 2, r: 6, filter: 'url(#greenGlow)' },
                  { cx: 258, cy: 150, idx: 3, r: 5.5 },
                  { cx: 319, cy: 64, idx: 4, r: 6, filter: 'url(#greenGlow)' },
                  { cx: 380, cy: 244, idx: 5, r: 5.5 },
                ].map((pt) => {
                  const dataPt = activeChartData[pt.idx];
                  return (
                    <circle
                      key={pt.idx}
                      cx={pt.cx}
                      cy={pt.cy}
                      r={hoveredRevPoint?.index === pt.idx ? 8 : pt.r}
                      filter={pt.filter}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() =>
                        setHoveredRevPoint({
                          index: pt.idx,
                          month: dataPt.month,
                          rev2026: dataPt.revenue2026,
                          rev2025: dataPt.revenue2025,
                          x: pt.cx,
                          y: pt.cy,
                        })
                      }
                      onMouseLeave={() => setHoveredRevPoint(null)}
                    />
                  );
                })}
              </g>

              {/* 2026 Direct Value Labels above Nodes in Green */}
              <g className="text-[11px] font-semibold" fill="#006C49" textAnchor="middle">
                {activeChartData.slice(0, 6).map((pt, idx) => {
                  const xs = [75, 136, 197, 258, 319, 380];
                  const ys = [137, 205, 61, 137, 49, 231];
                  return (
                    <text key={idx} x={xs[idx]} y={ys[idx]}>
                      {pt.revLabel2026 || `₹${pt.revenue2026}L`}
                    </text>
                  );
                })}
              </g>

              {/* X-Axis Month Labels */}
              <g className="text-[12px]" fill="#737686" textAnchor="middle">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
                  (m, idx) => {
                    const xs = [75, 136, 197, 258, 319, 380, 441, 502, 563, 624, 685, 735];
                    return (
                      <text key={m} x={xs[idx]} y="352">
                        {m}
                      </text>
                    );
                  }
                )}
              </g>
            </svg>

            {/* Hover Tooltip Box for Revenue */}
            {hoveredRevPoint && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl"
                style={{
                  left: `${(hoveredRevPoint.x / 760) * 100}%`,
                  top: `${(hoveredRevPoint.y / 380) * 100 - 15}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="font-semibold text-slate-200">
                  {selectedRestaurant ? `${selectedRestaurant.id} · ` : ''}
                  {hoveredRevPoint.month} 2026 Revenue
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-emerald-400 font-bold">₹{hoveredRevPoint.rev2026}L</span>
                  <span className="text-slate-400">vs ₹{hoveredRevPoint.rev2025}L (2025)</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-0.5">
                  +{(((hoveredRevPoint.rev2026! - hoveredRevPoint.rev2025) / hoveredRevPoint.rev2025) * 100).toFixed(1)}% Expansion
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-2">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="inline-block w-4 h-3 border-2 border-dashed border-[#737686] rounded-xs"></span>
              <span className="text-[12px] text-[#434655] font-medium">2025</span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="inline-block w-3.5 h-3.5 bg-[#006c49] rounded-xs"></span>
              <span className="text-[12px] text-[#0b1c30] font-semibold">2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Insights & High-Value Performance Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Recent High-Performance Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/60 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] text-[#0b1c30] font-semibold">
                  {selectedRestaurant ? `${selectedRestaurant.id} Fulfillment Logs` : 'Recent High-Performance Orders'}
                </h3>
                {selectedRestaurant && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-[#2563eb] font-bold">
                    Filtered by Restaurant
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[#737686] mt-0.5">
                {selectedRestaurant
                  ? `Telemetry logs and hardware equipment dispatched for ${selectedRestaurant.name}`
                  : 'Top transaction logs from the recent surge cycle across Tier-1 enterprise accounts'}
              </p>
            </div>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`px-3 py-1.5 rounded-lg border text-[12px] font-medium flex items-center gap-1 transition-colors ${
                  statusFilter !== 'all'
                    ? 'bg-blue-50 border-blue-300 text-[#2563eb]'
                    : 'bg-[#eff4ff] border-slate-200/70 text-[#434655] hover:text-[#0b1c30]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                <span>Filter {statusFilter !== 'all' ? `(${statusFilter})` : ''}</span>
              </button>

              {showFilterMenu && (
                <div className="absolute right-24 top-9 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30">
                  <div className="px-3 py-1 text-[10px] font-semibold text-[#737686] uppercase">Filter by Status</div>
                  {['all', 'Completed', 'Processing'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setShowFilterMenu(false);
                        setCurrentPage(1);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 capitalize"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => onNavigate('orders-and-revenue')}
                className="px-3 py-1.5 rounded-lg bg-[#eff4ff] border border-slate-200/70 text-[#0b1c30] text-[12px] font-medium hover:bg-[#e5eeff] transition-colors"
              >
                View All (1,248)
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#eff4ff]/80 text-[#737686] text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-lg">Order ID</th>
                  <th className="py-2.5 px-3">Restaurant / Node</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Value (INR)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">YoY Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 text-[#0b1c30] text-[13px]">
                {displayedOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => onSelectOrder(ord)}
                    className="hover:bg-[#eff4ff]/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3 font-semibold text-[#2563eb] group-hover:underline">
                      {ord.id}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            ord.clientInitials === 'TL'
                              ? 'bg-blue-100 text-[#2563eb]'
                              : ord.clientInitials === 'RI'
                              ? 'bg-[#e8fbf3] text-[#006c49]'
                              : ord.clientInitials === 'ZK'
                              ? 'bg-[#e5eeff] text-[#3e3fcc]'
                              : 'bg-blue-100 text-[#2563eb]'
                          }`}
                        >
                          {ord.clientInitials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-[#0b1c30] leading-tight">
                            {ord.restaurantName || ord.clientName}
                          </span>
                          <span className="text-[#737686] text-[11px] font-mono">
                            {ord.restaurantId} · {ord.location}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[#434655]">
                      {ord.category}
                    </td>
                    <td className="py-3.5 px-3 text-[#737686]">
                      {ord.date}
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold text-[#0b1c30] tabular-nums">
                      ₹{ord.value.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          ord.status === 'Completed'
                            ? 'bg-[#e8fbf3] text-[#006c49]'
                            : ord.status === 'Processing'
                            ? 'bg-[#e5eeff] text-[#0b1c30]'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-[#006c49] font-semibold tabular-nums">
                      {ord.yoyDelta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary & Pagination */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[#737686] text-[12px]">
            <span>
              {selectedRestaurant
                ? `Displaying ${displayedOrders.length} telemetry logs for ${selectedRestaurant.id}`
                : `Displaying latest ${displayedOrders.length} of 48 Tier-1 Accounts`}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-[#eff4ff] text-[#434655] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="text-[12px] font-medium text-[#0b1c30]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded hover:bg-[#eff4ff] text-[#434655] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Key Performance Takeaways & Strategic Notes */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] text-[#0b1c30] font-semibold">
                  {selectedRestaurant ? `${selectedRestaurant.id} Insights` : 'Executive Insights'}
                </h3>
                <span className="material-symbols-outlined text-[#737686] text-[20px]">psychology</span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Takeaway 1 */}
                <div className="p-3.5 rounded-lg bg-[#eff4ff] flex flex-col gap-1 border border-blue-100/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#0b1c30]">
                      {selectedRestaurant ? `${selectedRestaurant.chain} Surge Peak` : 'May Velocity Spike'}
                    </span>
                    <span className="text-[11px] text-[#006c49] font-bold">
                      {selectedRestaurant ? `₹${selectedRestaurant.netRevenueLakhs}L NOV` : '₹8.7L Revenue'}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#434655] leading-relaxed">
                    {selectedRestaurant
                      ? `Outlet performance in ${selectedRestaurant.city} registered ${selectedRestaurant.ordersYoyDelta} expansion. Supported by ${selectedRestaurant.equipmentInstalled.join(', ')}.`
                      : 'May 2026 registered twin historic peaks matching 2.6K orders. Propelled predominantly by Enterprise Q2 contract closures before mid-year auditing.'}
                  </p>
                </div>

                {/* Takeaway 2 */}
                <div className="p-3.5 rounded-lg bg-[#eff4ff] flex flex-col gap-1 border border-blue-100/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#0b1c30]">
                      {selectedRestaurant ? 'Kitchen Preparation SLA' : 'June Correction Pattern'}
                    </span>
                    <span className="text-[11px] text-[#737686] font-medium">
                      {selectedRestaurant ? `${selectedRestaurant.slaMinutes}m Average` : 'Expected Seasonal'}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#434655] leading-relaxed">
                    {selectedRestaurant
                      ? `Average dispatch window maintains ${selectedRestaurant.fulfillmentRate}% compliance. Cold-chain probe calibration fully synchronized.`
                      : 'June dip to 1.6K orders (₹5.8L) mirrors the FY 2025 seasonal inventory recalculation window (1.8K / ₹5.8L), indicating consistent cyclicality.'}
                  </p>
                </div>

                {/* Takeaway 3 */}
                <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200/60 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#2563eb]">
                      {selectedRestaurant ? 'Annual Run-Rate Projection' : 'Q3 Projected Trajectory'}
                    </span>
                    <span className="text-[11px] text-[#2563eb] font-bold">
                      {selectedRestaurant ? `Target ₹${(selectedRestaurant.netRevenueLakhs * 1.8).toFixed(1)}L` : 'Target ₹22.4L'}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#434655] leading-relaxed">
                    {selectedRestaurant
                      ? `Projected annual order volume exceeds ${Math.round(selectedRestaurant.totalOrdersYTD * 1.9).toLocaleString('en-IN')} units. Active expansion in ${selectedRestaurant.zone}.`
                      : 'Comparative 2025 baseline highlights a strong October breakout (₹7.6L / 2.4K). Pre-procurement pipeline indicates ~28% upside entering Q3.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress to Annual Milestone */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="text-[#0b1c30] font-medium">
                  {selectedRestaurant ? `${selectedRestaurant.id} Annual Target` : 'FY 2026 Revenue Target'}
                </span>
                <span className="text-[#2563eb] font-semibold tabular-nums">
                  {selectedRestaurant ? '64.2% of Target' : '58.8% of ₹75.0L'}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden border border-slate-200/40">
                <div
                  className="h-full bg-[#2563eb] rounded-full transition-all duration-700"
                  style={{ width: selectedRestaurant ? '64.2%' : '58.8%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
