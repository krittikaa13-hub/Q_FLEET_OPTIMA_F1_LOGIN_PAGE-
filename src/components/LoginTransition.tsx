import React, { useEffect } from 'react';
import { UserRole } from '../types';
import { Shield, Zap, BatteryCharging } from 'lucide-react';

interface LoginTransitionProps {
  role: UserRole;
  onComplete: () => void;
}

export const LoginTransition: React.FC<LoginTransitionProps> = ({ role, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1100);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getContent = () => {
    switch (role) {
      case 'admin':
        return {
          welcome: 'Welcome back, Admin',
          loading: 'Loading Fleet Control Center...',
          icon: Shield,
          color: 'text-red-400',
          dotColor: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
          ringColor: 'border-blue-500',
          gradient: 'from-blue-600 to-cyan-500',
        };
      case 'donor':
        return {
          welcome: 'Welcome, Donor',
          loading: 'Loading Vehicle Energy Workspace...',
          icon: Zap,
          color: 'text-blue-400',
          dotColor: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
          ringColor: 'border-emerald-500',
          gradient: 'from-blue-500 to-emerald-400',
        };
      case 'receiver':
        return {
          welcome: 'Welcome, Receiver',
          loading: 'Loading Energy Request Workspace...',
          icon: BatteryCharging,
          color: 'text-emerald-400',
          dotColor: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
          ringColor: 'border-emerald-400',
          gradient: 'from-emerald-500 to-cyan-400',
        };
    }
  };

  const content = getContent();
  const IconComponent = content.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] font-sans text-slate-100 select-none overflow-hidden">
      {/* Immersive UI Ambient Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Glassmorphic Immersive Dialog */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-5 w-full max-w-sm mx-4 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl">
        {/* Animated Glow & Icon */}
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <IconComponent className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase text-slate-400">
            <div className={`w-2 h-2 rounded-full ${content.dotColor}`} />
            <span>Q-FLEET AUTHENTICATED</span>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {content.welcome}
          </h2>
          <p className="text-xs font-mono text-slate-400">{content.loading}</p>
        </div>

        {/* Circular Progress Ring */}
        <div className="pt-2">
          <div
            className={`w-6 h-6 border-2 ${content.ringColor} border-t-transparent rounded-full animate-spin`}
          />
        </div>
      </div>
    </div>
  );
};
