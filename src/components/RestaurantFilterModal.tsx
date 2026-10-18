import React, { useState, useMemo } from 'react';
import { Restaurant, KAMUser } from '../types';
import { FEATURED_RESTAURANTS, findOrCreateRestaurant, getRestaurantsForKam } from '../data/mockData';

interface RestaurantFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant | null) => void;
  currentKam: KAMUser;
  restaurants?: Restaurant[];
  onOpenGoogleSheetSync?: () => void;
}

export const RestaurantFilterModal: React.FC<RestaurantFilterModalProps> = ({
  isOpen,
  onClose,
  selectedRestaurant,
  onSelectRestaurant,
  currentKam,
  restaurants,
  onOpenGoogleSheetSync,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedChain, setSelectedChain] = useState<string>('All');

  const cities = ['All', 'Gurugram', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai'];
  const chains = ['All', 'Zomato Kitchens', 'Biryani By Kilo', "Haldiram's", 'Burger King India', 'Chai Point', 'Social Offline', 'Behrouz Biryani', 'Wow! Momo'];

  // Scoped to the logged-in KAM's portfolio
  const kamPool = useMemo(() => {
    const pool = restaurants && restaurants.length > 0 ? restaurants : FEATURED_RESTAURANTS;
    return getRestaurantsForKam(currentKam, pool);
  }, [currentKam, restaurants]);

  const filteredRestaurants = useMemo(() => {
    let list = kamPool;

    if (selectedCity !== 'All') {
      list = list.filter((r) => r.city.toLowerCase() === selectedCity.toLowerCase());
    }

    if (selectedChain !== 'All') {
      list = list.filter((r) => r.chain.toLowerCase().includes(selectedChain.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const direct = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.chain.toLowerCase().includes(q) ||
          r.zone.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q)
      );

      // If user typed a numeric ID or custom ID not in direct featured list
      if (direct.length === 0) {
        const dynamicRes = findOrCreateRestaurant(searchQuery, currentKam);
        if (dynamicRes) {
          return [dynamicRes];
        }
      }
      return direct;
    }

    return list;
  }, [kamPool, searchQuery, selectedCity, selectedChain, currentKam]);

  if (!isOpen) return null;

  const handleSelect = (r: Restaurant | null) => {
    onSelectRestaurant(r);
    onClose();
  };

  const handleDirectIdSearch = () => {
    if (!searchQuery.trim()) return;
    const dynamicRes = findOrCreateRestaurant(searchQuery, currentKam);
    if (dynamicRes) {
      handleSelect(dynamicRes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0b1c30]">Select Restaurant Entity</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100/70 text-[#2563eb]">
                  {currentKam.isAdmin ? '10,482 Central Fleet' : `${kamPool.length} in Your Portfolio`}
                </span>
              </div>
              <p className="text-xs text-[#737686]">
                Filtering for <strong className="text-slate-800">{currentKam.name}</strong> ({currentKam.role} · {currentKam.region}).
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

        {/* KAM Access Notice */}
        {!currentKam.isAdmin && (
          <div className="px-5 py-2 bg-blue-50/60 border-b border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#2563eb]">verified_user</span>
              <span>
                KAM Access Restriction Active: Only restaurants mapped to <strong>{currentKam.email}</strong> are visible.
              </span>
            </div>
            <span className="font-mono text-[10px] text-blue-700 bg-white px-1.5 py-0.2 rounded border border-blue-200">
              {currentKam.id}
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-2 bg-[#eff4ff] border border-[#c3c6d7]/60 rounded-xl px-3.5 py-2.5 focus-within:border-[#2563eb] focus-within:bg-white transition-all shadow-2xs">
            <span className="material-symbols-outlined text-[20px] text-[#737686]">search</span>
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDirectIdSearch();
                }
              }}
              placeholder="Search Restaurant ID (e.g. REST-10492 or 10492), chain, outlet name..."
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#0b1c30] placeholder-[#737686]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Tags (City and Chain) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#737686] font-semibold uppercase mr-1">City:</span>
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedCity === city
                    ? 'bg-[#2563eb] text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-[#434655] hover:bg-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2.5 divide-y divide-slate-100 flex-1">
          {/* Option to clear filter and view all mapped */}
          <div
            onClick={() => handleSelect(null)}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              !selectedRestaurant
                ? 'border-[#2563eb] bg-blue-50/60 shadow-xs'
                : 'border-slate-200/70 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-200/60 text-slate-700 flex items-center justify-center font-bold text-xs">
                ALL
              </div>
              <div>
                <div className="font-bold text-xs text-[#0b1c30] flex items-center gap-2">
                  <span>All Mapped Restaurants ({currentKam.name} Portfolio)</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {currentKam.assignedRestaurantCount} Outlets
                  </span>
                </div>
                <p className="text-[11px] text-[#737686]">
                  Aggregated telemetry across your assigned partner restaurants in {currentKam.region}
                </p>
              </div>
            </div>
            {!selectedRestaurant ? (
              <span className="text-xs font-semibold text-[#2563eb] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Active
              </span>
            ) : (
              <button className="text-xs text-[#2563eb] font-semibold hover:underline">Select</button>
            )}
          </div>

          {/* Restaurant Options */}
          <div className="pt-2 space-y-2">
            <div className="text-[11px] font-semibold text-[#737686] uppercase tracking-wider px-1">
              {filteredRestaurants.length > 0 ? `Your Mapped Outlets (${filteredRestaurants.length})` : 'Search Results'}
            </div>

            {filteredRestaurants.map((res) => {
              const isSelected = selectedRestaurant?.id === res.id;
              return (
                <div
                  key={res.id}
                  onClick={() => handleSelect(res)}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#2563eb] bg-blue-50/60 shadow-xs'
                      : 'border-slate-200/70 hover:bg-[#eff4ff]/60 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100/70 text-[#2563eb] flex flex-col items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                      <span>ID</span>
                      <span className="text-[9px]">{res.id.replace('REST-', '')}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[#0b1c30]">{res.name}</span>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {res.id}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                            res.status === 'Peak Surge'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#737686] mt-0.5">
                        {res.zone}, {res.city} · <span className="text-slate-600">{res.cuisine}</span> · ★ {res.rating}
                      </div>
                      <div className="text-[10px] text-indigo-700 font-medium mt-0.5">
                        Assigned KAM: {res.kamName} ({res.kamEmail})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#0b1c30] tabular-nums">
                        {res.totalOrdersYTD.toLocaleString('en-IN')} Orders
                      </div>
                      <div className="text-[11px] text-[#006c49] font-medium tabular-nums">
                        ₹{res.netRevenueLakhs}L NOV ({res.ordersYoyDelta})
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#2563eb] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-[#2563eb] hover:text-white text-slate-700'
                      }`}
                    >
                      {isSelected ? 'Viewing' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredRestaurants.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-[32px] text-slate-400">search_off</span>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  No restaurants in {currentKam.name}'s portfolio matched "{searchQuery}"
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Type any 4-5 digit Restaurant ID to search or map this outlet to your portfolio.
                </p>
                {searchQuery && (
                  <button
                    onClick={handleDirectIdSearch}
                    className="mt-3 px-3.5 py-1.5 bg-[#2563eb] text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                  >
                    Load Data for ID "{searchQuery}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-[#737686] text-[11px]">
            Google Sheet synced · Showing portfolio for <strong>{currentKam.name}</strong>
          </div>
          <div className="flex items-center gap-2">
            {selectedRestaurant && (
              <button
                onClick={() => handleSelect(null)}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
              >
                Clear Restaurant Filter
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-900 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
