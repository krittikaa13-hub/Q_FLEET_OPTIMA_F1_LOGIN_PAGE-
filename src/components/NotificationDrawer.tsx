import React, { useEffect, useState, useMemo } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Zap,
  BatteryCharging,
  Radio,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { FleetNotification, NotificationFilter } from '../types/notifications';

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function formatFullTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<FleetNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [soundEnabled, setSoundEnabled] = useState(notificationService.isSoundEnabled());

  useEffect(() => {
    const unsubDrawer = notificationService.subscribeToDrawer(open => {
      setIsOpen(open);
    });
    const unsubList = notificationService.subscribe(list => {
      setNotifications(list);
    });
    return () => {
      unsubDrawer();
      unsubList();
    };
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        notificationService.closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'request_accepted':
        return notifications.filter(n => n.type === 'request_accepted');
      case 'donation_completed':
        return notifications.filter(n => n.type === 'donation_completed');
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'all':
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    notificationService.setSoundEnabled(next);
    if (next) {
      notificationService.playAlertChime('donation_completed');
    }
  };

  const handleFocusVehicle = (vehicleId?: string) => {
    if (!vehicleId) return;
    notificationService.emitFocusVehicle(vehicleId);
  };

  if (!isOpen) return null;

  return (
    <div
      id="notification-drawer-backdrop"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) {
          notificationService.closeDrawer();
        }
      }}
    >
      <div
        id="notification-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-drawer-title"
        className="w-full sm:max-w-md md:max-w-lg h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-inner">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="notification-drawer-title"
                    className="font-mono font-bold text-white text-base tracking-wide"
                  >
                    FLEET ALERTS
                  </h2>
                  {unreadCount > 0 ? (
                    <span
                      id="drawer-unread-badge"
                      className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-[11px] font-bold"
                    >
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[11px]">
                      0 new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>LIVE V2V TELEMETRY FEED</span>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-toggle-sound"
                onClick={handleToggleSound}
                title={soundEnabled ? 'Alert chimes enabled (click to mute)' : 'Alert chimes muted (click to unmute)'}
                className={`p-1.5 rounded-lg border transition-colors ${
                  soundEnabled
                    ? 'bg-slate-800/80 border-slate-700 text-cyan-300 hover:text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {unreadCount > 0 && (
                <button
                  id="btn-mark-all-read"
                  onClick={() => notificationService.markAllAsRead()}
                  title="Mark all notifications as read"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-medium transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  id="btn-clear-notifications"
                  onClick={() => notificationService.clearAll()}
                  title="Clear all alerts"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                id="btn-close-drawer"
                onClick={() => notificationService.closeDrawer()}
                title="Close drawer (Esc)"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            <button
              id="filter-tab-all"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-cyan-950 border border-cyan-700 text-cyan-300 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              id="filter-tab-accepted"
              onClick={() => setActiveFilter('request_accepted')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'request_accepted'
                  ? 'bg-emerald-950 border border-emerald-700 text-emerald-300 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Accepted ({notifications.filter(n => n.type === 'request_accepted').length})</span>
            </button>
            <button
              id="filter-tab-completed"
              onClick={() => setActiveFilter('donation_completed')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'donation_completed'
                  ? 'bg-blue-950 border border-blue-700 text-blue-300 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <BatteryCharging className="w-3 h-3 text-blue-400" />
              <span>Completed ({notifications.filter(n => n.type === 'donation_completed').length})</span>
            </button>
            <button
              id="filter-tab-unread"
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'unread'
                  ? 'bg-amber-950 border border-amber-700 text-amber-300 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <div className="font-mono text-slate-300 font-semibold text-sm mb-1">
                No alerts in this view
              </div>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Real-time alerts for accepted energy requests and completed donations will appear here automatically.
              </p>
              <div className="flex items-center gap-2">
                <button
                  id="btn-empty-test-accept"
                  onClick={() => notificationService.triggerTestRequestAccepted()}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-mono transition-colors"
                >
                  + Test Accept
                </button>
                <button
                  id="btn-empty-test-complete"
                  onClick={() => notificationService.triggerTestDonationCompleted()}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-mono transition-colors"
                >
                  + Test Complete
                </button>
              </div>
            </div>
          ) : (
            filteredNotifications.map(item => {
              const isAccepted = item.type === 'request_accepted';
              const isCompleted = item.type === 'donation_completed';
              const isNearby = item.type === 'nearby_request';

              return (
                <div
                  key={item.id}
                  id={`notification-item-${item.id}`}
                  onClick={() => {
                    if (!item.read) {
                      notificationService.markAsRead(item.id);
                    }
                  }}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !item.read
                      ? 'bg-slate-900 border-slate-700 shadow-md hover:border-slate-600'
                      : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-800 text-slate-400'
                  }`}
                >
                  {/* Top Bar: Badge, Unread Dot, Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      {!item.read && (
                        <span
                          className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                          title="Unread alert"
                        />
                      )}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          REQUEST ACCEPTED
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-800 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          DONATION COMPLETED
                        </span>
                      )}
                      {isNearby && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/90 border border-amber-800 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                          <Radio className="w-3 h-3 text-amber-400" />
                          NEARBY REQUEST
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span title={formatFullTime(item.timestamp)}>
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mb-2">
                    <div
                      className={`text-xs font-mono font-bold mb-1 ${
                        !item.read ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {item.title}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {item.message}
                    </p>
                  </div>

                  {/* Metric Chips & Vehicle IDs */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                    {item.donorId && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-semibold">
                        Donor: {item.donorId}
                        {item.donorSoc ? ` (${item.donorSoc}%)` : ''}
                      </span>
                    )}
                    {item.receiverId && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-400 font-semibold">
                        Receiver: {item.receiverId}
                        {item.receiverSoc ? ` (${item.receiverSoc}%)` : ''}
                      </span>
                    )}
                    {item.kwh && (
                      <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
                        ⚡ {item.kwh.toFixed(1)} kWh
                      </span>
                    )}
                    {item.kw && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {item.kw} kW
                      </span>
                    )}
                    {item.efficiencyPct && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                        {item.efficiencyPct}% Eff
                      </span>
                    )}
                    {item.distanceKm && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        📍 {item.distanceKm} km
                      </span>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 text-[11px] font-mono">
                    <div className="flex items-center gap-2">
                      {item.receiverId && (
                        <button
                          id={`btn-inspect-receiver-${item.id}`}
                          onClick={e => {
                            e.stopPropagation();
                            handleFocusVehicle(item.receiverId);
                          }}
                          className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Map {item.receiverId}</span>
                        </button>
                      )}
                      {item.donorId && (
                        <button
                          id={`btn-inspect-donor-${item.id}`}
                          onClick={e => {
                            e.stopPropagation();
                            handleFocusVehicle(item.donorId);
                          }}
                          className="flex items-center gap-1 text-slate-400 hover:text-emerald-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Map {item.donorId}</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!item.read && (
                        <button
                          id={`btn-read-${item.id}`}
                          onClick={e => {
                            e.stopPropagation();
                            notificationService.markAsRead(item.id);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        id={`btn-delete-${item.id}`}
                        onClick={e => {
                          e.stopPropagation();
                          notificationService.deleteNotification(item.id);
                        }}
                        title="Delete notification"
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Bottom Bar / Real-Time Simulation Testing */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 text-xs font-mono">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIMULATE REAL-TIME DISPATCH ALERTS:</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">AUTOSYNC ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-test-request-accepted"
              onClick={() => notificationService.triggerTestRequestAccepted()}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-semibold transition-all active:scale-95"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>+ Request Accepted</span>
            </button>
            <button
              id="btn-test-donation-completed"
              onClick={() => notificationService.triggerTestDonationCompleted()}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-[11px] font-semibold transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              <span>+ Donation Completed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
