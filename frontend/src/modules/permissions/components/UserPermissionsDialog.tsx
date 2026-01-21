'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useGetUserPermissionsQuery,
  useAddPermissionMutation,
  useRemovePermissionMutation,
} from '../api/permissionsApi';
import { useGetRoleQuery } from '../api/rolesApi';
import { PermissionTreeView } from './PermissionTreeView';
import { PermissionSearchDialog } from './PermissionSearchDialog';
import { Loader2, Plus, Trash2, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

export interface UserPermissionsDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Callback when dialog should close
   */
  onOpenChange: (open: boolean) => void;

  /**
   * User ID to manage permissions for
   */
  userId: string | null;

  /**
   * User name for display
   */
  userName?: string;
}

/**
 * UserPermissionsDialog - Comprehensive permission management dialog for users
 *
 * Displays and manages user permissions with clear distinction between:
 * - **Inherited Permissions**: Permissions from the user's assigned role (read-only, blue theme)
 * - **Direct Permissions**: Permissions assigned specifically to the user (editable, green theme)
 *
 * Features:
 * - Visual breakdown by permission source (role vs direct)
 * - Add multiple permissions at once
 * - Remove direct permissions individually
 * - Prevents duplicate assignments (inherited + direct)
 * - Wildcard permission (*) indicator
 * - Permission count summary
 *
 * @param open - Controls dialog visibility
 * @param onOpenChange - Callback when dialog should close
 * @param userId - ID of the user to manage permissions for
 * @param userName - Display name of the user (optional, for header)
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const [userId, setUserId] = useState<string | null>(null);
 *
 * <UserPermissionsDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   userId={userId}
 *   userName="John Doe"
 * />
 * ```
 *
 * @see PermissionSelector - Used for adding new permissions
 * @see useGetUserPermissionsQuery - Fetches user permissions
 * @see useGetRoleQuery - Fetches role permissions for inheritance
 */
export function UserPermissionsDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: UserPermissionsDialogProps) {
  // Component will remount when userId changes due to key prop on Dialog
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data, isLoading, refetch } = useGetUserPermissionsQuery(userId || '', {
    skip: !userId,
  });

  // Fetch role permissions to show inherited permissions
  const { data: roleData, isLoading: isLoadingRole } = useGetRoleQuery(data?.role || '', {
    skip: !data?.role,
  });

  const [addPermission, { isLoading: isAdding }] = useAddPermissionMutation();
  const [removePermission, { isLoading: isRemoving }] = useRemovePermissionMutation();

  const handleAddPermissions = async () => {
    if (!userId || availablePermissions.length === 0) return;

    try {
      // Add permissions one by one
      for (const permission of availablePermissions) {
        await addPermission({ userId, permission }).unwrap();
      }

      toast.success(
        `${availablePermissions.length} permission${availablePermissions.length !== 1 ? 's' : ''} added successfully`,
      );

      // Reset state
      setSelectedPermissions([]);
      setSearchDialogOpen(false);

      // Refresh data
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message || 'Failed to add permissions'
          : 'Failed to add permissions';

      toast.error(errorMessage);
    }
  };

  const handleRemovePermission = async (permission: string) => {
    if (!userId) return;

    try {
      await removePermission({ userId, permission }).unwrap();

      toast.success('Permission removed successfully');

      // Refresh data
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message || 'Failed to remove permission'
          : 'Failed to remove permission';

      toast.error(errorMessage);
    }
  };

  const userPermissions = data?.permissions || [];
  const rolePermissions = roleData?.permissions || [];

  // Direct permissions are those not inherited from role
  const directPermissions = userPermissions.filter((p) => !rolePermissions.includes(p));
  const inheritedPermissions = rolePermissions;

  // All effective permissions (role + direct, deduplicated)
  const effectivePermissions = [...new Set([...rolePermissions, ...userPermissions])];
  const hasWildcard = effectivePermissions.includes('*');

  // Filter out permissions the user already has when adding (both direct and inherited)
  const availablePermissions = selectedPermissions.filter((p) => !effectivePermissions.includes(p));

  return (
    <>
      <Dialog key={userId || 'no-user'} open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage User Permissions</DialogTitle>
            <DialogDescription>
              {userName
                ? `Manage permissions for ${userName}`
                : 'Add or remove permissions for this user'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {isLoading || isLoadingRole ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                {/* Summary Header */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Current Role:</span>{' '}
                        <Badge variant="secondary">{data?.role || 'None'}</Badge>
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {effectivePermissions.length} total permission
                        {effectivePermissions.length !== 1 ? 's' : ''} (
                        {inheritedPermissions.length} inherited + {directPermissions.length} direct)
                      </p>
                    </div>
                  </div>
                </div>

                {hasWildcard && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      <strong>Wildcard Permission (*):</strong> This user has all permissions.
                    </p>
                  </div>
                )}

                {/* Inherited Permissions (Read-only) - Tree View */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Inherited from Role ({inheritedPermissions.length})
                    </h3>
                    {data?.role && (
                      <Badge variant="secondary" className="text-xs">
                        {data.role}
                      </Badge>
                    )}
                  </div>

                  {inheritedPermissions.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No permissions inherited from role
                      </p>
                    </div>
                  ) : (
                    <PermissionTreeView
                      permissions={inheritedPermissions}
                      variant="inherited"
                      showHeaders
                    />
                  )}
                </div>

                {/* Direct Permissions (Editable) - Tree View with Remove Actions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Direct Permissions ({directPermissions.length})
                      </h3>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSearchDialogOpen(true)}
                      data-testid="add-permission-button"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Permissions
                    </Button>
                  </div>

                  {directPermissions.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No direct permissions assigned
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <PermissionTreeView
                        permissions={directPermissions}
                        variant="direct"
                        showHeaders
                      />

                      {/* Remove Actions Section */}
                      <div className="space-y-2 pt-2 border-t border-border-subtle">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground/40">
                          Remove Permissions
                        </p>
                        <div className="grid gap-2">
                          {directPermissions.map((permission) => (
                            <div
                              key={permission}
                              className="flex items-center justify-between rounded-md border border-border-subtle p-2 bg-surface-secondary"
                              data-testid={`direct-permission-${permission}`}
                            >
                              <code className="text-xs font-mono text-foreground">
                                {permission}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemovePermission(permission)}
                                disabled={isRemoving}
                                className="h-7 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                data-testid={`remove-permission-${permission}`}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Permission Search Dialog */}
      <PermissionSearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        selectedPermissions={selectedPermissions}
        onChange={setSelectedPermissions}
        excludedPermissions={effectivePermissions}
        isLoading={isAdding}
        onConfirm={handleAddPermissions}
      />
    </>
  );
}
