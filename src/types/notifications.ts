export type NotificationType =
  | 'request_accepted'
  | 'donation_completed'
  | 'nearby_request'
  | 'system';

export interface FleetNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  donorId?: string;
  receiverId?: string;
  kwh?: number;
  kw?: number;
  efficiencyPct?: number;
  distanceKm?: number;
  donorSoc?: number;
  receiverSoc?: number;
  sessionId?: string;
}

export type NotificationFilter = 'all' | 'request_accepted' | 'donation_completed' | 'unread';
