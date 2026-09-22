import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Percent,
  TrendingUp,
  Ship,
  Compass,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { FreightRateCard, LandingCostSimulation } from '../types';

export const RateEstimatorPage: React.FC = () => {
  const [rateCards, setRateCards] = useState<FreightRateCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation Form
  const [form, setForm] = useState({
    product_name: 'Indian Basmati Rice Premium',
    hs_code: '1006.30.00',
    origin_port: 'Tuticorin Port (IN TUC)',
    weight_kg: 5000,
    quantity: 200,
    buy_price_inr: 450,
    cbm: 6.5,
    target_margin_pct: 15,
  });

  const [simulation, setSimulation] = useState<LandingCostSimulation | null>(null);

  const loadRateCards = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getRateCards();
      setRateCards(data);
    } catch (err) {
      console.error('Failed to load rate cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRateCards();
  }, []);

  const runSimulation = async () => {
    try {
      const res = await apiClient.simulateLandingCost(form);
      setSimulation(res);
    } catch (err: any) {
      alert('Simulation failed: ' + err.message);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [form.origin_port, form.weight_kg, form.quantity, form.buy_price_inr, form.cbm, form.target_margin_pct]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 font-semibold text-xs mb-1 font-mono uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Tariff & Ocean Freight Rate Master</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Rate Cards & Instant Landing Cost Estimator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time ocean liner rate cards from Indian ports to Colombo, coupled with instant CIF, customs duty, port dues, and landed price calculator.
          </p>
        </div>

        <button
          onClick={loadRateCards}
          className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Rates</span>
        </button>
      </div>

      {/* Grid: Simulator on Left, Rate Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Calculator (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              Instant Pre-Shipment Landing Cost Simulator
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Forex: 1 INR = 3.65 LKR &bull; 1 USD = 305 LKR
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Product Description</label>
              <input
                type="text"
                value={form.product_name}
                onChange={e => setForm({ ...form, product_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">HS Tariff Code</label>
              <input
                type="text"
                value={form.hs_code}
                onChange={e => setForm({ ...form, hs_code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Port of Loading (India)</label>
              <select
                value={form.origin_port}
                onChange={e => setForm({ ...form, origin_port: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-semibold"
              >
                <option value="Tuticorin Port (IN TUC)">Tuticorin Port (IN TUC) - 1 Day Feeder</option>
                <option value="Chennai Port (IN MAA)">Chennai Port (IN MAA) - 2 Days Feeder</option>
                <option value="Cochin Port (IN COK)">Cochin Port (IN COK) - 1 Day Feeder</option>
                <option value="Nhava Sheva (IN NSA)">Nhava Sheva (IN NSA) - 4 Days Feeder</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Unit Buy Price (INR)</label>
              <input
                type="number"
                value={form.buy_price_inr}
                onChange={e => setForm({ ...form, buy_price_inr: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Total Quantity (Units)</label>
              <input
                type="number"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Total Net Weight (kg)</label>
              <input
                type="number"
                value={form.weight_kg}
                onChange={e => setForm({ ...form, weight_kg: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 mb-1">Volume (CBM)</label>
              <input
                type="number"
                step="0.1"
                value={form.cbm}
                onChange={e => setForm({ ...form, cbm: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-600">Target Profit Margin</label>
                <span className="font-mono font-bold text-cyan-700">{form.target_margin_pct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                value={form.target_margin_pct}
                onChange={e => setForm({ ...form, target_margin_pct: Number(e.target.value) })}
                className="w-full accent-cyan-600"
              />
            </div>
          </div>

          {/* Simulation Output Card */}
          {simulation && (
            <div className="p-5 rounded-xl border border-cyan-200 bg-cyan-50/40 space-y-4 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total CIF (LKR)</span>
                  <span className="font-mono font-bold text-slate-800 block mt-0.5">
                    Rs. {simulation.total_cif_lkr.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Customs Duties</span>
                  <span className="font-mono font-bold text-rose-700 block mt-0.5">
                    Rs. {simulation.customs_duty_lkr.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Port Handling</span>
                  <span className="font-mono font-bold text-slate-800 block mt-0.5">
                    Rs. {simulation.port_charges_lkr.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Landed Cost</span>
                  <span className="font-mono font-black text-slate-900 block mt-0.5">
                    Rs. {simulation.total_landing_cost_lkr.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Price Per KG Highlights */}
              <div className="p-4 bg-gradient-to-r from-[#091E42] to-[#172B4D] rounded-xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-[11px] text-cyan-300 font-semibold uppercase tracking-wider block">
                    Landed Cost Benchmark (Per KG)
                  </span>
                  <div className="text-2xl font-black font-mono mt-0.5">
                    Rs. {simulation.cost_per_kg_lkr.toFixed(2)} <span className="text-xs font-normal text-slate-300">/ kg</span>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-700 sm:pl-6">
                  <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">
                    Recommended Selling Price ({simulation.gross_margin_pct}% Margin)
                  </span>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                    Rs. {(simulation.recommended_selling_price_lkr / (form.weight_kg || 1)).toFixed(2)} <span className="text-xs font-normal text-slate-300">/ kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ocean Freight Rate Cards Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Ship className="w-4 h-4 text-blue-600" />
              Liner Ocean Freight Rates (India &rarr; Colombo)
            </h3>
          </div>

          <div className="space-y-3">
            {rateCards.map(card => (
              <div
                key={card.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {card.origin_port}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {card.transit_days} Day Transit
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Carrier: {card.carrier}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">20FT STD</span>
                    <span className="font-bold text-slate-800">${card.container_20ft_usd}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">40FT HC</span>
                    <span className="font-bold text-slate-800">${card.container_40ft_hc_usd}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-sans">LCL / CBM</span>
                    <span className="font-bold text-blue-700">${card.lcl_per_cbm_usd}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
