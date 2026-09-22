import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  FileCheck2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Tag,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { CusdecDeclaration, CustomsChannel, SlsiInspection, QuarantineRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { PermissionGate } from '../components/PermissionGate';

export const RegulatoryDeskPage: React.FC = () => {
  const { can } = useAuth();
  const [cusdecList, setCusdecList] = useState<CusdecDeclaration[]>([]);
  const [slsiList, setSlsiList] = useState<SlsiInspection[]>([]);
  const [quarantineList, setQuarantineList] = useState<QuarantineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'CUSDEC' | 'SLSI' | 'QUARANTINE'>('CUSDEC');

  const loadRegulatoryData = async () => {
    setLoading(true);
    try {
      const [cData, sData, qData] = await Promise.all([
        apiClient.getCusdecDeclarations(),
        apiClient.getSlsiInspections(),
        apiClient.getQuarantineRecords(),
      ]);
      setCusdecList(cData);
      setSlsiList(sData);
      setQuarantineList(qData);
    } catch (err) {
      console.error('Failed to load regulatory desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegulatoryData();
  }, []);

  const handleChangeChannel = async (id: number, newChannel: CustomsChannel) => {
    try {
      const notes = prompt(`Enter reason or customs officer remarks for channel shift to ${newChannel}:`, 'Routine compliance verification');
      if (notes === null) return;
      await apiClient.updateCusdecChannel(id, newChannel, notes);
      await loadRegulatoryData();
    } catch (err: any) {
      alert('Failed to update customs channel: ' + err.message);
    }
  };

  const handleUpdateSlsiStatus = async (id: number, status: any) => {
    try {
      let permitNo: string | undefined = undefined;
      if (status === 'STANDARDS_CONFORMED') {
        permitNo = `SLSI-PERMIT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      await apiClient.updateSlsiStatus(id, status, permitNo);
      await loadRegulatoryData();
    } catch (err: any) {
      alert('Failed to update SLSI status: ' + err.message);
    }
  };

  const handleReleaseQuarantine = async (id: number) => {
    try {
      const orderNo = `NPQS/REL/2026/09/${Math.floor(100 + Math.random() * 900)}`;
      await apiClient.updateQuarantineStatus(id, 'CLEARED', orderNo);
      await loadRegulatoryData();
    } catch (err: any) {
      alert('Failed to release quarantine: ' + err.message);
    }
  };

  const getChannelColor = (channel: CustomsChannel) => {
    switch (channel) {
      case 'GREEN':
        return 'bg-emerald-500 text-white shadow-emerald-500/30';
      case 'YELLOW':
        return 'bg-amber-500 text-white shadow-amber-500/30';
      case 'RED':
        return 'bg-rose-600 text-white shadow-rose-600/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs mb-1 font-mono uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Sri Lanka Customs Regulatory & Inspection Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">CUSDEC & Statutory Standards Compliance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Asycuda World declaration entries, Customs routing channels (Green/Yellow/Red), SLSI laboratory test permits, and NPQS quarantine release orders.
          </p>
        </div>

        <button
          onClick={loadRegulatoryData}
          className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Declarations</span>
        </button>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('CUSDEC')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'CUSDEC'
              ? 'bg-[#091E42] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>CUSDEC Declarations ({cusdecList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SLSI')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'SLSI'
              ? 'bg-[#091E42] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>SLSI Standards Testing ({slsiList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('QUARANTINE')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'QUARANTINE'
              ? 'bg-[#091E42] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Plant Quarantine (NPQS) ({quarantineList.length})</span>
        </button>
      </div>

      {/* Tab 1: CUSDEC Declarations */}
      {activeSubTab === 'CUSDEC' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Green Channel (Direct)</span>
                <div className="text-xl font-black text-emerald-900 mt-0.5">
                  {cusdecList.filter(c => c.channel === 'GREEN').length} Active
                </div>
                <span className="text-[10px] text-emerald-600">No physical inspection needed</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                G
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase">Yellow Channel (Document Audit)</span>
                <div className="text-xl font-black text-amber-900 mt-0.5">
                  {cusdecList.filter(c => c.channel === 'YELLOW').length} Active
                </div>
                <span className="text-[10px] text-amber-600">Commodity invoice & HS audit</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                Y
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-800 uppercase">Red Channel (Physical Cargo Exam)</span>
                <div className="text-xl font-black text-rose-900 mt-0.5">
                  {cusdecList.filter(c => c.channel === 'RED').length} Active
                </div>
                <span className="text-[10px] text-rose-600">Container scanning / wharf tally</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                R
              </div>
            </div>
          </div>

          {/* CUSDEC Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-semibold">
                  <th className="p-3">Declaration No</th>
                  <th className="p-3">Shipment Ref</th>
                  <th className="p-3">CPC Code</th>
                  <th className="p-3">Importer TIN / VAT</th>
                  <th className="p-3 text-right">Assessed Duty (LKR)</th>
                  <th className="p-3 text-center">Customs Channel</th>
                  <th className="p-3 text-center">Warrant Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cusdecList.map(cusdec => (
                  <tr key={cusdec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-700">
                      {cusdec.declaration_no}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal">
                        Notice: {cusdec.assessment_notice_no}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {cusdec.shipment_no}
                      <span className="block text-[10px] text-slate-400">
                        Office: {cusdec.cusdec_office_code} &bull; Manifest: {cusdec.manifest_no}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{cusdec.cpc_code}</td>
                    <td className="p-3 font-mono text-slate-600">{cusdec.importer_tin_vat}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      Rs. {cusdec.assessed_duty_lkr.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${getChannelColor(cusdec.channel)}`}>
                        {cusdec.channel} CHANNEL
                      </span>
                      {cusdec.notes && (
                        <span className="block text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                          {cusdec.notes}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {cusdec.is_warranted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-semibold text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Warranted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-semibold text-[10px] border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending Warrant
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <PermissionGate permission="customs:manage_cusdec">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleChangeChannel(cusdec.id, 'GREEN')}
                            title="Set Green Channel"
                            className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] hover:opacity-80 cursor-pointer"
                          >
                            G
                          </button>
                          <button
                            onClick={() => handleChangeChannel(cusdec.id, 'YELLOW')}
                            title="Set Yellow Channel"
                            className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] hover:opacity-80 cursor-pointer"
                          >
                            Y
                          </button>
                          <button
                            onClick={() => handleChangeChannel(cusdec.id, 'RED')}
                            title="Set Red Channel"
                            className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] hover:opacity-80 cursor-pointer"
                          >
                            R
                          </button>
                        </div>
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: SLSI Standards Testing */}
      {activeSubTab === 'SLSI' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-semibold">
                  <th className="p-3">SLSI File Ref</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Standards Specification</th>
                  <th className="p-3">Sample Drawn Date</th>
                  <th className="p-3 text-center">Testing Status</th>
                  <th className="p-3">Permit No</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {slsiList.map(slsi => (
                  <tr key={slsi.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-700">{slsi.slsi_file_ref}</td>
                    <td className="p-3 font-semibold text-slate-800">{slsi.product_name}</td>
                    <td className="p-3 font-mono text-slate-600">{slsi.standards_specification}</td>
                    <td className="p-3 text-slate-600">{slsi.sample_drawn_date || 'Pending Sample'}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          slsi.lab_test_status === 'STANDARDS_CONFORMED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : slsi.lab_test_status === 'TESTING_IN_LAB'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {slsi.lab_test_status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">
                      {slsi.permit_no || '—'}
                    </td>
                    <td className="p-3 text-center">
                      <PermissionGate permission="customs:manage_cusdec">
                        {slsi.lab_test_status !== 'STANDARDS_CONFORMED' && (
                          <button
                            onClick={() => handleUpdateSlsiStatus(slsi.id, 'STANDARDS_CONFORMED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            Mark Conformed & Release
                          </button>
                        )}
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Plant Quarantine (NPQS) */}
      {activeSubTab === 'QUARANTINE' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-semibold">
                  <th className="p-3">Shipment Ref</th>
                  <th className="p-3">Indian Phyto Cert No</th>
                  <th className="p-3">Fumigation Date</th>
                  <th className="p-3">NPQS Inspection Officer</th>
                  <th className="p-3 text-center">Clearance Status</th>
                  <th className="p-3">Release Order No</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quarantineList.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-800">{q.shipment_no}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">{q.phyto_certificate_no}</td>
                    <td className="p-3 text-slate-600">{q.fumigation_cert_date}</td>
                    <td className="p-3 text-slate-700">{q.npqs_officer_name || 'Dr. Wickramasinghe (NPQS)'}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          q.inspection_status === 'CLEARED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {q.inspection_status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{q.release_order_no || '—'}</td>
                    <td className="p-3 text-center">
                      <PermissionGate permission="customs:manage_cusdec">
                        {q.inspection_status !== 'CLEARED' && (
                          <button
                            onClick={() => handleReleaseQuarantine(q.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            Authorize Release
                          </button>
                        )}
                      </PermissionGate>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
