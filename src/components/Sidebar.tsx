import React from 'react';
import { NavigationTab, KAMUser } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  currentKam?: KAMUser;
  onOpenKAMLogin?: () => void;
  onOpenGoogleSheetSync?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  currentKam,
  onOpenKAMLogin,
  onOpenGoogleSheetSync,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: string; count?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'restaurants', label: 'Restaurants', icon: 'storefront', count: '10.4K' },
    { id: 'master-sheet', label: 'Master Sheet (All KAMs)', icon: 'table_chart', count: 'Auto' },
    { id: 'orders-and-revenue', label: 'Orders & Revenue', icon: 'payments', count: '1,248' },
    { id: 'customers', label: 'Customers', icon: 'group', count: '48' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
    { id: 'marketing-analytics', label: 'Marketing Analytics', icon: 'insights' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-[#c3c6d7]/60 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#c3c6d7]/60">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
              <img
                alt="Ether Analytics Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1X6H6PLQSKH39ytdFP1KTFI582i9mL-p2PEfASX0gvSDVUSaEGUda53Pf7W3miQkAwnEhimFuCb6CbMVjD9kv2Q0bmflQzAlFog2Zo4tuI_q7OpxpU9LiNkL1SCcd6A0J4Nza6yB-FM1lbb-_xce5K3QICF2iBTqm2l75rH4Li-u76kf-ZyN8bNqcpCUH4MQmUi24-R7zNysI0ygKeTif01YpNRUtBpyoCUPBs-IU8LQQt5pD60X08cWA"
                onError={(e) => {
                  // Fallback if network blocked
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-[20px] tracking-tight text-[#0b1c30] font-semibold flex items-center gap-1">
                Ether
              </span>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Section Category Title */}
          <div className="px-4 py-2 mt-2">
            <span className="px-2 text-[11px] font-semibold text-[#737686] uppercase tracking-wider">
              Main Navigation
            </span>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-left font-medium text-[14px] ${
                    isActive
                      ? 'bg-[#2563eb] text-white font-semibold shadow-sm'
                      : 'text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isActive ? 'text-white' : 'text-[#737686]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.count && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-700/60 text-white'
                          : 'bg-slate-100 text-[#737686]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* KAM Portfolio Card */}
        {currentKam && (
          <div className="p-4 border-t border-[#c3c6d7]/60">
            <div className="p-3 bg-gradient-to-br from-blue-50/80 to-slate-50 rounded-xl border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-wider">
                  Active KAM
                </span>
                {onOpenKAMLogin && (
                  <button
                    onClick={onOpenKAMLogin}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                  >
                    Switch
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <img
                  src={currentKam.avatarUrl}
                  alt={currentKam.name}
                  className="w-8 h-8 rounded-full object-cover border border-blue-300"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {currentKam.name}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-semibold truncate">
                    {currentKam.isAdmin ? '10,482 Central Fleet' : `${currentKam.assignedRestaurantCount} Outlets Mapped`}
                  </p>
                </div>
              </div>

              {onOpenGoogleSheetSync && (
                <button
                  onClick={onOpenGoogleSheetSync}
                  className="w-full py-1.5 px-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">table_chart</span>
                  <span>Google Sheet Synced</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer Status Box */}
        <div className="p-4 border-t border-[#c3c6d7]/60">
          <div className="p-3.5 bg-[#eff4ff] rounded-lg border border-[#c3c6d7]/50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] text-[#0b1c30] font-semibold tracking-tight">
                Ether Cloud 2.4
              </span>
              <span className="text-[12px] text-[#737686]">
                Operational
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#006c49]"></span>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
