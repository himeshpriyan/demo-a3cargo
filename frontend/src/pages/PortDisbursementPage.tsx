import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Clock,
  AlertOctagon,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Building,
  Receipt,
  FileText,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { PortDisbursementAccount, DemurrageClock, PortDisbursementItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { PermissionGate } from '../components/PermissionGate';

export const PortDisbursementPage: React.FC = () => {
  const { can } = useAuth();
  const [disbursements, setDisbursements] = useState<PortDisbursementAccount[]>([]);
  const [demurrageClocks, setDemurrageClocks] = useState<DemurrageClock[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAccount, setActiveAccount] = useState<PortDisbursementAccount | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dData, cData] = await Promise.all([
        apiClient.getPortDisbursements(),
        apiClient.getDemurrageClocks(),
      ]);
      setDisbursements(dData);
      setDemurrageClocks(cData);
      if (dData.length > 0 && !activeAccount) {
        setActiveAccount(dData[0]);
      } else if (activeAccount) {
        const found = dData.find(d => d.id === activeAccount.id);
        if (found) setActiveAccount(found);
      }
    } catch (err) {
      console.error('Failed to load port disbursement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrintDebitNote = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-semibold text-xs mb-1 font-mono uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>Port Dues & Demurrage Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Port Disbursement Account (DA) & Free-Days Clock</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconciliation of Sri Lanka Ports Authority (SLPA) wharfage, SAGT/CICT terminal handling charges, free-storage countdown, and customer debit notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Clocks</span>
          </button>

          <button
            onClick={handlePrintDebitNote}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Debit Note</span>
          </button>
        </div>
      </div>

      {/* Demurrage Countdown Clocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demurrageClocks.map(clock => {
          const isWarning = clock.status === 'WARNING';
          const isOverdue = clock.status === 'OVERDUE';

          return (
            <div
              key={clock.id}
              className={`p-5 rounded-xl border shadow-xs transition-all ${
                isOverdue
                  ? 'border-rose-300 bg-rose-50/50'
                  : isWarning
                  ? 'border-amber-300 bg-amber-50/50'
                  : 'border-emerald-200 bg-emerald-50/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {clock.container_no}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      ({clock.shipment_no})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Arrived: {clock.arrival_date} &bull; Free Storage: {clock.free_days_allowed} Days
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isOverdue
                      ? 'bg-rose-600 text-white animate-pulse'
                      : isWarning
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {clock.status === 'OVERDUE' ? 'STORAGE OVERDUE' : `${clock.days_remaining} Free Days Left`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Free Expiry</span>
                  <span className="font-mono font-bold text-slate-700">{clock.free_days_expiry_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Penalty Rate</span>
                  <span className="font-mono font-bold text-slate-700">${clock.penalty_per_day_usd} / Day</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Accrued Demurrage</span>
                  <span className={`font-mono font-black ${isOverdue ? 'text-rose-700' : 'text-slate-700'}`}>
                    ${clock.accrued_demurrage_usd} (Rs. {clock.accrued_demurrage_lkr.toLocaleString()})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Port Disbursement Breakdown Card */}
      {activeAccount && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Port Disbursement Account: {activeAccount.shipment_no}
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Terminal: {activeAccount.terminal_operator}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official clearing and port forwarding breakdown with agency fees and statutory Sri Lankan taxes.
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                activeAccount.payment_status === 'SETTLED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              Payment: {activeAccount.payment_status.replace('_', ' ')}
            </span>
          </div>

          {/* Disbursement Items Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-semibold">
                  <th className="p-3">Category</th>
                  <th className="p-3">Description of Port Due / Wharf Levy</th>
                  <th className="p-3">Receipt / Voucher Ref</th>
                  <th className="p-3 text-center">Billed to Customer</th>
                  <th className="p-3 text-right">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeAccount.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{item.category}</td>
                    <td className="p-3 text-slate-800 font-medium">{item.description}</td>
                    <td className="p-3 font-mono text-slate-500">{item.receipt_ref || 'Official Voucher'}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        YES
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      Rs. {item.amount_lkr.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary Calculation Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] font-mono">
                Statutory Sri Lanka Agency Tax Note
              </h4>
              <p>
                In accordance with Inland Revenue Department (IRD) Sri Lanka regulations:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
                <li>Social Security Contribution Levy (SSCL): <strong>2.5%</strong> on CHA Agency Fee.</li>
                <li>Value Added Tax (VAT): <strong>18%</strong> on CHA Agency Fee.</li>
                <li>Port Authority statutory wharfage dues are zero-rated for VAT passthrough.</li>
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Subtotal Direct Port Dues (SLPA/SAGT):</span>
                <span className="font-mono font-bold text-slate-800">
                  Rs. {activeAccount.total_disbursement_lkr.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">CHA Clearing & Handling Agency Fee:</span>
                <span className="font-mono font-bold text-slate-800">
                  Rs. {activeAccount.agency_commission_lkr.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">SSCL Levy (2.5% on Agency Fee):</span>
                <span className="font-mono text-slate-700">
                  Rs. {activeAccount.sscl_tax_lkr.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">VAT Tax (18% on Agency Fee):</span>
                <span className="font-mono text-slate-700">
                  Rs. {activeAccount.vat_tax_lkr.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-800 text-sm font-black text-slate-900">
                <span>Grand Total Debit to Importer (LKR):</span>
                <span className="font-mono text-blue-700">
                  Rs. {activeAccount.grand_total_lkr.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
