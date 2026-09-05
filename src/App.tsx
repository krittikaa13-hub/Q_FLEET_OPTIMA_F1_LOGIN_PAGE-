/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState, useCallback } from 'react';
import { AuthUser, UserRole } from './types';
import { getCurrentSession, logoutSession, getRoleHomePath, updateUserSession } from './auth/authService';
import { LoginPage } from './components/LoginPage';
import { LoginTransition } from './components/LoginTransition';
import { AccessDenied } from './components/AccessDenied';
import { AuthenticatingScreen } from './components/AuthenticatingScreen';
import { VehicleVerificationScreen } from './components/VehicleVerificationScreen';
import { Dp } from './qfleetCore.js';

function normalizePath(rawPath: string): string {
  const path = rawPath.toLowerCase();
  if (path.endsWith('/admin')) return '/admin';
  if (path.endsWith('/donor')) return '/donor';
  if (path.endsWith('/receiver')) return '/receiver';
  if (path.endsWith('/login')) return '/login';
  return '/';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>('/login');
  const [pendingTransitionRole, setPendingTransitionRole] = useState<UserRole | null>(null);

  // Navigate helper with history push/replace
  const navigateTo = useCallback((toPath: string, replace = false) => {
    const normalized = normalizePath(toPath);
    if (replace) {
      window.history.replaceState(null, '', normalized);
    } else {
      window.history.pushState(null, '', normalized);
    }
    setCurrentPath(normalized);
  }, []);

  // Initial Auth & Route Check
  useEffect(() => {
    const initialRaw = window.location.pathname;
    const initialNormalized = normalizePath(initialRaw);
    const session = getCurrentSession();

    // Small delay to simulate authenticating check without flicker
    const timer = setTimeout(() => {
      if (session) {
        setCurrentUser(session);
        if (initialNormalized === '/login' || initialNormalized === '/') {
          const home = getRoleHomePath(session.role);
          navigateTo(home, true);
        } else {
          setCurrentPath(initialNormalized);
        }
      } else {
        setCurrentUser(null);
        if (initialNormalized !== '/login') {
          navigateTo('/login', true);
        } else {
          setCurrentPath('/login');
        }
      }
      setIsInitializing(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [navigateTo]);

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = normalizePath(window.location.pathname);
      const session = getCurrentSession();

      if (!session) {
        if (path !== '/login') {
          navigateTo('/login', true);
        } else {
          setCurrentPath('/login');
        }
      } else {
        setCurrentUser(session);
        if (path === '/login' || path === '/') {
          navigateTo(getRoleHomePath(session.role), true);
        } else {
          setCurrentPath(path);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateTo]);

  // Login handler
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setPendingTransitionRole(user.role);
  };

  // Transition completion handler
  const handleTransitionComplete = () => {
    if (!pendingTransitionRole) return;
    const home = getRoleHomePath(pendingTransitionRole);
    setPendingTransitionRole(null);
    navigateTo(home, true);
  };

  // Vehicle verification handler
  const handleVehicleVerified = (verifiedVehicleId: string, vehicleModel?: string) => {
    const updated = updateUserSession({
      isVehicleVerified: true,
      verifiedVehicleId,
      verifiedVehicleModel: vehicleModel,
      vehicleId: verifiedVehicleId,
    });
    if (updated) {
      setCurrentUser(updated);
    }
  };

  // Logout handler
  const handleLogout = () => {
    logoutSession();
    setCurrentUser(null);
    setPendingTransitionRole(null);
    navigateTo('/login', true);
  };

  // 1. Initial authenticating state
  if (isInitializing) {
    return <AuthenticatingScreen />;
  }

  // 2. Successful login transition
  if (pendingTransitionRole) {
    return (
      <LoginTransition
        role={pendingTransitionRole}
        onComplete={handleTransitionComplete}
      />
    );
  }

  // 3. Unauthenticated state: always show login page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 4. Authenticated state: Route-based protection
  const userHome = getRoleHomePath(currentUser.role);

  // If path is /login or /: redirect to user's authorized home
  if (currentPath === '/login' || currentPath === '/') {
    navigateTo(userHome, true);
    return null;
  }

  // Check role authorization for protected routes
  if (currentPath === '/admin') {
    if (currentUser.role !== 'admin') {
      return (
        <AccessDenied
          currentUser={currentUser}
          attemptedRole="admin"
          onNavigateHome={() => navigateTo(userHome, true)}
          onLogout={handleLogout}
        />
      );
    }
    return (
      <Dp
        activeRole="admin"
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPath === '/donor') {
    if (currentUser.role !== 'donor') {
      return (
        <AccessDenied
          currentUser={currentUser}
          attemptedRole="donor"
          onNavigateHome={() => navigateTo(userHome, true)}
          onLogout={handleLogout}
        />
      );
    }
    if (!currentUser.isVehicleVerified) {
      return (
        <VehicleVerificationScreen
          currentUser={currentUser}
          role="donor"
          onVerified={handleVehicleVerified}
          onLogout={handleLogout}
        />
      );
    }
    return (
      <Dp
        activeRole="donor"
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPath === '/receiver') {
    if (currentUser.role !== 'receiver') {
      return (
        <AccessDenied
          currentUser={currentUser}
          attemptedRole="receiver"
          onNavigateHome={() => navigateTo(userHome, true)}
          onLogout={handleLogout}
        />
      );
    }
    if (!currentUser.isVehicleVerified) {
      return (
        <VehicleVerificationScreen
          currentUser={currentUser}
          role="receiver"
          onVerified={handleVehicleVerified}
          onLogout={handleLogout}
        />
      );
    }
    return (
      <Dp
        activeRole="receiver"
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  // Fallback for any unknown route: navigate to user's home
  navigateTo(userHome, true);
  return null;
}
