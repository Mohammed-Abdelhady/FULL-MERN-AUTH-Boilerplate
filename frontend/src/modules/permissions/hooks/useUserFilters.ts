import { useMemo } from 'react';

export interface FilterableUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface UseUserFiltersOptions {
  /** Search query to filter by name or email */
  searchQuery: string;
  /** Role to filter by, or 'all' for no filter */
  roleFilter: string;
}

export interface UseUserFiltersReturn {
  /** Users matching search and role filter */
  filteredUsers: FilterableUser[];
  /** Verified users from filtered list */
  verifiedUsers: FilterableUser[];
  /** Pending verification users from filtered list */
  pendingUsers: FilterableUser[];
  /** Unique roles in the user list */
  uniqueRoles: string[];
}

/**
 * useUserFilters - Hook for filtering and grouping users.
 *
 * Extracts filtering and grouping logic from the Admin Users page
 * to keep the component focused on rendering.
 *
 * @param users - Full list of users
 * @param options - Filter options (search query, role filter)
 * @returns Filtered and grouped user lists
 *
 * @example
 * ```tsx
 * function AdminUsersPage() {
 *   const [searchQuery, setSearchQuery] = useState('');
 *   const [roleFilter, setRoleFilter] = useState('all');
 *   const { data } = useGetUsersQuery({});
 *
 *   const { filteredUsers, verifiedUsers, pendingUsers, uniqueRoles } = useUserFilters(
 *     data?.users || [],
 *     { searchQuery, roleFilter }
 *   );
 *
 *   return (
 *     <>
 *       <UserListSection users={verifiedUsers} />
 *       <UserListSection users={pendingUsers} />
 *     </>
 *   );
 * }
 * ```
 */
export function useUserFilters(
  users: FilterableUser[],
  options: UseUserFiltersOptions,
): UseUserFiltersReturn {
  const { searchQuery, roleFilter } = options;

  // Filter users by search query and role
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Group users by verification status
  const { verifiedUsers, pendingUsers } = useMemo(
    () => ({
      verifiedUsers: filteredUsers.filter((u) => u.isVerified),
      pendingUsers: filteredUsers.filter((u) => !u.isVerified),
    }),
    [filteredUsers],
  );

  // Get unique roles for filter dropdown
  const uniqueRoles = useMemo(() => Array.from(new Set(users.map((u) => u.role))), [users]);

  return {
    filteredUsers,
    verifiedUsers,
    pendingUsers,
    uniqueRoles,
  };
}

export default useUserFilters;
