import React, { useState, useRef, useEffect } from 'react';
import {
  Ship,
  Users,
  Truck,
  BarChart3,
  ChevronDown,
  Plus,
  Package,
  History,
  Database,
  Search,
  HelpCircle,
  Settings,
  Boxes,
  ShieldCheck,
  Receipt,
  FolderArchive,
  Calculator,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { type UserRole } from '../types/auth';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateShipment: () => void;
  onOpenAddVendor: () => void;
  onOpenAddCustomer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateShipment,
  onOpenAddVendor,
  onOpenAddCustomer
}) => {
  const { currentRole, user, allPersonas, switchRole } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (menuName: string) => {
    setOpenMenu(prev => (prev === menuName ? null : menuName));
  };

  const handleMenuClick = (action: () => void) => {
    action();
    setOpenMenu(null);
  };

  return (
    <header className="bg-[#091E42] text-white border-b border-[#253858] sticky top-0 z-40 font-sans shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left Section: Brand Logo & Context Navigation */}
        <div className="flex items-center gap-4" ref={navRef}>
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer py-1 select-none shrink-0"
            onClick={() => setActiveTab('shipments')}
            title="A3 Express Cargo - Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0C66E4] hover:bg-[#0052CC] text-white flex items-center justify-center shadow-xs transition-colors">
              <Ship className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white font-mono">
                A3 EXPRESS
              </span>
              <span className="text-[10px] font-bold bg-[#172B4D] text-[#4C9AFF] px-1.5 py-0.5 rounded border border-[#253858] font-mono">
                CARGO
              </span>
            </div>
          </div>

          {/* Navigation Menus (Atlassian Dropdowns) */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* 1. SHIPMENTS */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('shipment')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'shipments' || activeTab === 'shipment_workspace' || activeTab === 'shipment_detail' || openMenu === 'shipment'
                    ? 'bg-[#172B4D] text-[#4C9AFF]'
                    : 'text-[#DEEBFF] hover:bg-[#172B4D]/60 hover:text-white'
                }`}
              >
                <span>Shipments</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${openMenu === 'shipment' ? 'rotate-180' : ''}`} />
              </button>

              {openMenu === 'shipment' && (
                <div className="absolute left-0 mt-1.5 w-60 bg-[#091E42] border border-[#253858] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => handleMenuClick(onOpenCreateShipment)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#4C9AFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <Plus className="w-4 h-4 text-[#4C9AFF]" />
                    <span>Create New Shipment</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick(() => setActiveTab('shipments'))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DEEBFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>All Shipments Hub</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick(() => setActiveTab('shipments'))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DEEBFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <History className="w-4 h-4 text-purple-400" />
                    <span>Completed Archive</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. CUSTOMERS */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('customer')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'customers' || openMenu === 'customer'
                    ? 'bg-[#172B4D] text-[#4C9AFF]'
                    : 'text-[#DEEBFF] hover:bg-[#172B4D]/60 hover:text-white'
                }`}
              >
                <span>Customers</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${openMenu === 'customer' ? 'rotate-180' : ''}`} />
              </button>

              {openMenu === 'customer' && (
                <div className="absolute left-0 mt-1.5 w-56 bg-[#091E42] border border-[#253858] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => handleMenuClick(() => setActiveTab('customers'))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DEEBFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Customer Directory</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick(onOpenAddCustomer)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Add New Customer</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. VENDORS */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('vendor')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'vendors' || openMenu === 'vendor'
                    ? 'bg-[#172B4D] text-[#4C9AFF]'
                    : 'text-[#DEEBFF] hover:bg-[#172B4D]/60 hover:text-white'
                }`}
              >
                <span>Vendors</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${openMenu === 'vendor' ? 'rotate-180' : ''}`} />
              </button>

              {openMenu === 'vendor' && (
                <div className="absolute left-0 mt-1.5 w-56 bg-[#091E42] border border-[#253858] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => handleMenuClick(() => setActiveTab('vendors'))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DEEBFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Vendor Management</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick(onOpenAddVendor)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Add New Vendor</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. MASTER ITEMS */}
            <button
              onClick={() => setActiveTab('items')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'items'
                  ? 'bg-[#172B4D] text-[#4C9AFF]'
                  : 'text-[#DEEBFF] hover:bg-[#172B4D]/60 hover:text-white'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 opacity-80" />
              <span>Catalog</span>
            </button>

            {/* 5. OPERATIONS & FREIGHT MODULES DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('operations')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'logistics' || activeTab === 'regulatory' || activeTab === 'disbursement' || activeTab === 'vault' || activeTab === 'rate_estimator' || openMenu === 'operations'
                    ? 'bg-[#172B4D] text-[#4C9AFF]'
                    : 'text-[#DEEBFF] hover:bg-[#172B4D]/60 hover:text-white'
                }`}
              >
                <span>Freight Desk</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${openMenu === 'operations' ? 'rotate-180' : ''}`} />
              </button>

              {openMenu === 'operations' && (
                <div className="absolute left-0 mt-1.5 w-64 bg-[#091E42] border border-[#253858] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
                  <button
                    onClick={() => handleMenuClick(() => setActiveTab('logistics'))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DEEBFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <Ship className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-bold text-white">Container & Vessel Tracking</div>
                      <div className="text-[10px] text-slate-400">B/L, Feeder Milestones, Seals</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMenuClick(() => setActiveTab('regulatory'))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DEEBFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">Customs & CUSDEC Desk</div>
                      <div className="text-[10px] text-slate-400">Channels G/Y/R, SLSI Testing</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMenuClick(() => setActiveTab('disbursement'))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DEEBFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <Receipt className="w-4 h-4 text-teal-400" />
                    <div>
                      <div className="font-bold text-white">Port Dues & Demurrage (DA)</div>
                      <div className="text-[10px] text-slate-400">Wharfage & Free Days Clock</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMenuClick(() => setActiveTab('vault'))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DEEBFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <FolderArchive className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-bold text-white">Document E-Vault</div>
                      <div className="text-[10px] text-slate-400">Digital Dossier Repository</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleMenuClick(() => setActiveTab('rate_estimator'))}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#DEEBFF] hover:bg-[#172B4D] rounded-lg transition-all cursor-pointer text-left"
                  >
                    <Calculator className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold text-white">Rate Cards & Estimator</div>
                      <div className="text-[10px] text-slate-400">Liner Freights & Landing Cost</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* 6. TARIFF DATABASE */}
            <button
              onClick={() => setActiveTab('tariff')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'tariff'
                  ? 'bg-[#172B4D] text-[#4C9AFF]'
                  : 'text-[#DEEBFF] hover:bg-[#172B4D]/60 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 opacity-80" />
              <span>Tariff Schedule</span>
            </button>

            {/* 7. ANALYTICS */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#172B4D] text-[#4C9AFF]'
                  : 'text-[#DEEBFF] hover:bg-[#172B4D]/60 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 opacity-80" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Atlassian Primary "+ Create" Button */}
          <button
            type="button"
            onClick={onOpenCreateShipment}
            className="bg-[#0C66E4] hover:bg-[#0052CC] text-white font-bold text-xs px-3.5 py-1.5 rounded-md shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-1 active:scale-95"
            title="Create New Shipment Pipeline"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create</span>
          </button>
        </div>

        {/* Right Section: Search Bar & User / Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search Input */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search HS code, shipment..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 pl-8 pr-8 py-1 text-xs bg-[#172B4D] border border-[#253858] rounded-md text-white placeholder-slate-400 focus:outline-hidden focus:bg-[#091E42] focus:border-[#4C9AFF] transition-all"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-[#091E42]/80 px-1 py-0.5 rounded border border-[#253858]">
              ⌘K
            </kbd>
          </div>

          {/* Settings Icon */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-[#172B4D] rounded-md cursor-pointer transition-colors"
            title="Settings & Dashboard"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Help Icon */}
          <button
            type="button"
            onClick={() => alert('A3 Express Cargo Enterprise v2.0\nRefer to the Sidebar pipeline steps to manage customer requirements, vendor allocations, and export documents.')}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-[#172B4D] rounded-md cursor-pointer transition-colors"
            title="Help & Guidance"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Active Role Persona Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('profile')}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#172B4D] hover:bg-[#253858] border border-[#253858] hover:border-[#4C9AFF] transition-all cursor-pointer select-none"
              title="Click to Switch Role Persona"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${user.badgeColor}`}>
                {user.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                  <span>{user.name}</span>
                </div>
                <div className="text-[9px] text-[#4C9AFF] font-mono leading-none">
                  {user.role}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openMenu === 'profile' ? 'rotate-180' : ''}`} />
            </button>

            {openMenu === 'profile' && (
              <div className="absolute right-0 mt-1.5 w-80 bg-[#091E42] border border-[#253858] rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                {/* Active Persona Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#253858]">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${user.badgeColor}`}>
                    {user.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <div className="text-[11px] text-[#4C9AFF] font-semibold">{user.title}</div>
                    <div className="text-[10px] text-slate-400">{user.email}</div>
                  </div>
                </div>

                {/* Role Switcher Section */}
                <div>
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider mb-1.5 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#4C9AFF]" />
                    <span>Switch Role Persona (Demo Simulator)</span>
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                    {(Object.keys(allPersonas) as UserRole[]).map(rKey => {
                      const persona = allPersonas[rKey];
                      const isActive = currentRole === rKey;
                      return (
                        <button
                          key={rKey}
                          onClick={() => {
                            switchRole(rKey);
                            setOpenMenu(null);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#172B4D] border border-[#4C9AFF] text-white'
                              : 'hover:bg-[#172B4D]/60 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${persona.badgeColor}`}>
                              {persona.avatar}
                            </span>
                            <div>
                              <div className="text-xs font-bold">{persona.name}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{persona.title}</div>
                            </div>
                          </div>

                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-[#4C9AFF] shadow-xs" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
