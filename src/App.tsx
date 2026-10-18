/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavigationTab, Order, Restaurant, KAMUser, GoogleSheetConfig } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { RestaurantsView } from './components/RestaurantsView';
import { OrdersView } from './components/OrdersView';
import { CustomersView } from './components/CustomersView';
import { InventoryView } from './components/InventoryView';
import { MarketingView } from './components/MarketingView';
import { SettingsView } from './components/SettingsView';
import { OrderDetailModal } from './components/OrderDetailModal';
import { ExportModal } from './components/ExportModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { RestaurantFilterModal } from './components/RestaurantFilterModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { KAMLoginModal } from './components/KAMLoginModal';
import { MasterSheetView } from './components/MasterSheetView';
import { KAM_ROSTER, FEATURED_RESTAURANTS, COLLATED_MASTER_FLEET, getRestaurantsForKam } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantFilterOpen, setRestaurantFilterOpen] = useState(false);
  const [googleSheetSyncOpen, setGoogleSheetSyncOpen] = useState(false);
  const [kamLoginModalOpen, setKamLoginModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [dateRange, setDateRange] = useState('Jan 2026 - Dec 2026');
  const [globalSearch, setGlobalSearch] = useState('');

  // Active Restaurant Database (Pre-collated master sheet for all KAMs, auto-filtered per login session)
  const [restaurants, setRestaurants] = useState<Restaurant[]>(COLLATED_MASTER_FLEET);

  // Active KAM Roster
  const [kamRoster, setKamRoster] = useState<KAMUser[]>(KAM_ROSTER);

  // Default to Mahir Dadi (Senior Strategic KAM, matching user session mahir.dadi@zomato.com)
  const [currentKam, setCurrentKam] = useState<KAMUser>(KAM_ROSTER[0]);

  // Google Sheet Configuration
  const [googleSheetConfig, setGoogleSheetConfig] = useState<GoogleSheetConfig>({
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1ZOMATO_KAM_RESTAURANT_MAPPING_2026/edit',
    sheetName: 'KAM_Restaurant_Mapping',
    lastSyncTime: '14:02 IST',
    status: 'connected',
    rowsCount: 10482,
    autoSyncMinutes: 5,
    kamColumn: 'KAM Email',
    restaurantIdColumn: 'Restaurant ID',
  });

  const handleSearchChange = (q: string) => {
    setGlobalSearch(q);
  };

  const handleSelectRestaurantAndNavigate = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchKam = (kam: KAMUser) => {
    setCurrentKam(kam);
    setSelectedRestaurant(null); // Reset to view newly assigned KAM portfolio
  };

  const handleAddNewKam = (newKam: KAMUser) => {
    setKamRoster((prev) => [...prev, newKam]);
  };

  const handleApplySheetData = (sheetRestaurants: Restaurant[]) => {
    if (!sheetRestaurants || sheetRestaurants.length === 0) return;

    setRestaurants((prev) => {
      const map = new Map<string, Restaurant>();
      prev.forEach((r) => map.set(r.id.toUpperCase(), r));
      sheetRestaurants.forEach((r) => map.set(r.id.toUpperCase(), r));
      const updatedList = Array.from(map.values());

      // Recalculate counts for KAM roster
      setKamRoster((prevKams) =>
        prevKams.map((k) => {
          if (k.isAdmin) return k;
          const assignedCount = updatedList.filter(
            (r) => r.kamId === k.id || r.kamEmail.toLowerCase() === k.email.toLowerCase()
          ).length;
          return {
            ...k,
            assignedRestaurantCount: Math.max(assignedCount, k.assignedRestaurantCount),
          };
        })
      );

      // Update current KAM mapped count
      if (!currentKam.isAdmin) {
        const count = updatedList.filter(
          (r) => r.kamId === currentKam.id || r.kamEmail.toLowerCase() === currentKam.email.toLowerCase()
        ).length;
        setCurrentKam((prev) => ({
          ...prev,
          assignedRestaurantCount: Math.max(count, prev.assignedRestaurantCount),
        }));
      }

      return updatedList;
    });
  };

  // Mapped restaurants for the active KAM
  const mappedPool = getRestaurantsForKam(currentKam, restaurants);
  const mappedRestaurantCount = currentKam.isAdmin ? 10482 : mappedPool.length > 0 ? mappedPool.length : currentKam.assignedRestaurantCount;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        currentKam={currentKam}
        onOpenKAMLogin={() => setKamLoginModalOpen(true)}
        onOpenGoogleSheetSync={() => setGoogleSheetSyncOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">
        {/* Fixed Top Header with KAM Profile & Switcher */}
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenQuickSearch={() => setQuickSearchOpen(true)}
          dateRange={dateRange}
          onSelectDateRange={setDateRange}
          searchQuery={globalSearch}
          onSearchChange={handleSearchChange}
          selectedRestaurant={selectedRestaurant}
          onOpenRestaurantFilter={() => setRestaurantFilterOpen(true)}
          onClearRestaurant={() => setSelectedRestaurant(null)}
          currentKam={currentKam}
          onSwitchKam={handleSwitchKam}
          onOpenGoogleSheetSync={() => setGoogleSheetSyncOpen(true)}
          onOpenKAMLogin={() => setKamLoginModalOpen(true)}
          googleSheetConfig={googleSheetConfig}
          mappedRestaurantCount={mappedRestaurantCount}
        />

        {/* Content Viewport */}
        <main className="w-full pt-20 px-4 sm:px-6 lg:px-8 py-6 flex-1 max-w-[1600px] mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onSelectOrder={setSelectedOrder}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenExport={() => setExportModalOpen(true)}
              selectedRestaurant={selectedRestaurant}
              onOpenRestaurantFilter={() => setRestaurantFilterOpen(true)}
              onClearRestaurant={() => setSelectedRestaurant(null)}
              currentKam={currentKam}
              onOpenGoogleSheetSync={() => setGoogleSheetSyncOpen(true)}
            />
          )}

          {activeTab === 'restaurants' && (
            <RestaurantsView
              onSelectAndNavigate={handleSelectRestaurantAndNavigate}
              currentKam={currentKam}
              onOpenGoogleSheetSync={() => setGoogleSheetSyncOpen(true)}
              onSwitchKam={handleSwitchKam}
              restaurants={restaurants}
              onOpenKAMLogin={() => setKamLoginModalOpen(true)}
            />
          )}

          {activeTab === 'master-sheet' && (
            <MasterSheetView
              restaurants={restaurants}
              currentKam={currentKam}
              onSwitchKam={handleSwitchKam}
              onSelectAndNavigate={handleSelectRestaurantAndNavigate}
              onOpenGoogleSheetSync={() => setGoogleSheetSyncOpen(true)}
            />
          )}

          {activeTab === 'orders-and-revenue' && (
            <OrdersView
              onSelectOrder={setSelectedOrder}
              onOpenExport={() => setExportModalOpen(true)}
              initialSearch={globalSearch}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={setSelectedRestaurant}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView />
          )}

          {activeTab === 'inventory' && (
            <InventoryView />
          )}

          {activeTab === 'marketing-analytics' && (
            <MarketingView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />

      <RestaurantFilterModal
        isOpen={restaurantFilterOpen}
        onClose={() => setRestaurantFilterOpen(false)}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={(r) => setSelectedRestaurant(r)}
        currentKam={currentKam}
        restaurants={restaurants}
        onOpenGoogleSheetSync={() => setGoogleSheetSyncOpen(true)}
      />

      <GoogleSheetSyncModal
        isOpen={googleSheetSyncOpen}
        onClose={() => setGoogleSheetSyncOpen(false)}
        config={googleSheetConfig}
        onSaveConfig={setGoogleSheetConfig}
        onApplySheetData={handleApplySheetData}
        currentKam={currentKam}
        kamRoster={kamRoster}
      />

      <KAMLoginModal
        isOpen={kamLoginModalOpen}
        onClose={() => setKamLoginModalOpen(false)}
        currentKam={currentKam}
        kamRoster={kamRoster}
        onSelectKam={handleSwitchKam}
        onAddNewKam={handleAddNewKam}
        onOpenGoogleSheetSync={() => setGoogleSheetSyncOpen(true)}
      />

      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectOrder={(ord) => setSelectedOrder(ord)}
        onSelectRestaurant={(r) => {
          setSelectedRestaurant(r);
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}
