import React, { useState } from 'react';
import { DEMO_ACCOUNTS, loginWithCredentials } from '../auth/authService';
import { AuthUser, DemoAccount } from '../types';
import { Shield, Zap, BatteryCharging, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectDemoAccount = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setSelectedDemoRole(acc.role);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginWithCredentials(email, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen w-screen bg-[#020617] text-slate-100 font-sans flex flex-col relative overflow-hidden select-none">
      {/* Immersive UI Ambient Lighting & Dot Matrix Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 px-6 sm:px-10 py-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m13 2-2 10h8L17 22" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter leading-none text-white">Q-FLEET</span>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase pt-0.5">
              V2V Energy Sharing Platform
            </span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            Network Status:{' '}
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Online
            </span>
          </span>
          <span className="text-slate-500">|</span>
          <span>V2V Nodes: <span className="text-white font-semibold">1,248</span></span>
        </div>
      </header>

      {/* Main Content: Immersive Glass Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 pb-12">
        <div className="w-full max-w-[460px] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-7 sm:p-10 rounded-3xl shadow-2xl relative">
          <div className="text-center mb-7">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm">
              Enter your credentials to access the V2V platform
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                Email / User ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email-input"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedDemoRole(null);
                  }}
                  placeholder="admin@qfleet.com"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-11 pr-4 py-3 text-white outline-none transition-all placeholder:text-slate-600 text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <span className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors uppercase font-bold tracking-widest cursor-pointer">
                  Role-Protected
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-11 pr-11 py-3 text-white outline-none transition-all text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs uppercase tracking-wider">VERIFYING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <span className="text-xs uppercase tracking-wider">LOGIN TO DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Demo Accounts: Immersive 3-Column Pill Pattern */}
          <div className="mt-8 pt-7 border-t border-white/10">
            <p className="text-center text-[10px] font-bold text-slate-500 tracking-[0.2em] mb-4 uppercase">
              Quick Access Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-3">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedDemoRole === acc.role || email.toLowerCase() === acc.email.toLowerCase();
                return (
                  <button
                    key={acc.role}
                    id={`btn-demo-${acc.role}`}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/15 border-blue-400/50 ring-1 ring-blue-400/30'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        acc.role === 'admin'
                          ? 'bg-red-500/20 border-red-500/30'
                          : acc.role === 'donor'
                          ? 'bg-blue-500/20 border-blue-500/30'
                          : 'bg-emerald-500/20 border-emerald-500/30'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          acc.role === 'admin'
                            ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                            : acc.role === 'donor'
                            ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'
                            : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        {acc.role}
                      </span>
                      {acc.vehicleId && (
                        <span className="text-[9px] text-slate-500 font-mono">
                          {acc.vehicleId}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 px-6 sm:px-10 py-6 flex justify-between items-end border-t border-white/5">
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            System Node
          </div>
          <div className="text-xs sm:text-sm text-slate-300 font-mono">
            HQ-NORTH-01 // v2.4.0
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Security Protocol
            </div>
            <div className="text-xs text-blue-400 font-bold font-mono">
              ENCRYPTED AES-256
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-500/30 p-1 flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-blue-500/50 flex items-center justify-center text-[9px] sm:text-[10px] text-blue-400 font-black">
              SSL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
