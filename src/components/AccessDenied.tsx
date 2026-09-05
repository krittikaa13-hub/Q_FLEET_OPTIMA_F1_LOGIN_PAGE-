import React, { useEffect, useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { getRoleHomePath } from '../auth/authService';
import { ShieldAlert, ArrowLeft, LogOut, AlertTriangle } from 'lucide-react';

interface AccessDeniedProps {
  currentUser: AuthUser;
  attemptedRole: UserRole | string;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  currentUser,
  attemptedRole,
  onNavigateHome,
  onLogout,
}) => {
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNavigateHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNavigateHome]);

  const userHome = getRoleHomePath(currentUser.role);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#020617] text-slate-100 p-4 relative font-sans select-none overflow-hidden">
      {/* Immersive UI Ambient Lighting & Dot Matrix Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-red-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-[460px] bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 space-y-6 text-center">
        {/* Warning Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)] mb-1">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-red-400 text-xs font-mono font-bold tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ACCESS RESTRICTED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ACCESS DENIED
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Role-Based Access Control Boundary
          </p>
        </div>

        {/* Role Details */}
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-left space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Attempted Route:</span>
            <span className="text-red-400 font-bold px-2 py-0.5 rounded-lg bg-red-950/40 border border-red-800/50">
              /{attemptedRole}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Your Active Role:</span>
            <span className="text-blue-400 font-bold px-2 py-0.5 rounded-lg bg-blue-950/40 border border-blue-800/50">
              {currentUser.role.toUpperCase()}
              {currentUser.vehicleId ? ` (${currentUser.vehicleId})` : ''}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Logged In As:</span>
            <span className="text-slate-300 truncate max-w-[200px]">{currentUser.email}</span>
          </div>
          <p className="pt-2 text-[11px] text-slate-400 border-t border-white/5 leading-relaxed">
            {currentUser.role === 'donor' &&
              'Donor accounts are restricted to vehicle energy operations and cannot access fleet administration.'}
            {currentUser.role === 'receiver' &&
              'Receiver accounts are restricted to energy request operations and cannot access donor or fleet admin controls.'}
            {currentUser.role === 'admin' &&
              'Fleet administrator accounts operate the central fleet dispatch center.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            id="btn-return-home"
            type="button"
            onClick={onNavigateHome}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono tracking-wider shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO MY WORKSPACE ({userHome})</span>
          </button>

          <button
            id="btn-access-denied-logout"
            type="button"
            onClick={onLogout}
            className="w-full py-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LOG OUT & SWITCH ROLE</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-500 font-mono">
          Auto-redirecting in {countdown}s...
        </p>
      </div>
    </div>
  );
};
