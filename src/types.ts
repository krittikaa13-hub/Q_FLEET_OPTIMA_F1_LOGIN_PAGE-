export type UserRole = 'admin' | 'donor' | 'receiver';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  vehicleId?: string;
  token: string;
  loginTimestamp: number;
  isVehicleVerified?: boolean;
  verifiedVehicleId?: string;
  verifiedVehicleModel?: string;
}

export interface DemoAccount {
  role: UserRole;
  email: string;
  password: string;
  name: string;
  vehicleId?: string;
  description: string;
  vehicleModel?: string;
}
