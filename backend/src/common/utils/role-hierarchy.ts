import { UserRole } from '../../user/enums/user-role.enum';

/**
 * Role hierarchy for permission checks.
 * Higher numeric values indicate higher privileges.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.SUPPORT]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.ADMIN]: 4,
} as const;

/**
 * Check if a user has at least the minimum required role.
 *
 * @param userRole - The user's current role
 * @param requiredRole - The minimum role required
 * @returns true if user has sufficient permissions
 *
 * @example
 * ```typescript
 * hasMinimumRole(UserRole.MANAGER, UserRole.USER); // true
 * hasMinimumRole(UserRole.USER, UserRole.MANAGER); // false
 * ```
 */
export function hasMinimumRole(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if an actor can manage a target user based on role hierarchy.
 * A user can only manage users with lower or equal role level.
 *
 * @param actorRole - The role of the user performing the action
 * @param targetRole - The role of the target user
 * @returns true if actor can manage the target
 *
 * @example
 * ```typescript
 * canManageUser(UserRole.ADMIN, UserRole.MANAGER); // true
 * canManageUser(UserRole.MANAGER, UserRole.ADMIN); // false
 * canManageUser(UserRole.MANAGER, UserRole.MANAGER); // true
 * ```
 */
export function canManageUser(
  actorRole: UserRole,
  targetRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[actorRole] >= ROLE_HIERARCHY[targetRole];
}

/**
 * Check if a role assignment is valid.
 * ADMIN role cannot be assigned via API (only through database).
 *
 * @param newRole - The role to be assigned
 * @returns true if the role can be assigned
 *
 * @example
 * ```typescript
 * isValidRoleAssignment(UserRole.SUPPORT); // true
 * isValidRoleAssignment(UserRole.ADMIN); // false
 * ```
 */
export function isValidRoleAssignment(newRole: UserRole): boolean {
  return newRole !== UserRole.ADMIN;
}

/**
 * Check if an actor can view a target user based on role hierarchy.
 * A user can view users with same or lower role level.
 *
 * @param actorRole - The role of the user performing the action
 * @param targetRole - The role of the target user
 * @returns true if actor can view the target
 */
export function canViewUser(
  actorRole: UserRole,
  targetRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[actorRole] >= ROLE_HIERARCHY[targetRole];
}

/**
 * Check if an actor can modify a target user based on role hierarchy.
 * A user can only modify users with strictly lower role level.
 *
 * @param actorRole - The role of the user performing the action
 * @param targetRole - The role of the target user
 * @returns true if actor can modify the target
 */
export function canModifyUser(
  actorRole: UserRole,
  targetRole: UserRole,
): boolean {
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Get roles that an actor can manage (view/modify).
 *
 * @param actorRole - The role of the user performing the action
 * @returns Array of manageable roles
 */
export function getManageableRoles(actorRole: UserRole): UserRole[] {
  const actorLevel = ROLE_HIERARCHY[actorRole];
  return Object.values(UserRole).filter(
    (role) => ROLE_HIERARCHY[role] < actorLevel,
  );
}

/**
 * Get roles that an actor can view (includes same level).
 *
 * @param actorRole - The role of the user performing the action
 * @returns Array of viewable roles
 */
export function getViewableRoles(actorRole: UserRole): UserRole[] {
  const actorLevel = ROLE_HIERARCHY[actorRole];
  return Object.values(UserRole).filter(
    (role) => ROLE_HIERARCHY[role] <= actorLevel,
  );
}
