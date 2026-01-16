import { UserRole } from '../../user/enums/user-role.enum';
import {
  hasMinimumRole,
  canManageUser,
  canViewUser,
  canModifyUser,
  isValidRoleAssignment,
  getManageableRoles,
  getViewableRoles,
  ROLE_HIERARCHY,
} from './role-hierarchy';

describe('Role Hierarchy Utilities', () => {
  describe('ROLE_HIERARCHY', () => {
    it('should have correct hierarchy values', () => {
      expect(ROLE_HIERARCHY[UserRole.USER]).toBe(1);
      expect(ROLE_HIERARCHY[UserRole.SUPPORT]).toBe(2);
      expect(ROLE_HIERARCHY[UserRole.MANAGER]).toBe(3);
      expect(ROLE_HIERARCHY[UserRole.ADMIN]).toBe(4);
    });
  });

  describe('hasMinimumRole', () => {
    it('should return true when user role is higher than required', () => {
      expect(hasMinimumRole(UserRole.ADMIN, UserRole.USER)).toBe(true);
      expect(hasMinimumRole(UserRole.MANAGER, UserRole.SUPPORT)).toBe(true);
    });

    it('should return true when user role equals required', () => {
      expect(hasMinimumRole(UserRole.ADMIN, UserRole.ADMIN)).toBe(true);
      expect(hasMinimumRole(UserRole.USER, UserRole.USER)).toBe(true);
    });

    it('should return false when user role is lower than required', () => {
      expect(hasMinimumRole(UserRole.USER, UserRole.ADMIN)).toBe(false);
      expect(hasMinimumRole(UserRole.SUPPORT, UserRole.MANAGER)).toBe(false);
    });
  });

  describe('canManageUser', () => {
    it('should return true when actor has higher role', () => {
      expect(canManageUser(UserRole.ADMIN, UserRole.MANAGER)).toBe(true);
      expect(canManageUser(UserRole.MANAGER, UserRole.SUPPORT)).toBe(true);
    });

    it('should return true when actor has equal role', () => {
      expect(canManageUser(UserRole.MANAGER, UserRole.MANAGER)).toBe(true);
    });

    it('should return false when actor has lower role', () => {
      expect(canManageUser(UserRole.USER, UserRole.ADMIN)).toBe(false);
      expect(canManageUser(UserRole.SUPPORT, UserRole.MANAGER)).toBe(false);
    });
  });

  describe('canViewUser', () => {
    it('should return true when actor has higher role', () => {
      expect(canViewUser(UserRole.ADMIN, UserRole.USER)).toBe(true);
    });

    it('should return true when actor has equal role', () => {
      expect(canViewUser(UserRole.MANAGER, UserRole.MANAGER)).toBe(true);
    });

    it('should return false when actor has lower role', () => {
      expect(canViewUser(UserRole.USER, UserRole.ADMIN)).toBe(false);
    });
  });

  describe('canModifyUser', () => {
    it('should return true when actor has strictly higher role', () => {
      expect(canModifyUser(UserRole.ADMIN, UserRole.MANAGER)).toBe(true);
      expect(canModifyUser(UserRole.MANAGER, UserRole.USER)).toBe(true);
    });

    it('should return false when actor has equal role', () => {
      expect(canModifyUser(UserRole.MANAGER, UserRole.MANAGER)).toBe(false);
    });

    it('should return false when actor has lower role', () => {
      expect(canModifyUser(UserRole.USER, UserRole.ADMIN)).toBe(false);
    });
  });

  describe('isValidRoleAssignment', () => {
    it('should return true for non-ADMIN roles', () => {
      expect(isValidRoleAssignment(UserRole.USER)).toBe(true);
      expect(isValidRoleAssignment(UserRole.SUPPORT)).toBe(true);
      expect(isValidRoleAssignment(UserRole.MANAGER)).toBe(true);
    });

    it('should return false for ADMIN role', () => {
      expect(isValidRoleAssignment(UserRole.ADMIN)).toBe(false);
    });
  });

  describe('getManageableRoles', () => {
    it('should return roles lower than actor role', () => {
      const manageableByAdmin = getManageableRoles(UserRole.ADMIN);
      expect(manageableByAdmin).toContain(UserRole.USER);
      expect(manageableByAdmin).toContain(UserRole.SUPPORT);
      expect(manageableByAdmin).toContain(UserRole.MANAGER);
      expect(manageableByAdmin).not.toContain(UserRole.ADMIN);
    });

    it('should return empty array for USER role', () => {
      const manageableByUser = getManageableRoles(UserRole.USER);
      expect(manageableByUser).toHaveLength(0);
    });

    it('should return only USER for SUPPORT role', () => {
      const manageableBySupport = getManageableRoles(UserRole.SUPPORT);
      expect(manageableBySupport).toContain(UserRole.USER);
      expect(manageableBySupport).toHaveLength(1);
    });
  });

  describe('getViewableRoles', () => {
    it('should return roles same or lower than actor role', () => {
      const viewableByAdmin = getViewableRoles(UserRole.ADMIN);
      expect(viewableByAdmin).toContain(UserRole.USER);
      expect(viewableByAdmin).toContain(UserRole.SUPPORT);
      expect(viewableByAdmin).toContain(UserRole.MANAGER);
      expect(viewableByAdmin).toContain(UserRole.ADMIN);
    });

    it('should return only USER for USER role', () => {
      const viewableByUser = getViewableRoles(UserRole.USER);
      expect(viewableByUser).toContain(UserRole.USER);
      expect(viewableByUser).toHaveLength(1);
    });

    it('should return USER and SUPPORT for SUPPORT role', () => {
      const viewableBySupport = getViewableRoles(UserRole.SUPPORT);
      expect(viewableBySupport).toContain(UserRole.USER);
      expect(viewableBySupport).toContain(UserRole.SUPPORT);
      expect(viewableBySupport).toHaveLength(2);
    });
  });
});
