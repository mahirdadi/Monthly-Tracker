import React, { useState, useRef, useEffect } from 'react';
import { Restaurant, KAMUser, GoogleSheetConfig } from '../types';
import { KAM_ROSTER } from '../data/mockData';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenQuickSearch: () => void;
  dateRange: string;
  onSelectDateRange: (range: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRestaurant: Restaurant | null;
  onOpenRestaurantFilter: () => void;
  onClearRestaurant: () => void;
  currentKam: KAMUser;
  onSwitchKam: (kam: KAMUser) => void;
  onOpenGoogleSheetSync: () => void;
  onOpenKAMLogin: () => void;
  googleSheetConfig: GoogleSheetConfig;
  mappedRestaurantCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenQuickSearch,
  dateRange,
  onSelectDateRange,
  searchQuery,
  onSearchChange,
  selectedRestaurant,
  onOpenRestaurantFilter,
  onClearRestaurant,
  currentKam,
  onSwitchKam,
  onOpenGoogleSheetSync,
  onOpenKAMLogin,
  googleSheetConfig,
  mappedRestaurantCount,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateOptions = [
    { label: 'Jan 2026 - Dec 2026', desc: 'Full Financial Year 2026' },
    { label: 'Jan 2026 - Jun 2026 (YTD)', desc: 'Current Reporting Cycle' },
    { label: 'Q1 2026 (Jan - Mar)', desc: 'First Quarter Audit' },
    { label: 'Q2 2026 (Apr - Jun)', desc: 'Surge Cycle & Audits' },
    { label: 'FY 2025 (Historical Baseline)', desc: 'Previous Annual Data' },
  ];

  const notifications = [
    {
      id: '1',
      title: 'Google Sheet Sync Completed',
      desc: `10,482 restaurant records refreshed from Google Sheet. ${currentKam.name} portfolio up to date.`,
      time: 'Just now',
      unread: true,
    },
    {
      id: '2',
      title: 'May Revenue Milestone Surpassed',
      desc: 'Target ₹8.5L exceeded with ₹8.7L closing figure (+24.3%).',
      time: '1h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'KAM Territory Reallocation',
      desc: '3 new dark kitchen clusters assigned to your portfolio in Gurugram.',
      time: '3h ago',
      unread: false,
    },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-[#c3c6d7]/50 z-40 flex items-center justify-between px-3 sm:px-6">
      {/* Left: Hamburger (mobile) + Search */}
      <div className="flex items-center gap-2.5 w-full max-w-xs sm:max-w-sm">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation drawer"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="relative w-full">
          <div className="flex items-center gap-2 w-full bg-[#eff4ff] border border-[#c3c6d7]/50 rounded-lg px-3 py-1.5 focus-within:border-[#2563eb] focus-within:bg-white transition-all shadow-2xs">
            <span className="material-symbols-outlined text-[18px] text-[#737686]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search metrics, orders, reports..."
              className="w-full bg-transparent border-none outline-none text-[13px] text-[#0b1c30] placeholder-[#737686]"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="text-[#737686] hover:text-[#0b1c30] text-xs px-1"
              >
                ×
              </button>
            ) : (
              <button
                onClick={onOpenQuickSearch}
                className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#737686] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs hover:border-slate-300"
                title="Quick Search (⌘K)"
              >
                ⌘K
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Google Sheet Sync Trigger Button */}
        <button
          onClick={onOpenGoogleSheetSync}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-[12px] font-medium transition-all shadow-2xs"
          title="Google Sheet Live Sync Status"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="material-symbols-outlined text-[16px] text-emerald-700">table_chart</span>
          <span className="font-semibold">Sheet Sync</span>
          <span className="text-[10px] bg-white/80 px-1 py-0.2 rounded text-emerald-900 border border-emerald-200">
            Active
          </span>
        </button>

        {/* Restaurant ID Filter Button (Scoped to KAM) */}
        <div className="relative">
          {selectedRestaurant ? (
            <div className="flex items-center bg-blue-50 border border-blue-200 text-[#2563eb] rounded-lg pl-2 pr-1 py-1 text-[12px] font-medium shadow-2xs">
              <button
                onClick={onOpenRestaurantFilter}
                className="flex items-center gap-1.5 hover:underline font-semibold text-left max-w-[120px] sm:max-w-[190px] truncate"
                title={`${selectedRestaurant.id}: ${selectedRestaurant.name}`}
              >
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                <span className="font-mono text-[11px] bg-white text-[#2563eb] px-1 py-0.2 rounded border border-blue-200">
                  {selectedRestaurant.id}
                </span>
                <span className="truncate hidden sm:inline">{selectedRestaurant.name}</span>
              </button>
              <button
                onClick={onClearRestaurant}
                className="ml-1 p-0.5 rounded hover:bg-blue-200/60 text-blue-700 transition-colors"
                title="Clear restaurant filter"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenRestaurantFilter}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-white border border-[#c3c6d7]/60 rounded-lg text-[#0b1c30] text-[12px] font-medium shadow-xs hover:bg-[#eff4ff] transition-colors"
              title={`Filter by Restaurant ID (${mappedRestaurantCount} available for ${currentKam.name})`}
            >
              <span className="material-symbols-outlined text-[17px] text-[#2563eb]">storefront</span>
              <span className="hidden xl:inline text-slate-500">Outlets:</span>
              <span className="font-semibold text-[#0b1c30]">{mappedRestaurantCount}</span>
              <span className="material-symbols-outlined text-[15px] text-[#737686]">arrow_drop_down</span>
            </button>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-white border border-[#c3c6d7]/60 rounded-lg text-[#0b1c30] text-[12px] font-medium shadow-xs hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#737686]">calendar_today</span>
            <span className="hidden sm:inline">{dateRange}</span>
            <span className="sm:hidden text-xs">FY26</span>
            <span className="material-symbols-outlined text-[15px] text-[#737686]">arrow_drop_down</span>
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-[#737686] uppercase tracking-wider">
                Select Time Window
              </div>
              {dateOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    onSelectDateRange(opt.label);
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-blue-50 transition-colors ${
                    dateRange === opt.label ? 'bg-blue-50/80 font-semibold text-[#2563eb]' : 'text-slate-700'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-[11px] text-[#737686]">{opt.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-lg text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#2563eb]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[11px] font-semibold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-full">
                  Google Sheet Connected
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                      n.unread ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KAM User Profile & Quick Switcher */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#eff4ff] transition-colors text-left"
            title="Logged in as Key Account Manager. Click to switch KAM or link Google Sheet."
          >
            <div className="relative">
              <img
                alt={currentKam.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                src={currentKam.avatarUrl}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" title="Active KAM Session"></span>
            </div>
            <div className="hidden lg:flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[12px] text-[#0b1c30] font-bold leading-none">
                  {currentKam.name}
                </span>
                <span className="text-[9px] bg-blue-100 text-[#2563eb] font-semibold px-1 rounded">
                  {currentKam.isAdmin ? 'ADMIN' : 'KAM'}
                </span>
              </div>
              <span className="text-[10px] text-[#737686] leading-none mt-1">
                {currentKam.role}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400 hidden lg:inline">
              expand_more
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Current KAM Header */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <img
                    alt={currentKam.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    src={currentKam.avatarUrl}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900">{currentKam.name}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#2563eb]">
                        {currentKam.isAdmin ? 'Admin' : 'KAM'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">{currentKam.email}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      {mappedRestaurantCount} Restaurants Mapped to Portfolio
                    </p>
                  </div>
                </div>
              </div>

              {/* KAM Switcher Section */}
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737686] block mb-1">
                  Switch Active KAM Profile (Role Simulation)
                </span>
                <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                  {KAM_ROSTER.map((kam) => {
                    const isCurrent = currentKam.id === kam.id;
                    return (
                      <button
                        key={kam.id}
                        onClick={() => {
                          onSwitchKam(kam);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                          isCurrent
                            ? 'bg-blue-50/80 border border-blue-200 font-semibold text-[#2563eb]'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            alt={kam.name}
                            src={kam.avatarUrl}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-semibold block">{kam.name}</span>
                            <span className="text-[10px] text-[#737686] block">{kam.role} · {kam.assignedRestaurantCount} outlets</span>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="material-symbols-outlined text-[16px] text-[#2563eb]">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Links */}
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenKAMLogin();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2563eb] rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#2563eb]">badge</span>
                  <span>KAM Roster & Login Portal</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenGoogleSheetSync();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">table_chart</span>
                  <span>Link / Sync Google Sheet Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
