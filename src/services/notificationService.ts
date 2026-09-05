import { FleetNotification, NotificationType } from '../types/notifications';

type NotificationListener = (notifications: FleetNotification[]) => void;
type DrawerListener = (isOpen: boolean) => void;
type ToastListener = (notification: FleetNotification) => void;
type VehicleFocusListener = (vehicleId: string) => void;

const STORAGE_KEY = 'qfleet_notifications_v1';
const SOUND_PREF_KEY = 'qfleet_sound_enabled';

// Initial realistic notifications so the user has recent history on first load
function getDefaultNotifications(): FleetNotification[] {
  const now = Date.now();
  return [
    {
      id: 'notif-init-1',
      type: 'donation_completed',
      title: 'V2V Donation Completed',
      message: 'Donor EV-003 successfully delivered 14.5 kWh to Receiver EV-018 at 94% grid efficiency. Handshake closed and telemetry logged.',
      timestamp: now - 3 * 60 * 1000, // 3 minutes ago
      read: false,
      donorId: 'EV-003',
      receiverId: 'EV-018',
      kwh: 14.5,
      kw: 20,
      efficiencyPct: 94,
      distanceKm: 0.8,
      donorSoc: 65,
      receiverSoc: 52,
      sessionId: 'V2V-EV-003-EV-018-HIST'
    },
    {
      id: 'notif-init-2',
      type: 'request_accepted',
      title: 'Nearby Energy Request Accepted',
      message: 'Donor EV-007 accepted transfer request from Receiver EV-014 (12.0 kWh). Direct power transfer handshake established.',
      timestamp: now - 8 * 60 * 1000, // 8 minutes ago
      read: false,
      donorId: 'EV-007',
      receiverId: 'EV-014',
      kwh: 12.0,
      kw: 20,
      efficiencyPct: 94,
      distanceKm: 1.1,
      donorSoc: 82,
      receiverSoc: 24,
      sessionId: 'V2V-EV-007-EV-014-ACTIVE'
    },
    {
      id: 'notif-init-3',
      type: 'nearby_request',
      title: 'Nearby Critical Energy Request',
      message: 'Receiver EV-014 broadcast critical energy deficit (22% SOC, 18.0 kWh needed). Feasible donor EV-007 in proximity (1.1 km).',
      timestamp: now - 15 * 60 * 1000, // 15 minutes ago
      read: true,
      receiverId: 'EV-014',
      kwh: 18.0,
      distanceKm: 1.1,
      receiverSoc: 22
    }
  ];
}

class NotificationService {
  private notifications: FleetNotification[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private drawerListeners: Set<DrawerListener> = new Set();
  private toastListeners: Set<ToastListener> = new Set();
  private vehicleFocusListeners: Set<VehicleFocusListener> = new Set();
  private drawerOpen: boolean = false;
  private soundEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;
  private processedSessionIds: Set<string> = new Set();
  private completedSessionIds: Set<string> = new Set();
  private isPtHooked: boolean = false;
  private ptEngine: any = null;

  constructor() {
    this.loadFromStorage();
    this.initSoundPref();
  }

  public setPtEngine(pt: any) {
    if (!pt) return;
    this.ptEngine = pt;
    this.hookPtEngine();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.notifications = parsed;
            return;
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
    this.notifications = getDefaultNotifications();
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications.slice(0, 50)));
      }
    } catch {
      // Ignore storage errors
    }
  }

  private initSoundPref() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(SOUND_PREF_KEY);
        if (stored !== null) {
          this.soundEnabled = stored === 'true';
        }
      }
    } catch {
      // Ignore
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(SOUND_PREF_KEY, String(enabled));
      }
    } catch {
      // Ignore
    }
  }

  public playAlertChime(type: NotificationType = 'request_accepted') {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      gain.connect(this.audioCtx.destination);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      if (type === 'donation_completed') {
        // High harmonic ascending chime for donation completed
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.18); // A5
        osc1.connect(gain);
        osc1.start(now);
        osc1.stop(now + 0.45);
      } else {
        // Crisp dual chime for request accepted
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.12); // E5
        osc1.connect(gain);
        osc1.start(now);
        osc1.stop(now + 0.45);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, now + 0.12); // G5
        osc2.connect(gain);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.45);
      }
    } catch {
      // Audio might fail if user has not interacted with page yet, safely ignore
    }
  }

  // Hook into Pt simulation engine to capture real-time V2V state changes
  private hookPtEngine() {
    const pt = this.ptEngine;
    if (this.isPtHooked || !pt) return;
    this.isPtHooked = true;

    // 1. Intercept acceptV2VRequest directly
    if (typeof pt.acceptV2VRequest === 'function') {
      const originalAccept = pt.acceptV2VRequest.bind(pt);
      pt.acceptV2VRequest = (donorId: string, receiverId: string) => {
        const result = originalAccept(donorId, receiverId);
        if (result) {
          const donor = pt.vehicles?.find((v: { id: string }) => v.id === donorId);
          const receiver = pt.vehicles?.find((v: { id: string }) => v.id === receiverId);
          const kwh = receiver?.energyDemandKwh > 0 ? Math.min(18, receiver.energyDemandKwh) : 12;
          this.notifyEnergyRequestAccepted({
            donorId,
            receiverId,
            kwh,
            kw: 20,
            donorSoc: donor?.soc ? Math.round(donor.soc) : undefined,
            receiverSoc: receiver?.soc ? Math.round(receiver.soc) : undefined,
            distanceKm: 1.1
          });
        }
        return result;
      };
    }

    // 2. Intercept completeV2VTransfer directly
    if (typeof pt.completeV2VTransfer === 'function') {
      const originalComplete = pt.completeV2VTransfer.bind(pt);
      pt.completeV2VTransfer = (sessionId: string) => {
        const session = pt.activeSessions?.find((s: { sessionId: string }) => s.sessionId === sessionId);
        const result = originalComplete(sessionId);
        if (session) {
          this.notifyDonationCompleted({
            sessionId,
            donorId: session.donorId,
            receiverId: session.receiverId,
            kwh: session.requestedKwh || session.transferredKwh || 12,
            kw: session.powerKw || 20,
            efficiencyPct: session.efficiencyPct || 94
          });
        }
        return result;
      };
    }

    // 3. Intercept requestV2V directly
    if (typeof pt.requestV2V === 'function') {
      const originalRequest = pt.requestV2V.bind(pt);
      pt.requestV2V = (receiverId: string, donorId: string, kwh: number = 12) => {
        const result = originalRequest(receiverId, donorId, kwh);
        if (result) {
          const receiver = pt.vehicles?.find((v: { id: string }) => v.id === receiverId);
          this.notifyNearbyRequest({
            receiverId,
            donorId,
            kwh,
            receiverSoc: receiver?.soc ? Math.round(receiver.soc) : 22,
            distanceKm: 1.1
          });
        }
        return result;
      };
    }

    // 4. Subscribe to state changes as a resilient fallback
    if (typeof pt.subscribe === 'function') {
      pt.subscribe((state: { activeSessions?: Array<{ sessionId: string; status: string; donorId: string; receiverId: string; requestedKwh: number; powerKw: number; efficiencyPct: number; progressPct: number }>; vehicles?: Array<{ id: string; assignmentStatus?: string; status?: string; soc?: number }> }) => {
        if (!state || !state.activeSessions) return;

        // Check active sessions
        for (const session of state.activeSessions) {
          if (session.status === 'active' && !this.processedSessionIds.has(session.sessionId)) {
            this.processedSessionIds.add(session.sessionId);
            // If not already alerted via direct hook
            const existing = this.notifications.find(n => n.sessionId === session.sessionId && n.type === 'request_accepted');
            if (!existing) {
              this.notifyEnergyRequestAccepted({
                donorId: session.donorId,
                receiverId: session.receiverId,
                kwh: session.requestedKwh || 12,
                kw: session.powerKw || 20,
                sessionId: session.sessionId
              });
            }
          }

          if (session.status === 'completed' && !this.completedSessionIds.has(session.sessionId)) {
            this.completedSessionIds.add(session.sessionId);
            const existing = this.notifications.find(n => n.sessionId === session.sessionId && n.type === 'donation_completed');
            if (!existing) {
              this.notifyDonationCompleted({
                sessionId: session.sessionId,
                donorId: session.donorId,
                receiverId: session.receiverId,
                kwh: session.requestedKwh || 12,
                kw: session.powerKw || 20,
                efficiencyPct: session.efficiencyPct || 94
              });
            }
          }
        }
      });
    }
  }

  // Add a generic notification
  public addNotification(notification: Omit<FleetNotification, 'id' | 'timestamp' | 'read'>): FleetNotification {
    const fullNotification: FleetNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      read: false
    };

    this.notifications.unshift(fullNotification);
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveToStorage();
    this.playAlertChime(fullNotification.type);

    // Notify listeners
    this.notifyListeners();

    // Trigger toast if drawer is closed
    if (!this.drawerOpen) {
      this.notifyToastListeners(fullNotification);
    }

    return fullNotification;
  }

  // Real-time alert: Energy Request Accepted
  public notifyEnergyRequestAccepted(data: {
    donorId: string;
    receiverId: string;
    kwh: number;
    kw?: number;
    distanceKm?: number;
    donorSoc?: number;
    receiverSoc?: number;
    sessionId?: string;
  }) {
    const kw = data.kw || 20;
    const dist = data.distanceKm || 1.1;
    return this.addNotification({
      type: 'request_accepted',
      title: 'Nearby Energy Request Accepted',
      message: `Donor ${data.donorId} accepted energy request from Receiver ${data.receiverId}. Handshake confirmed: ${data.kwh.toFixed(1)} kWh at ${kw} kW over ${dist} km proximity.`,
      donorId: data.donorId,
      receiverId: data.receiverId,
      kwh: data.kwh,
      kw,
      efficiencyPct: 94,
      distanceKm: dist,
      donorSoc: data.donorSoc,
      receiverSoc: data.receiverSoc,
      sessionId: data.sessionId
    });
  }

  // Real-time alert: Donation Completed
  public notifyDonationCompleted(data: {
    sessionId?: string;
    donorId: string;
    receiverId: string;
    kwh: number;
    kw?: number;
    efficiencyPct?: number;
    donorSoc?: number;
    receiverSoc?: number;
  }) {
    const eff = data.efficiencyPct || 94;
    return this.addNotification({
      type: 'donation_completed',
      title: 'V2V Donation Completed',
      message: `Direct power transfer successful: ${data.donorId} delivered ${data.kwh.toFixed(1)} kWh to ${data.receiverId} with ${eff}% efficiency. Both vehicle batteries recalibrated.`,
      donorId: data.donorId,
      receiverId: data.receiverId,
      kwh: data.kwh,
      kw: data.kw || 20,
      efficiencyPct: eff,
      donorSoc: data.donorSoc,
      receiverSoc: data.receiverSoc,
      sessionId: data.sessionId
    });
  }

  // Real-time alert: Nearby Energy Request
  public notifyNearbyRequest(data: {
    receiverId: string;
    donorId?: string;
    kwh: number;
    receiverSoc?: number;
    distanceKm?: number;
  }) {
    const dist = data.distanceKm || 1.1;
    return this.addNotification({
      type: 'nearby_request',
      title: 'Nearby Energy Request Broadcast',
      message: `Receiver ${data.receiverId} (${data.receiverSoc || 22}% SOC) requested ${data.kwh.toFixed(1)} kWh from nearby donor${data.donorId ? ` ${data.donorId}` : ''} (${dist} km).`,
      receiverId: data.receiverId,
      donorId: data.donorId,
      kwh: data.kwh,
      receiverSoc: data.receiverSoc,
      distanceKm: dist
    });
  }

  // Simulated Test Triggers
  public triggerTestRequestAccepted() {
    const donorId = 'EV-007';
    const receiverId = 'EV-014';
    return this.notifyEnergyRequestAccepted({
      donorId,
      receiverId,
      kwh: 12.0,
      kw: 20,
      distanceKm: 1.1,
      donorSoc: 78,
      receiverSoc: 24,
      sessionId: `V2V-${donorId}-${receiverId}-${Date.now()}`
    });
  }

  public triggerTestDonationCompleted() {
    const donorId = 'EV-007';
    const receiverId = 'EV-014';
    return this.notifyDonationCompleted({
      sessionId: `V2V-${donorId}-${receiverId}-${Date.now()}`,
      donorId,
      receiverId,
      kwh: 12.0,
      kw: 20,
      efficiencyPct: 94,
      donorSoc: 66,
      receiverSoc: 44
    });
  }

  public triggerTestNearbyRequest() {
    return this.notifyNearbyRequest({
      receiverId: 'EV-014',
      donorId: 'EV-007',
      kwh: 18.0,
      receiverSoc: 22,
      distanceKm: 1.1
    });
  }

  // Getters & Actions
  public getNotifications(): FleetNotification[] {
    return [...this.notifications];
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public markAsRead(id: string) {
    let changed = false;
    this.notifications = this.notifications.map(n => {
      if (n.id === id && !n.read) {
        changed = true;
        return { ...n, read: true };
      }
      return n;
    });
    if (changed) {
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public markAllAsRead() {
    let changed = false;
    this.notifications = this.notifications.map(n => {
      if (!n.read) {
        changed = true;
        return { ...n, read: true };
      }
      return n;
    });
    if (changed) {
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  public clearAll() {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  // Drawer Open / Close State
  public isDrawerOpen(): boolean {
    return this.drawerOpen;
  }

  public openDrawer() {
    if (!this.drawerOpen) {
      this.drawerOpen = true;
      this.notifyDrawerListeners();
    }
  }

  public closeDrawer() {
    if (this.drawerOpen) {
      this.drawerOpen = false;
      this.notifyDrawerListeners();
    }
  }

  public toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
    this.notifyDrawerListeners();
  }

  // Focus vehicle on map
  public emitFocusVehicle(vehicleId: string) {
    for (const listener of this.vehicleFocusListeners) {
      listener(vehicleId);
    }
  }

  public onFocusVehicle(listener: VehicleFocusListener): () => void {
    this.vehicleFocusListeners.add(listener);
    return () => {
      this.vehicleFocusListeners.delete(listener);
    };
  }

  // Subscriptions
  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.getNotifications());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeToDrawer(listener: DrawerListener): () => void {
    this.drawerListeners.add(listener);
    listener(this.drawerOpen);
    return () => {
      this.drawerListeners.delete(listener);
    };
  }

  public subscribeToToast(listener: ToastListener): () => void {
    this.toastListeners.add(listener);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  private notifyListeners() {
    const list = this.getNotifications();
    for (const listener of this.listeners) {
      listener(list);
    }
  }

  private notifyDrawerListeners() {
    for (const listener of this.drawerListeners) {
      listener(this.drawerOpen);
    }
  }

  private notifyToastListeners(notification: FleetNotification) {
    for (const listener of this.toastListeners) {
      listener(notification);
    }
  }
}

export const notificationService = new NotificationService();
