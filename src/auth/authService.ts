import { AuthUser, DemoAccount, UserRole } from '../types';

const STORAGE_KEY = 'qfleet_auth_session';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'admin',
    email: 'admin@qfleet.com',
    password: 'admin',
    name: 'Fleet Administrator',
    description: 'Full grid visibility, all EVs, all charging stations, & V2V dispatch control',
  },
  {
    role: 'donor',
    email: 'donor@qfleet.com',
    password: 'donor',
    name: 'Donor Operator (EV-007)',
    vehicleId: 'EV-007',
    vehicleModel: 'Tesla Model Y Long Range',
    description: 'Vehicle energy workspace, incoming V2V request handshake, & discharge telemetry',
  },
  {
    role: 'receiver',
    email: 'receiver@qfleet.com',
    password: 'receiver',
    name: 'Receiver Operator (EV-014)',
    vehicleId: 'EV-014',
    vehicleModel: 'Nissan Ariya e-4ORCE',
    description: 'Energy request workspace, optimal donor/station matching, & charge reception',
  },
];

export const getRoleHomePath = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'donor':
      return '/donor';
    case 'receiver':
      return '/receiver';
  }
};

export const getCurrentSession = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (parsed && parsed.email && parsed.role && parsed.token) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const loginWithCredentials = (
  email: string,
  password: string
): { success: boolean; user?: AuthUser; error?: string } => {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { success: false, error: 'Please provide both email/user ID and password.' };
  }

  // Find matching demo account or allow standard demo passwords
  const match = DEMO_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === trimmedEmail ||
      acc.role.toLowerCase() === trimmedEmail ||
      (acc.vehicleId && acc.vehicleId.toLowerCase() === trimmedEmail)
  );

  if (!match) {
    return {
      success: false,
      error: 'Invalid credentials. Please select one of the operational demo accounts below.',
    };
  }

  // Check password - accept configured demo password, role name, or "password"
  const validPasswords = [match.password, match.role, `${match.role}123`, 'password', 'qfleet'];
  if (!validPasswords.includes(trimmedPassword.toLowerCase())) {
    return {
      success: false,
      error: `Incorrect password for ${match.email}. (Demo password hint: ${match.password} or ${match.role}123)`,
    };
  }

  const token = `qfleet_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const user: AuthUser = {
    id: `usr_${match.role}_${Date.now().toString(36)}`,
    email: match.email,
    name: match.name,
    role: match.role,
    vehicleId: match.vehicleId,
    token,
    loginTimestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save session to localStorage:', e);
  }

  return { success: true, user };
};

export const logoutSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove session:', e);
  }
};
