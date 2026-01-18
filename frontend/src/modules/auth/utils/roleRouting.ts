import type { UserRole } from '../types/auth.types';

/**
 * Role-to-dashboard URL mapping
 * Defines which dashboard each user role should access
 */
const ROLE_DASHBOARDS: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  manager: '/manager/dashboard',
  support: '/support/dashboard',
  user: '/dashboard',
};

/**
 * Maps user role to appropriate dashboard route
 * Provides type-safe routing for role-based navigation
 *
 * @param role - User role from auth state
 * @returns Dashboard URL path
 *
 * @example
 * const dashboardUrl = getRoleDashboard('admin');
 * // Returns: '/admin/dashboard'
 *
 * @example
 * const dashboardUrl = getRoleDashboard('user');
 * // Returns: '/dashboard'
 */
export function getRoleDashboard(role: UserRole): string {
  const dashboardUrl = ROLE_DASHBOARDS[role];

  if (!dashboardUrl) {
    console.warn(`Unknown role: ${role}, defaulting to /dashboard`);
    return '/dashboard';
  }

  return dashboardUrl;
}
