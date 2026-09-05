import React, { useEffect, useState } from 'react';
import { Zap, CheckCircle2, Radio, Bell, X, ArrowRight } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { FleetNotification } from '../types/notifications';

interface ToastItem extends FleetNotification {
  toastId: string;
}

export function NotificationToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsub = notificationService.subscribeToToast((notification: FleetNotification) => {
      const item: ToastItem = {
        ...notification,
        toastId: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`
      };

      setToasts(prev => [item, ...prev.slice(0, 2)]); // Keep at most 3 toasts

      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.toastId !== item.toastId));
      }, 6000);
    });

    return unsub;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      id="notification-toast-container"
      className="fixed top-20 right-4 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map(toast => {
        const isAccepted = toast.type === 'request_accepted';
        const isCompleted = toast.type === 'donation_completed';

        return (
          <div
            key={toast.toastId}
            id={`toast-${toast.id}`}
            className="pointer-events-auto bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 fade-in duration-200 text-white select-none"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isAccepted
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                      : isCompleted
                      ? 'bg-cyan-950 border border-cyan-800 text-cyan-400'
                      : 'bg-amber-950 border border-amber-800 text-amber-400'
                  }`}
                >
                  {isAccepted && <Zap className="w-4 h-4" />}
                  {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  {!isAccepted && !isCompleted && <Radio className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                      {isAccepted
                        ? 'REQUEST ACCEPTED'
                        : isCompleted
                        ? 'DONATION COMPLETED'
                        : 'NEARBY ALERT'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">REAL-TIME</span>
                  </div>
                  <h4 className="text-xs font-mono font-bold text-white mt-0.5">
                    {toast.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => {
                  setToasts(prev => prev.filter(t => t.toastId !== toast.toastId));
                }}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 font-sans">
              {toast.message}
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                {toast.kwh && (
                  <span className="text-cyan-300 font-semibold">
                    ⚡ {toast.kwh.toFixed(1)} kWh
                  </span>
                )}
                {toast.donorId && (
                  <span className="text-emerald-400">
                    {toast.donorId}
                  </span>
                )}
                {toast.receiverId && (
                  <span className="text-rose-400">
                    ➔ {toast.receiverId}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setToasts(prev => prev.filter(t => t.toastId !== toast.toastId));
                  notificationService.markAsRead(toast.id);
                  notificationService.openDrawer();
                }}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                <span>View Alert</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
