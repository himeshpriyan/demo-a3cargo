import React, { useState } from 'react';
import {
  Ship,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { USER_PERSONAS, type UserRole } from '../types/auth';

export const LoginPage: React.FC = () => {
  const { login, loginAsRole, allPersonas } = useAuth();
  const [email, setEmail] = useState('admin@a3cargo.lk');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setErrorMsg(result.message || 'Login failed. Please select a demo persona.');
        setLoading(false);
      }
    }, 300);
  };

  const handleSelectDemoPersona = (role: UserRole) => {
    const persona = USER_PERSONAS[role];
    setEmail(persona.email);
    setPassword('demo123');
    loginAsRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#071326] via-[#091E42] to-[#0A2540] text-white flex flex-col justify-between font-sans selection:bg-[#0C66E4] selection:text-white">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-800/80 bg-[#091E42]/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0C66E4] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight font-mono text-white">
                A3 EXPRESS
              </span>
              <span className="text-[10px] font-bold bg-[#172B4D] text-[#4C9AFF] px-1.5 py-0.5 rounded border border-[#253858] font-mono">
                CARGO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Sri Lanka Customs Tariff & Freight Operations Portal</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Access Control (RBAC) Active</span>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Standard Login Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#0D2149]/90 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider font-mono">
                Enterprise Authentication
              </span>
              <h1 className="text-2xl font-bold text-white mt-2">Sign in to Operations</h1>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or click any <strong>1-Click Demo Persona</strong> on the right to test different security roles.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <span>✕</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Work Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@a3cargo.lk"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#091730] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-semibold text-slate-300">Password</label>
                  <span className="text-[11px] text-slate-400">Demo: <code className="text-blue-400">demo123</code></span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-[#091730] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-[#4C9AFF] focus:ring-2 focus:ring-[#4C9AFF]/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#0C66E4] hover:bg-[#0052CC] text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <span>{loading ? 'Authenticating...' : 'Sign in to Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero Setup Required for Demo</span>
              </div>
              <p>
                Clicking any role card on the right bypasses manual typing and logs you directly into that persona's perspective.
              </p>
            </div>
          </div>

          {/* Right Column: 1-Click Demo Persona Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <span>1-Click Demo Logins by Role</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select an identity to test field masking, quotation approvals, and departmental tabs:
                </p>
              </div>
              <span className="text-[11px] font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20">
                7 Personas Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(allPersonas) as UserRole[]).map(rKey => {
                const persona = allPersonas[rKey];
                return (
                  <div
                    key={rKey}
                    onClick={() => handleSelectDemoPersona(rKey)}
                    className="group p-3.5 rounded-xl bg-[#0D2149]/70 hover:bg-[#132A5E] border border-slate-700/60 hover:border-[#4C9AFF] transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10 flex flex-col justify-between text-left relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-md ${persona.badgeColor}`}>
                            {persona.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-[#4C9AFF] transition-colors">
                              {persona.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {persona.role}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-mono">
                          Launch &rarr;
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-200 mt-2.5 line-clamp-1">
                        {persona.title}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {persona.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{persona.email}</span>
                      <span className="text-emerald-400 font-semibold">{persona.permissions.length} perms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#091E42]/60 px-6 py-4 text-center text-xs text-slate-500">
        A3 Express Cargo &bull; Sri Lanka Customs Import Tariff & Multi-Stage Logistics Management System &bull; Version 2.4 Enterprise
      </footer>
    </div>
  );
};
