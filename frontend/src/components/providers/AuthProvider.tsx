'use client';

import { useAuthValidation } from '@/modules/auth/hooks/useAuthValidation';

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

/**
 * AuthProvider component that validates authentication on app load
 * Checks for valid session cookie and syncs auth state with server
 * Should be placed high in the component tree to validate on every page load
 *
 * @example
 * <AuthProvider>
 *   <YourApp />
 * </AuthProvider>
 */
export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  // Validate authentication state on mount
  // This will check for valid session cookie by calling getCurrentUser API
  useAuthValidation();

  // Don't block rendering - validation happens in background
  // Guards will handle showing loading states if needed
  return <>{children}</>;
}
