import React, { useState, useEffect } from 'react';
import { INITIAL_ORDERS, ENTERPRISE_CUSTOMERS, FEATURED_RESTAURANTS, findOrCreateRestaurant } from '../data/mockData';
import { NavigationTab, Order, Restaurant } from '../types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onSelectOrder: (order: Order) => void;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectOrder,
  onSelectRestaurant,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedRestaurants = FEATURED_RESTAURANTS.filter(
    (r) =>
      r.id.toLowerCase().includes(query.toLowerCase()) ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.chain.toLowerCase().includes(query.toLowerCase()) ||
      r.city.toLowerCase().includes(query.toLowerCase()) ||
      r.zone.toLowerCase().includes(query.toLowerCase())
  );

  const matchedOrders = INITIAL_ORDERS.filter(
    (o) =>
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      o.restaurantId.toLowerCase().includes(query.toLowerCase()) ||
      o.restaurantName.toLowerCase().includes(query.toLowerCase()) ||
      o.clientName.toLowerCase().includes(query.toLowerCase()) ||
      o.category.toLowerCase().includes(query.toLowerCase())
  );

  const matchedCustomers = ENTERPRISE_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const allNavItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'grid_view' },
    { id: 'restaurants', label: 'Restaurant Fleet Directory (10,482)', icon: 'storefront' },
    { id: 'master-sheet', label: 'Master Sheet — All KAMs Pre-Collated Fleet', icon: 'table_chart' },
    { id: 'orders-and-revenue', label: 'Orders & Revenue Analysis', icon: 'payments' },
    { id: 'customers', label: 'Enterprise Customers Directory', icon: 'group' },
    { id: 'inventory', label: 'Hardware Inventory & Telemetry', icon: 'inventory_2' },
    { id: 'marketing-analytics', label: 'Marketing Velocity & Pipeline', icon: 'insights' },
    { id: 'settings', label: 'System Configuration & Ether Cloud', icon: 'settings' },
  ];
  const navItems = allNavItems.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelectRestaurant = (r: Restaurant) => {
    if (onSelectRestaurant) {
      onSelectRestaurant(r);
    }
    onNavigate('dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-100">
        <div className="p-3.5 border-b border-slate-100 flex items-center gap-3">
          <span className="material-symbols-outlined text-[20px] text-[#737686]">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Restaurant ID (e.g. REST-10492), order ID, client, or navigation..."
            className="w-full bg-transparent border-none outline-none text-sm text-[#0b1c30] placeholder-slate-400"
          />
          <kbd className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 text-xs divide-y divide-slate-100">
          {/* Restaurant Match */}
          {matchedRestaurants.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-[#2563eb] uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">storefront</span>
                <span>Restaurants (10,482 Network)</span>
              </div>
              {matchedRestaurants.slice(0, 4).map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRestaurant(r)}
                  className="w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-blue-50 text-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#2563eb]">
                      {r.id}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{r.name}</span>
                      <div className="text-[11px] text-slate-400">{r.zone}, {r.city}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 tabular-nums">
                    ₹{r.netRevenueLakhs}L NOV
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation Section */}
          {navItems.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-[#737686] uppercase">Navigation</div>
              {navItems.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    onNavigate(n.id);
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 hover:bg-blue-50 text-slate-800 transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#2563eb]">{n.icon}</span>
                  <span className="font-medium">{n.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Orders Section */}
          {matchedOrders.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-[#737686] uppercase">
                Orders & Transactions
              </div>
              {matchedOrders.slice(0, 3).map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => {
                    onSelectOrder(ord);
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-blue-50 text-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#2563eb]">{ord.id}</span>
                    <span className="font-mono text-[10px] text-slate-500">{ord.restaurantId}</span>
                    <span>{ord.restaurantName || ord.clientName}</span>
                  </div>
                  <span className="font-semibold tabular-nums">₹{ord.value.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          )}

          {/* Customers Section */}
          {matchedCustomers.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-[#737686] uppercase">Enterprise Accounts</div>
              {matchedCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onNavigate('customers');
                    onClose();
                  }}
                  className="w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-blue-50 text-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-blue-100 text-[#2563eb] flex items-center justify-center font-bold text-[9px]">
                      {c.initials}
                    </div>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-slate-400 text-[11px]">{c.location}</span>
                  </div>
                  <span className="text-emerald-700 font-semibold">{c.annualRunRate} ARR</span>
                </button>
              ))}
            </div>
          )}

          {navItems.length === 0 && matchedOrders.length === 0 && matchedCustomers.length === 0 && matchedRestaurants.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
