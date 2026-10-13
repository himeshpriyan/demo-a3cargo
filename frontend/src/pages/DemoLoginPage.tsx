import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  Ship,
  FileText,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Building,
  Briefcase,
  Users,
  LogOut,
  SlidersHorizontal,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { USER_PERSONAS, type UserRole, type UserPersona } from '../types/auth';
import { showToast } from '../utils/toast';

interface DemoLoginPageProps {
  onSelectTab: (tab: string) => void;
}

type RoleCategory = 'ALL' | 'EXECUTIVE' | 'OPERATIONS' | 'REGULATORY' | 'COMMERCIAL' | 'FINANCE' | 'CLIENT';

interface PersonaMetadata {
  category: RoleCategory;
  categoryLabel: string;
  recommendedTab: string;
  recommendedTabLabel: string;
  canSee: string[];
  restricted: string[];
  scenarioHint: string;
}

const PERSONA_META: Record<UserRole, PersonaMetadata> = {
  SUPER_ADMIN: {
    category: 'EXECUTIVE',
    categoryLabel: 'Executive & Admin',
    recommendedTab: 'shipments',
    recommendedTabLabel: 'All Shipments Hub',
    canSee: ['Full Indian purchase prices', 'Confidential margin formula', 'CUSDEC overrides', 'Financial P&L'],
    restricted: ['None (Unrestricted access)'],
    scenarioHint: 'Use to review end-to-end multi-stage pipeline and audit all sensitive margins.'
  },
  OPS_MANAGER: {
    category: 'OPERATIONS',
    categoryLabel: 'Freight Operations',
    recommendedTab: 'logistics',
    recommendedTabLabel: 'Vessel & Container Tracking',
    canSee: ['Container seals & feeder ETA', 'Quotation margin overrides', 'B/L issuance'],
    restricted: ['Forex rate locks', 'Final financial reconciliation'],
    scenarioHint: 'Use to simulate Colombo port berthing, transshipment stages, and container dispatch.'
  },
  CUSTOMS_OFFICER: {
    category: 'REGULATORY',
    categoryLabel: 'Customs & Regulatory',
    recommendedTab: 'regulatory',
    recommendedTabLabel: 'Customs & CUSDEC Desk',
    canSee: ['HS Code tariff verification (Ch 01-97)', 'CUSDEC Green/Yellow/Red channels', 'SLSI test status'],
    restricted: ['Commercial markup percentages', 'Vendor payments'],
    scenarioHint: 'Use to verify HS lines and transition shipment CUSDEC declarations.'
  },
  PROCUREMENT_OFFICER: {
    category: 'COMMERCIAL',
    categoryLabel: 'Sourcing & Procurement',
    recommendedTab: 'vendors',
    recommendedTabLabel: 'Vendor Management',
    canSee: ['Indian vendor catalog & GSTIN', 'Raw purchase prices in INR', 'Carton weight allocations'],
    restricted: ['Customer sell prices', 'Port demurrage calculations'],
    scenarioHint: 'Use to manage Indian exporter profiles, RFQs, and Proforma Invoices (PI).'
  },
  SALES_EXECUTIVE: {
    category: 'COMMERCIAL',
    categoryLabel: 'Sales & Accounts',
    recommendedTab: 'customers',
    recommendedTabLabel: 'Customer Master',
    canSee: ['Customer target prices', 'Final quotation delivery orders', 'Customer indents'],
    restricted: ['Raw Indian buy price (MASKED)', 'Backend margin formulas (MASKED)'],
    scenarioHint: 'Observe automatic field masking: raw supplier prices are hidden to preserve trade secrecy.'
  },
  FINANCE_CONTROLLER: {
    category: 'FINANCE',
    categoryLabel: 'Finance & Billing',
    recommendedTab: 'disbursement',
    recommendedTabLabel: 'Port Disbursement (DA)',
    canSee: ['USD / LKR / INR Forex rate locks', 'Demurrage clock & wharfage dues', 'P&L analytics & OCR duty audit'],
    restricted: ['Direct warehouse stock alterations'],
    scenarioHint: 'Use to audit port disbursement accounts, free-day clocks, and duty variances.'
  },
  WAREHOUSE_OFFICER: {
    category: 'OPERATIONS',
    categoryLabel: 'Port CFS & Warehouse',
    recommendedTab: 'vault',
    recommendedTabLabel: 'Document E-Vault',
    canSee: ['Container packing lists', 'Damage/shortage tallies at Colombo CFS', 'Physical tally inspection'],
    restricted: ['Financial invoices', 'Buy/Sell pricing formulas'],
    scenarioHint: 'Use to record physical cargo intake, broken seals, and shortage tallies.'
  },
  CUSTOMER_CLIENT: {
    category: 'CLIENT',
    categoryLabel: 'External Consignee',
    recommendedTab: 'rate_estimator',
    recommendedTabLabel: 'Rate Cards & Landed Cost',
    canSee: ['Consignee shipment progress', 'Quotation landing costs & duties', 'Digital CUSDEC & invoices'],
    restricted: ['Supplier procurement costs (MASKED)', 'Internal margin tiers (RESTRICTED)', 'Logistics carrier net rates'],
    scenarioHint: 'External importer experience: observe clean landing quotes with zero backend leak.'
  }
};

export const DemoLoginPage: React.FC<DemoLoginPageProps> = ({ onSelectTab }) => {
  const { currentRole, user, allPersonas, switchRole, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const categories: { key: RoleCategory; label: string; count: number }[] = [
    { key: 'ALL', label: 'All Personas', count: Object.keys(allPersonas).length },
    { key: 'EXECUTIVE', label: 'Executive & Admin', count: 1 },
    { key: 'OPERATIONS', label: 'Operations & CFS', count: 2 },
    { key: 'REGULATORY', label: 'Customs & CHA', count: 1 },
    { key: 'COMMERCIAL', label: 'Commercial & Sales', count: 2 },
    { key: 'FINANCE', label: 'Finance & Port DA', count: 1 },
    { key: 'CLIENT', label: 'External Client', count: 1 }
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied to clipboard: ${text}`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSwitchRole = (role: UserRole, targetTab?: string) => {
    switchRole(role);
    const targetPersona = USER_PERSONAS[role];
    showToast(`Switched active persona to ${targetPersona.name} (${targetPersona.title})`, 'success');

    if (targetTab) {
      onSelectTab(targetTab);
    }
  };

  // Filter personas
  const filteredPersonas = (Object.keys(allPersonas) as UserRole[]).filter(roleKey => {
    const persona = allPersonas[roleKey];
    const meta = PERSONA_META[roleKey];

    if (selectedCategory !== 'ALL' && meta.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = persona.name.toLowerCase().includes(q);
      const matchRole = persona.role.toLowerCase().includes(q);
      const matchTitle = persona.title.toLowerCase().includes(q);
      const matchEmail = persona.email.toLowerCase().includes(q);
      const matchCategory = meta.categoryLabel.toLowerCase().includes(q);
      return matchName || matchRole || matchTitle || matchEmail || matchCategory;
    }

    return true;
  });

  return (
    <div className="space-y-8 pb-12 font-sans animate-in fade-in duration-150">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-[#091E42] via-[#0D2654] to-[#12316B] border border-blue-900/60 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background Accent Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0C66E4] text-white flex items-center gap-1.5 shadow-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Role Simulator</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                8 Personas (7 Enterprise + 1 External Client)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                Role-Based Access Control (RBAC)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              User Demo Logins & Access Control Studio
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Experience the entire Sri Lanka Customs & Freight operations portal through the eyes of different enterprise departments.
              Switch instantly with <strong>1-Click</strong> to test live security masking, purchase cost protection, customs authority gates, and client indents.
            </p>
          </div>

          {/* Active Session Indicator Card */}
          <div className="bg-[#071735]/90 border border-blue-500/30 rounded-xl p-4.5 sm:min-w-[320px] shadow-lg shrink-0">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5 pb-2 border-b border-slate-700/60 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
              <span className="text-slate-400">{user.role}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-md ${user.badgeColor}`}>
                {user.avatar}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-white truncate">{user.name}</div>
                <div className="text-xs text-blue-300 truncate font-medium">{user.title}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex items-center gap-2">
              <button
                onClick={() => onSelectTab(PERSONA_META[currentRole].recommendedTab)}
                className="flex-1 py-1.5 px-3 bg-[#0C66E4] hover:bg-[#0052CC] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Go to {PERSONA_META[currentRole].recommendedTabLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={logout}
                title="Sign out to initial login screen"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(cat => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#091E42] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-[#0C66E4] text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search persona by name, title, role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* 8 Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPersonas.map(roleKey => {
          const persona = allPersonas[roleKey];
          const meta = PERSONA_META[roleKey];
          const isActive = currentRole === roleKey;
          const isClient = roleKey === 'CUSTOMER_CLIENT';

          return (
            <div
              key={roleKey}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden ${
                isActive
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : isClient
                  ? 'border-indigo-200 hover:border-indigo-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top Accent Strip */}
              <div className={`h-1.5 w-full ${
                isActive
                  ? 'bg-blue-600'
                  : isClient
                  ? 'bg-indigo-600'
                  : 'bg-slate-200'
              }`} />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Persona Header: Badge & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs ${persona.badgeColor}`}>
                        {persona.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-snug">
                          {persona.name}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
                          {persona.role}
                        </span>
                      </div>
                    </div>

                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 font-mono shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : isClient ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono shrink-0">
                        Client View
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 font-mono shrink-0">
                        {meta.categoryLabel}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="text-xs font-semibold text-blue-700 mb-1">
                    {persona.title}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {persona.description}
                  </p>

                  {/* Credentials Box with 1-Click Copy */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-4 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Email:</span>
                      <div className="flex items-center gap-1">
                        <code className="text-slate-800 text-[11px] font-semibold">{persona.email}</code>
                        <button
                          type="button"
                          onClick={() => handleCopy(persona.email, `email-${roleKey}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Copy email address"
                        >
                          {copiedKey === `email-${roleKey}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Password:</span>
                      <div className="flex items-center gap-1">
                        <code className="text-slate-800 text-[11px] font-semibold">demo123</code>
                        <button
                          type="button"
                          onClick={() => handleCopy('demo123', `pass-${roleKey}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Copy password"
                        >
                          {copiedKey === `pass-${roleKey}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security Clearance Scope & Masking Details */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div>
                      <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Authorized Capabilities:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meta.canSee.map((cap, i) => (
                          <span key={i} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Restricted / Masked:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meta.restricted.map((res, i) => (
                          <span key={i} className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  {isActive ? (
                    <button
                      onClick={() => onSelectTab(meta.recommendedTab)}
                      className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Explore as {persona.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSwitchRole(roleKey, meta.recommendedTab)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98 ${
                        isClient
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-[#091E42] hover:bg-[#0C66E4] text-white'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>1-Click Switch to {persona.name.split(' ')[0]}</span>
                    </button>
                  )}

                  <div className="text-[10px] text-slate-400 text-center font-mono">
                    Recommended Desk: <span className="font-bold text-slate-600">{meta.recommendedTabLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Credentials Reference Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Full Demo Credentials Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Copy any login details or click the quick switch button to simulate authentication immediately:
            </p>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
            Password: demo123 (All Accounts)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3.5">Persona / Identity</th>
                <th className="p-3.5">Security Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Login Email</th>
                <th className="p-3.5">Demo Password</th>
                <th className="p-3.5">Permissions</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(Object.keys(allPersonas) as UserRole[]).map(rKey => {
                const persona = allPersonas[rKey];
                const meta = PERSONA_META[rKey];
                const isActive = currentRole === rKey;
                const isClient = rKey === 'CUSTOMER_CLIENT';

                return (
                  <tr key={rKey} className={`hover:bg-slate-50 transition-colors ${isActive ? 'bg-blue-50/50' : ''}`}>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${persona.badgeColor}`}>
                          {persona.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{persona.name}</span>
                            {isActive && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono font-bold">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{persona.title}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded font-semibold ${
                        isClient ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {persona.role}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600">{meta.categoryLabel}</td>

                    <td className="p-3.5 font-mono text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{persona.email}</span>
                        <button
                          onClick={() => handleCopy(persona.email, `table-email-${rKey}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Copy email"
                        >
                          {copiedKey === `table-email-${rKey}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <code>demo123</code>
                        <button
                          onClick={() => handleCopy('demo123', `table-pass-${rKey}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Copy password"
                        >
                          {copiedKey === `table-pass-${rKey}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {persona.permissions.length} grants
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      {isActive ? (
                        <button
                          onClick={() => onSelectTab(meta.recommendedTab)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Open Desk
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSwitchRole(rKey, meta.recommendedTab)}
                          className="px-3 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Switch &rarr;
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demonstration Scenario Guide: What to Test */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Interactive RBAC Evaluation Scenarios</span>
          </div>
          <h2 className="text-xl font-bold text-white">How to Test Role-Based Security in A3 Cargo</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A3 Express Cargo enforces strict multi-department boundaries. Try switching between these roles to see data security in real time:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scenario 1 */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 font-mono">SCENARIO 1</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                Trade Secrecy Masking
              </span>
            </div>
            <h3 className="font-bold text-sm text-white">Raw Buy Price Protection</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Log in as <strong>Managing Director</strong> to view supplier buy rates and internal margin formula. Then switch to <strong>Sales Executive</strong> or <strong>Client Importer</strong>: raw buy costs are masked with <code className="text-amber-400 font-mono">•••••• [CONFIDENTIAL]</code>.
            </p>
            <button
              onClick={() => handleSwitchRole('SALES_EXECUTIVE', 'shipments')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Test as Sales Executive &rarr;</span>
            </button>
          </div>

          {/* Scenario 2 */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 font-mono">SCENARIO 2</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                Customs Compliance
              </span>
            </div>
            <h3 className="font-bold text-sm text-white">CUSDEC & HS Tariff Verification</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Switch to <strong>Customs Officer (CHA)</strong>. Notice that Tariff Verification Studio and CUSDEC filing in Regulatory Desk become active, allowing official Sri Lanka Customs declaration approvals.
            </p>
            <button
              onClick={() => handleSwitchRole('CUSTOMS_OFFICER', 'regulatory')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Test as Customs Officer &rarr;</span>
            </button>
          </div>

          {/* Scenario 3 */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 font-mono">SCENARIO 3</span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                Client Portal
              </span>
            </div>
            <h3 className="font-bold text-sm text-white">External Importer Perspective</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Switch to <strong>Client Importer</strong> (Lanka Premier Wholesale). You get a clean portal to track active container shipments, review approved landed cost quotations, and download official trade invoices.
            </p>
            <button
              onClick={() => handleSwitchRole('CUSTOMER_CLIENT', 'rate_estimator')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Test as Client Importer &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
