import React, { useState } from 'react';
import { INITIAL_ORDERS, FEATURED_RESTAURANTS } from '../data/mockData';
import { Order, Restaurant } from '../types';

interface OrdersViewProps {
  onSelectOrder: (order: Order) => void;
  onOpenExport: () => void;
  initialSearch?: string;
  selectedRestaurant?: Restaurant | null;
  onSelectRestaurant?: (restaurant: Restaurant | null) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  onSelectOrder,
  onOpenExport,
  initialSearch = '',
  selectedRestaurant,
  onSelectRestaurant,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRestId, setSelectedRestId] = useState<string>(selectedRestaurant?.id || 'All');

  const categories = ['All', 'Bulk Fleet Sensors', 'Cloud Node Modules', 'Thermal Dispensers', 'Rack Telemetry Kit'];
  const statuses = ['All', 'Completed', 'Processing'];

  const filtered = INITIAL_ORDERS.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.restaurantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ord.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || ord.status === selectedStatus;
    const matchesRestaurant = selectedRestId === 'All' || ord.restaurantId === selectedRestId;
    return matchesSearch && matchesCategory && matchesStatus && matchesRestaurant;
  });

  const totalValue = filtered.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Ether</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Operations</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563eb]">Orders & Revenue</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#0b1c30] tracking-tight">Orders & Revenue Ledger</h1>
          <p className="text-[14px] text-[#434655] mt-0.5">
            Full enterprise transaction records, restaurant-level invoice settlements, and shipment fulfillment states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563eb] text-white rounded-lg text-[12px] font-medium shadow-xs hover:bg-blue-700 transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      {/* Mini KPI row for Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#737686] uppercase tracking-wider">Filtered Revenue</span>
          <p className="text-2xl font-bold text-[#0b1c30] mt-1 tabular-nums">
            ₹{(totalValue / 100000).toFixed(2)}L
          </p>
          <span className="text-[11px] text-[#006c49] font-medium">+18.5% YoY Expansion</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#737686] uppercase tracking-wider">Order Volume</span>
          <p className="text-2xl font-bold text-[#0b1c30] mt-1 tabular-nums">{filtered.length} Orders</p>
          <span className="text-[11px] text-[#737686]">Active High-Performance Cohort</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#737686] uppercase tracking-wider">Average Dispatch SLA</span>
          <p className="text-2xl font-bold text-[#0b1c30] mt-1 tabular-nums">16.8 hrs</p>
          <span className="text-[11px] text-[#006c49] font-medium">Under &lt;24hrs Guaranteed</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#737686] uppercase tracking-wider">Settlement Health</span>
          <p className="text-2xl font-bold text-[#006c49] mt-1">100% Cleared</p>
          <span className="text-[11px] text-[#737686]">Zero delinquent balances</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#eff4ff] border border-[#c3c6d7]/60 rounded-lg px-3 py-1.5 w-full md:w-80">
          <span className="material-symbols-outlined text-[18px] text-[#737686]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Restaurant ID, order ID, outlet..."
            className="w-full bg-transparent border-none outline-none text-xs text-[#0b1c30] placeholder-[#737686]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Restaurant ID Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#737686] font-medium mr-1">Restaurant ID:</span>
            <select
              value={selectedRestId}
              onChange={(e) => {
                setSelectedRestId(e.target.value);
                if (onSelectRestaurant) {
                  const match = FEATURED_RESTAURANTS.find((r) => r.id === e.target.value);
                  onSelectRestaurant(match || null);
                }
              }}
              className="bg-[#eff4ff] border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:border-[#2563eb] font-mono"
            >
              <option value="All">All Outlets (10,482)</option>
              {FEATURED_RESTAURANTS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#737686] font-medium mr-1">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#eff4ff] border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:border-[#2563eb]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#737686] font-medium mr-1">Status:</span>
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

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/80 text-[#737686] text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200/50">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Restaurant ID & Outlet</th>
                <th className="py-3 px-4">Enterprise Hub</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fulfillment Date</th>
                <th className="py-3 px-4 text-right">Value (INR)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">YoY Delta</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0b1c30] text-[13px]">
              {filtered.map((ord) => (
                <tr
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className="hover:bg-[#eff4ff]/60 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-semibold text-[#2563eb] group-hover:underline">
                    {ord.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#2563eb] border border-blue-200">
                        {ord.restaurantId}
                      </span>
                      <span className="font-medium text-[#0b1c30]">{ord.restaurantName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
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
                      <div>
                        <span className="text-slate-800 text-xs font-medium">{ord.clientName}</span>
                        <div className="text-[#737686] text-[11px]">{ord.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#434655]">
                    {ord.category}
                  </td>
                  <td className="py-3.5 px-4 text-[#737686]">
                    {ord.date}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold tabular-nums text-[#0b1c30]">
                    ₹{ord.value.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        ord.status === 'Completed'
                          ? 'bg-[#e8fbf3] text-[#006c49]'
                          : 'bg-[#e5eeff] text-[#0b1c30]'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#006c49] font-semibold tabular-nums">
                    {ord.yoyDelta}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(ord);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-[#2563eb] rounded transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
