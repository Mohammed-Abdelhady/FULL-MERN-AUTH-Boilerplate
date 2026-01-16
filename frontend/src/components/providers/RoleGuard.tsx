'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectUser, selectIsAuthenticated } from '@/modules/auth/store/authSlice';
import type { UserRole } from '@/modules/auth/types/auth.types';

interface RoleGuardProps {
  readonly children: React.ReactNode;
  readonly allowedRoles: UserRole[];
  readonly fallbackPath?: string;
}

/**
 * RoleGuard component to protect routes based on user roles
 * Redirects unauthorized users to fallback path (default: /)
 * Should be used inside AuthGuard for authenticated routes
 *
 * @example
 * // Protect admin-only route
 * export default function AdminPage() {
 *   return (
 *     <AuthGuard>
 *       <RoleGuard allowedRoles={['admin']}>
 *         <AdminDashboard />
 *       </RoleGuard>
 *     </AuthGuard>
 *   );
 * }
 *
 * @example
 * // Multiple roles allowed
 * export default function ManagerPage() {
 *   return (
 *     <AuthGuard>
 *       <RoleGuard allowedRoles={['admin', 'manager']}>
 *         <ManagerDashboard />
 *       </RoleGuard>
 *     </AuthGuard>
 *   );
 * }
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = '/',
}: Readonly<RoleGuardProps>) {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    // Wait for authentication check
    if (!isAuthenticated || !user) {
      return;
    }

    // Check if user's role is in allowed roles
    const hasPermission = allowedRoles.includes(user.role);

    // If not authorized, redirect to fallback path
    if (!hasPermission) {
      router.push(fallbackPath);
    }
  }, [user, isAuthenticated, allowedRoles, fallbackPath, router]);

  // Don't render if not authenticated or no user
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check permission
  const hasPermission = allowedRoles.includes(user.role);

  // Don't render if not authorized
  if (!hasPermission) {
    return null;
  }

  // User has permission, render children
  return <>{children}</>;
}
