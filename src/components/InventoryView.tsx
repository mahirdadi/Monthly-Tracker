import React, { useState } from 'react';
import { INVENTORY_ITEMS } from '../data/mockData';
import { InventoryItem } from '../types';

export const InventoryView: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');

  const warehouses = ['All', 'Mumbai Hub', 'Navi Mumbai Hub', 'Gurugram Logistics Depot', 'Bengaluru Tech Depot', 'Chennai Port Sector'];

  const filtered = items.filter(
    (it) => selectedWarehouse === 'All' || it.warehouse === selectedWarehouse
  );

  const handleRestock = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, stockLevel: it.stockLevel + 100, reorderStatus: 'Optimal' } : it))
    );
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Ether</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737686]">Logistics</span>
            <span className="text-[#c3c6d7] text-[11px]">/</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563eb]">Hardware Inventory</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#0b1c30] tracking-tight">Telemetry & Sensor Stocks</h1>
          <p className="text-[14px] text-[#434655] mt-0.5">
            Regional distribution node inventory, critical reorder thresholds, and telemetry kit availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#737686] font-medium">Warehouse Node:</span>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-white border border-[#c3c6d7]/70 text-xs rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:border-[#2563eb] shadow-xs"
          >
            {warehouses.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#737686] uppercase tracking-wider">Total Active Units</span>
          <p className="text-2xl font-bold text-[#0b1c30] mt-1 tabular-nums">
            {filtered.reduce((acc, it) => acc + it.stockLevel, 0).toLocaleString('en-IN')} Units
          </p>
          <span className="text-[11px] text-[#006c49] font-medium">Distributed across 5 Hubs</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#737686] uppercase tracking-wider">Stock Capital Value</span>
          <p className="text-2xl font-bold text-[#0b1c30] mt-1 tabular-nums">
            ₹{(filtered.reduce((acc, it) => acc + it.stockLevel * it.unitCost, 0) / 100000).toFixed(1)}L
          </p>
          <span className="text-[11px] text-[#737686]">Valuated at production cost</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/60 shadow-xs">
          <span className="text-[11px] font-semibold text-[#737686] uppercase tracking-wider">Stock Health</span>
          <p className="text-2xl font-bold text-[#006c49] mt-1">98.2% In-Stock</p>
          <span className="text-[11px] text-[#737686]">2 lines below safety buffer</span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/80 text-[#737686] text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200/50">
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Equipment / Product Name</th>
                <th className="py-3 px-4">Warehouse Depot</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-right">Unit Rate</th>
                <th className="py-3 px-4 text-center">Velocity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0b1c30] text-[13px]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-[#2563eb]">
                    {item.sku}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-[#737686]">{item.category}</div>
                  </td>
                  <td className="py-3 px-4 text-[#434655]">
                    {item.warehouse}
                  </td>
                  <td className="py-3 px-4 text-center font-bold tabular-nums">
                    <span className={item.stockLevel < item.minThreshold ? 'text-amber-700' : 'text-[#0b1c30]'}>
                      {item.stockLevel}
                    </span>
                    <span className="text-[11px] text-[#737686] font-normal block">
                      min {item.minThreshold}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700 tabular-nums">
                    ₹{item.unitCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-[#737686]">
                    {item.monthlyVelocity}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        item.reorderStatus === 'Optimal'
                          ? 'bg-[#e8fbf3] text-[#006c49]'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {item.reorderStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleRestock(item.id)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#eff4ff] hover:bg-blue-100 text-[#2563eb] rounded transition-colors"
                    >
                      + Restock 100
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
