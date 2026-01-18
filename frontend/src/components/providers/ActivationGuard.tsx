'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  selectIsAuthenticated,
  selectUser,
  selectAuthLoading,
} from '@/modules/auth/store/authSlice';
import { WelcomeModal } from '@/components/welcome/WelcomeModal';

interface ActivationGuardProps {
  readonly children: React.ReactNode;
}

/**
 * ActivationGuard component to protect activation route
 * Shows welcome modal if user is already activated
 * Allows unauthenticated users to proceed with activation
 * Relies on AuthProvider for global session validation
 *
 * @example
 * // In activation page
 * export default function ActivatePage() {
 *   return (
 *     <ActivationGuard>
 *       <ActivationForm />
 *     </ActivationGuard>
 *   );
 * }
 */
export function ActivationGuard({ children }: Readonly<ActivationGuardProps>) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isAuthLoading = useAppSelector(selectAuthLoading);
  const [showWelcome, setShowWelcome] = useState(true);

  // Show nothing while loading auth state
  if (isAuthLoading) {
    return null;
  }

  // If authenticated, show welcome modal
  if (isAuthenticated && user) {
    return (
      <WelcomeModal
        isOpen={showWelcome}
        userName={user.name}
        onClose={() => setShowWelcome(false)}
      />
    );
  }

  // User is not authenticated, render activation form
  return <>{children}</>;
}
