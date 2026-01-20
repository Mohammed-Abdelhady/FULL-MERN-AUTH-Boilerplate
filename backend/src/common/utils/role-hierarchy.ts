import { UserRole } from '../../user/enums/user-role.enum';

/**
 * Role hierarchy for permission checks.
 * Higher numeric values indicate higher privileges.
 * Supports both enum and string-based roles (for migration compatibility).
 * UserRole enum values ('user', 'support', etc.) map to the same keys.
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  user: 1,
  support: 2,
  manager: 3,
  admin: 4,
} as const;

/**
 * Get role hierarchy level for a role string.
 * Custom roles (not in hierarchy) default to level 0.
 *
 * @param role - Role slug or UserRole enum value
 * @returns Hierarchy level (0 for custom roles)
 */
function getRoleLevel(role: string | UserRole): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

/**
 * Check if a user has at least the minimum required role.
 *
 * @param userRole - The user's current role (string or enum)
 * @param requiredRole - The minimum role required (string or enum)
 * @returns true if user has sufficient permissions
 *
 * @example
 * ```typescript
 * hasMinimumRole('manager', 'user'); // true
 * hasMinimumRole('user', 'manager'); // false
 * hasMinimumRole(UserRole.MANAGER, UserRole.USER); // true (backward compat)
 * ```
 */
export function hasMinimumRole(
  userRole: string | UserRole,
  requiredRole: string | UserRole,
): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

/**
 * Check if an actor can manage a target user based on role hierarchy.
 * A user can only manage users with lower or equal role level.
 * Custom roles (level 0) can only be managed by admins.
 *
 * @param actorRole - The role of the user performing the action
 * @param targetRole - The role of the target user
 * @returns true if actor can manage the target
 *
 * @example
 * ```typescript
 * canManageUser('admin', 'manager'); // true
 * canManageUser('manager', 'admin'); // false
 * canManageUser('manager', 'manager'); // true
 * canManageUser('manager', 'custom-role'); // false (custom roles need admin)
 * ```
 */
export function canManageUser(
  actorRole: string | UserRole,
  targetRole: string | UserRole,
): boolean {
  const actorLevel = getRoleLevel(actorRole);
  const targetLevel = getRoleLevel(targetRole);

  // Custom roles (level 0) can only be managed by admins (level 4)
  if (targetLevel === 0) {
    return actorLevel === 4; // admin level
  }

  return actorLevel >= targetLevel;
}

/**
 * Check if a role assignment is valid.
 * ADMIN role cannot be assigned via API (only through database).
 * Custom roles can be assigned.
 *
 * @param newRole - The role to be assigned
 * @returns true if the role can be assigned
 *
 * @example
 * ```typescript
 * isValidRoleAssignment('support'); // true
 * isValidRoleAssignment('admin'); // false
 * isValidRoleAssignment('custom-role'); // true
 * ```
 */
export function isValidRoleAssignment(newRole: string | UserRole): boolean {
  return newRole !== (UserRole.ADMIN as string);
}

/**
 * Check if an actor can view a target user based on role hierarchy.
 * A user can view users with same or lower role level.
 * Admins can view all users including custom roles.
 *
 * @param actorRole - The role of the user performing the action
 * @param targetRole - The role of the target user
 * @returns true if actor can view the target
 */
export function canViewUser(
  actorRole: string | UserRole,
  targetRole: string | UserRole,
): boolean {
  const actorLevel = getRoleLevel(actorRole);
  const targetLevel = getRoleLevel(targetRole);

  // Admins can view all users including custom roles
  if (actorLevel === 4) return true;

  // Custom roles (level 0) can only be viewed by admins
  if (targetLevel === 0) return false;

  return actorLevel >= targetLevel;
}

/**
 * Check if an actor can modify a target user based on role hierarchy.
 * A user can only modify users with strictly lower role level.
 * Custom roles can only be modified by admins.
 *
 * @param actorRole - The role of the user performing the action
 * @param targetRole - The role of the target user
 * @returns true if actor can modify the target
 */
export function canModifyUser(
  actorRole: string | UserRole,
  targetRole: string | UserRole,
): boolean {
  const actorLevel = getRoleLevel(actorRole);
  const targetLevel = getRoleLevel(targetRole);

  // Custom roles (level 0) can only be modified by admins
  if (targetLevel === 0) {
    return actorLevel === 4;
  }

  return actorLevel > targetLevel;
}

/**
 * Get roles that an actor can manage (view/modify).
 * Returns array of system role slugs.
 *
 * @param actorRole - The role of the user performing the action
 * @returns Array of manageable role slugs
 */
export function getManageableRoles(actorRole: string | UserRole): string[] {
  const actorLevel = getRoleLevel(actorRole);
  const systemRoles = ['user', 'support', 'manager', 'admin'];

  return systemRoles.filter((role) => getRoleLevel(role) < actorLevel);
}

/**
 * Get roles that an actor can view (includes same level).
 * Returns array of system role slugs.
 *
 * @param actorRole - The role of the user performing the action
 * @returns Array of viewable role slugs
 */
export function getViewableRoles(actorRole: string | UserRole): string[] {
  const actorLevel = getRoleLevel(actorRole);
  const systemRoles = ['user', 'support', 'manager', 'admin'];

  return systemRoles.filter((role) => getRoleLevel(role) <= actorLevel);
}
