import React, { useState, useEffect } from 'react';
import {
  Ship,
  Anchor,
  Navigation,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { ContainerTrackingRecord, MaritimeMilestoneStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { PermissionGate } from '../components/PermissionGate';

const MILESTONE_ORDER: MaritimeMilestoneStatus[] = [
  'BOOKED',
  'GATED_IN',
  'SAILED_POL',
  'IN_TRANSIT',
  'ARRIVED_COLOMBO',
  'BERTHED',
  'CUSTOMS_EXAM',
  'CLEARED',
  'DESTUFFED',
  'DELIVERED',
];

export const LogisticsTrackingPage: React.FC = () => {
  const { can } = useAuth();
  const [containers, setContainers] = useState<ContainerTrackingRecord[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<ContainerTrackingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  // New container form
  const [form, setForm] = useState({
    shipment_no: 'AEC/1001/2026-27',
    container_no: '',
    container_size: '40FT_HC' as const,
    seal_no: '',
    carrier_name: 'Maersk Line',
    vessel_name: 'MV TIGER CORAL',
    voyage_no: 'V.2604S',
    master_bl_no: '',
    port_of_loading: 'Tuticorin Port (IN TUC)',
    port_of_discharge: 'Colombo Port (LK CMB)',
    gross_weight_kg: 24000,
    cbm_volume: 60.0,
  });

  const loadContainers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getContainers();
      setContainers(data);
      if (data.length > 0 && !selectedContainer) {
        setSelectedContainer(data[0]);
      } else if (selectedContainer) {
        const updated = data.find(c => c.id === selectedContainer.id);
        if (updated) setSelectedContainer(updated);
      }
    } catch (err) {
      console.error('Failed to load containers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
  }, []);

  const handleAdvanceMilestone = async (nextStep: MaritimeMilestoneStatus) => {
    if (!selectedContainer) return;
    setAdvancing(true);
    try {
      const updated = await apiClient.updateContainerMilestone(
        selectedContainer.id,
        nextStep,
        `Status progressed via Operations Console`
      );
      setSelectedContainer(updated);
      await loadContainers();
    } catch (err: any) {
      alert('Failed to update milestone: ' + err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const handleCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.container_no || !form.master_bl_no) {
      alert('Please fill in Container No and Master B/L No');
      return;
    }
    try {
      const created = await apiClient.saveContainer({
        ...form,
        current_milestone: 'BOOKED',
        milestones: MILESTONE_ORDER.map(step => ({
          step,
          label: step.replace('_', ' '),
          location: step.includes('COLOMBO') || step.includes('BERTHED') || step.includes('CUSTOMS') ? 'Colombo Port' : 'Port of Origin',
          planned_date: new Date().toISOString().split('T')[0],
          is_completed: step === 'BOOKED',
        })),
      });
      setShowAddModal(false);
      setForm({
        shipment_no: 'AEC/1001/2026-27',
        container_no: '',
        container_size: '40FT_HC',
        seal_no: '',
        carrier_name: 'Maersk Line',
        vessel_name: 'MV TIGER CORAL',
        voyage_no: 'V.2604S',
        master_bl_no: '',
        port_of_loading: 'Tuticorin Port (IN TUC)',
        port_of_discharge: 'Colombo Port (LK CMB)',
        gross_weight_kg: 24000,
        cbm_volume: 60.0,
      });
      await loadContainers();
      setSelectedContainer(created);
    } catch (err: any) {
      alert('Failed to create container record: ' + err.message);
    }
  };

  const filtered = containers.filter(c =>
    c.container_no.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.master_bl_no.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.vessel_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.shipment_no.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const getNextStep = (current: MaritimeMilestoneStatus): MaritimeMilestoneStatus | null => {
    const idx = MILESTONE_ORDER.indexOf(current);
    if (idx !== -1 && idx < MILESTONE_ORDER.length - 1) {
      return MILESTONE_ORDER[idx + 1];
    }
    return null;
  };

  const getStatusBadge = (status: MaritimeMilestoneStatus) => {
    switch (status) {
      case 'DELIVERED':
      case 'CLEARED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ARRIVED_COLOMBO':
      case 'BERTHED':
      case 'CUSTOMS_EXAM':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IN_TRANSIT':
      case 'SAILED_POL':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs mb-1 font-mono uppercase tracking-wider">
            <Ship className="w-4 h-4" />
            <span>Maritime Logistics & Vessel Tracking Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Container & Vessel Milestone Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of FCL/LCL ocean containers, shipping lines, bills of lading, feeder vessels, and Colombo wharf milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadContainers}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Feeds</span>
          </button>

          <PermissionGate permission="logistics:manage_containers">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Container</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Main Grid: List on Left, Active Timeline Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Container Cards List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search container, B/L, vessel, shipment..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                Loading container fleet status...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                No matching container records found.
              </div>
            ) : (
              filtered.map(container => {
                const isSelected = selectedContainer?.id === container.id;
                return (
                  <div
                    key={container.id}
                    onClick={() => setSelectedContainer(container)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {container.container_no}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {container.container_size.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          B/L: {container.master_bl_no} &bull; {container.shipment_no}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          container.current_milestone
                        )}`}
                      >
                        {container.current_milestone.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Vessel & Line:</span>
                        <span className="font-semibold text-slate-700 truncate block">
                          {container.vessel_name} ({container.carrier_name})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Port Route:</span>
                        <span className="font-semibold text-slate-700 truncate block">
                          {container.port_of_loading.split('(')[0]} &rarr; {container.port_of_discharge.split('(')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Milestone Tracker */}
        <div className="lg:col-span-7">
          {selectedContainer ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Top Details Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black font-mono text-slate-900">
                      {selectedContainer.container_no}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Seal: {selectedContainer.seal_no}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>MBL: <strong className="font-mono text-slate-700">{selectedContainer.master_bl_no}</strong></span>
                    <span>HBL: <strong className="font-mono text-slate-700">{selectedContainer.house_bl_no}</strong></span>
                    <span>Shipment: <strong className="text-slate-700">{selectedContainer.shipment_no}</strong></span>
                  </div>
                </div>

                {/* Advance Milestone Button */}
                <PermissionGate permission="logistics:manage_containers">
                  {getNextStep(selectedContainer.current_milestone) && (
                    <button
                      onClick={() => handleAdvanceMilestone(getNextStep(selectedContainer.current_milestone)!)}
                      disabled={advancing}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <span>Mark Next: {getNextStep(selectedContainer.current_milestone)!.replace('_', ' ')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </PermissionGate>
              </div>

              {/* Voyage Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Shipping Line</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">{selectedContainer.carrier_name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vessel & Voyage</span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">{selectedContainer.vessel_name} {selectedContainer.voyage_no}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gross Weight</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{selectedContainer.gross_weight_kg.toLocaleString()} kg</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">CBM Volume</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{selectedContainer.cbm_volume} m³</span>
                </div>
              </div>

              {/* Maritime Milestone Timeline */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    Maritime Journey Milestones (Tuticorin &rarr; Colombo)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Terminal: <strong>{selectedContainer.berth_terminal || 'SAGT'}</strong>
                  </span>
                </div>

                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedContainer.milestones.map((milestone, idx) => {
                    const isCompleted = milestone.is_completed;
                    const isCurrent = milestone.step === selectedContainer.current_milestone;

                    return (
                      <div key={milestone.step} className="relative flex items-start gap-4 text-xs">
                        {/* Milestone dot */}
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        </div>

                        <div className="flex-1 bg-slate-50 hover:bg-slate-100/70 p-3 rounded-lg border border-slate-200 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className={`font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-800'}`}>
                              {idx + 1}. {milestone.label}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {milestone.actual_date ? `Actual: ${milestone.actual_date}` : `Planned: ${milestone.planned_date}`}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{milestone.location}</span>
                            {milestone.notes && (
                              <span className="text-slate-400">&bull; {milestone.notes}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a container from the left to view voyage milestone tracking.
            </div>
          )}
        </div>
      </div>

      {/* Add Container Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Register New Container Fleet Record</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContainer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Container No *</label>
                  <input
                    type="text"
                    placeholder="e.g. MSKU-9081245"
                    value={form.container_no}
                    onChange={e => setForm({ ...form, container_no: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg uppercase font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Container Size</label>
                  <select
                    value={form.container_size}
                    onChange={e => setForm({ ...form, container_size: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="20FT_STD">20FT Standard</option>
                    <option value="40FT_HC">40FT High Cube</option>
                    <option value="40FT_STD">40FT Standard</option>
                    <option value="REEFER">Reefer Container</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Master B/L No *</label>
                  <input
                    type="text"
                    placeholder="e.g. MAEU9821441"
                    value={form.master_bl_no}
                    onChange={e => setForm({ ...form, master_bl_no: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Customs Seal No</label>
                  <input
                    type="text"
                    placeholder="e.g. SL-CUS-109284"
                    value={form.seal_no}
                    onChange={e => setForm({ ...form, seal_no: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Shipping Line</label>
                  <select
                    value={form.carrier_name}
                    onChange={e => setForm({ ...form, carrier_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Maersk Line">Maersk Line</option>
                    <option value="Bengal Tiger Line (BTL)">Bengal Tiger Line (BTL)</option>
                    <option value="MSC Mediterranean Shipping">MSC Mediterranean Shipping</option>
                    <option value="CMA CGM Line">CMA CGM Line</option>
                    <option value="Hapag-Lloyd">Hapag-Lloyd</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Vessel Name</label>
                  <input
                    type="text"
                    value={form.vessel_name}
                    onChange={e => setForm({ ...form, vessel_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Port of Loading (POL)</label>
                  <input
                    type="text"
                    value={form.port_of_loading}
                    onChange={e => setForm({ ...form, port_of_loading: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Port of Discharge (POD)</label>
                  <input
                    type="text"
                    value={form.port_of_discharge}
                    onChange={e => setForm({ ...form, port_of_discharge: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Gross Weight (kg)</label>
                  <input
                    type="number"
                    value={form.gross_weight_kg}
                    onChange={e => setForm({ ...form, gross_weight_kg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">CBM Volume</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.cbm_volume}
                    onChange={e => setForm({ ...form, cbm_volume: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Register Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
