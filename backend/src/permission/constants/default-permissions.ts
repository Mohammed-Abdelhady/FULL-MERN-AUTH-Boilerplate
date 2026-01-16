/**
 * Default permissions for regular users
 * These permissions define what regular users can access
 */
export const DEFAULT_USER_PERMISSIONS: string[] = [
  'profile:read',
  'profile:update',
];

/**
 * Default permissions for support users
 * Support users can view profiles and user sessions
 */
export const DEFAULT_SUPPORT_PERMISSIONS: string[] = [
  'profile:read',
  'profile:update',
  'users:read',
  'sessions:read',
];

/**
 * Default permissions for manager users
 * Managers can manage users and view sessions
 */
export const DEFAULT_MANAGER_PERMISSIONS: string[] = [
  'profile:read',
  'profile:update',
  'users:read',
  'users:update',
  'sessions:read',
];

/**
 * Default permissions for admin users
 * Admins typically have access to everything, represented by wildcard
 */
export const DEFAULT_ADMIN_PERMISSIONS: string[] = ['*'];

/**
 * Standard permission strings
 * Format: resource:action
 *
 * Resources:
 * - profile: User profile information
 * - users: User management (admin only)
 * - sessions: Session management (admin only)
 * - permissions: Permission management (admin only)
 *
 * Actions:
 * - read: View resource
 * - create: Create new resource
 * - update: Modify existing resource
 * - delete: Remove resource
 * - list: List all resources
 *
 * Scopes:
 * - own: Only user's own resources
 * - all: All resources (admin only)
 * - team: Team resources (future feature)
 */
export const PERMISSION_CATEGORIES = {
  PROFILE: 'profile',
  USERS: 'users',
  SESSIONS: 'sessions',
  PERMISSIONS: 'permissions',
} as const;

export const PERMISSION_ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
} as const;

export const PERMISSION_SCOPES = {
  OWN: 'own',
  ALL: 'all',
  TEAM: 'team',
} as const;
