import React from 'react';
import { Order } from '../types';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center font-bold text-sm">
              {order.clientInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{order.id}</h3>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-[#2563eb]">
                  {order.restaurantId}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    order.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.status === 'Processing'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {order.status}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {order.yoyDelta} YoY
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {order.restaurantName} · <span className="text-slate-400">{order.clientName} ({order.location})</span> · {order.date}
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

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Transaction
              </span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                ₹{order.value.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Includes 18% IGST</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                SLA Delivery Window
              </span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {order.slaDeliveryHours || 18.2} hrs
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Within &lt;24h Target</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Settlement Rail
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">
                {order.paymentMethod || 'Corporate Wire'}
              </p>
              <span className="text-[11px] text-slate-500">Verified & Reconciled</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              B2B Hardware & Telemetry Allocation
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item & SKU</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900">{it.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{it.sku}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-medium">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">₹{it.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                          ₹{it.totalPrice.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        Hardware package breakdown synced with ERP inventory node.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dispatch & Telemetry Node */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-[#2563eb]">local_shipping</span>
              <div>
                <span className="font-semibold">Transit Route: </span>
                <span>Ether Central Depot → {order.location}</span>
              </div>
            </div>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-blue-200">
              TRACK: ETH-{order.id.replace('#ORD-', '')}-EXP
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Recorded in Ether Enterprise Ledger · Audit ID #AUD-2026-X
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                alert(`Printing GST Tax Invoice for ${order.id}...`);
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium transition-colors"
            >
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#2563eb] text-white hover:bg-blue-700 rounded-lg text-xs font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
