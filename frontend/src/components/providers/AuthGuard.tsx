'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectAuthLoading } from '@/modules/auth/store/authSlice';
import { useAuthValidation } from '@/modules/auth/hooks/useAuthValidation';

interface AuthGuardProps {
  readonly children: React.ReactNode;
}

/**
 * AuthGuard component to protect routes requiring authentication
 * Redirects unauthenticated users to login page with return URL
 * Shows nothing while validating authentication state
 *
 * @example
 * // In a protected page
 * export default function DashboardPage() {
 *   return (
 *     <AuthGuard>
 *       <Dashboard />
 *     </AuthGuard>
 *   );
 * }
 */
export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAuthLoading = useAppSelector(selectAuthLoading);
  const isValidating = useAuthValidation();

  useEffect(() => {
    // Wait for validation to complete
    if (isValidating || isAuthLoading) {
      return;
    }

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?redirect=${returnUrl}`);
    }
  }, [isAuthenticated, isAuthLoading, isValidating, pathname, router]);

  // Show nothing while validating or loading
  if (isValidating || isAuthLoading) {
    return null;
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
