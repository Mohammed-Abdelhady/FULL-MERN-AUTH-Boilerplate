import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for storing required permissions in route handlers.
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions for a route.
 * Use this decorator on controller methods to enforce permission checks.
 *
 * @param permissions - Array of required permissions (all must be present)
 *
 * @example
 * ```typescript
 * @RequirePermissions('users:read:all', 'users:update:all')
 * @Get(':id')
 * async getUser(@Param('id') id: string) {
 *   return this.userService.findById(id);
 * }
 * ```
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Metadata key for storing required permissions with OR logic.
 */
export const ANY_PERMISSIONS_KEY = 'anyPermissions';

/**
 * Decorator to require ANY of the specified permissions for a route.
 * User needs at least one of the listed permissions.
 *
 * @param permissions - Array of permissions (user needs at least one)
 *
 * @example
 * ```typescript
 * @RequireAnyPermission('users:read:all', 'users:read:own')
 * @Get('profile')
 * async getProfile() {
 *   return this.userService.getProfile();
 * }
 * ```
 */
export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(ANY_PERMISSIONS_KEY, permissions);
