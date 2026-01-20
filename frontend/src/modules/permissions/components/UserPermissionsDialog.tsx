'use client';

import { useState, useEffect } from 'react';
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
import { PermissionSelector } from './PermissionSelector';
import { Loader2, Plus, Trash2 } from 'lucide-react';
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
 * Dialog for managing user permissions.
 * Allows adding and removing individual permissions for a user.
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
 */
export function UserPermissionsDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: UserPermissionsDialogProps) {
  // Component will remount when userId changes due to key prop on Dialog
  const [addMode, setAddMode] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data, isLoading, refetch } = useGetUserPermissionsQuery(userId || '', {
    skip: !userId,
  });

  const [addPermission, { isLoading: isAdding }] = useAddPermissionMutation();
  const [removePermission, { isLoading: isRemoving }] = useRemovePermissionMutation();

  const handleAddPermissions = async () => {
    if (!userId || selectedPermissions.length === 0) return;

    try {
      // Add permissions one by one
      for (const permission of selectedPermissions) {
        await addPermission({ userId, permission }).unwrap();
      }

      toast.success(
        `${selectedPermissions.length} permission${selectedPermissions.length !== 1 ? 's' : ''} added successfully`,
      );

      // Reset state
      setSelectedPermissions([]);
      setAddMode(false);

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
  const hasWildcard = userPermissions.includes('*');

  // Filter out permissions the user already has when adding
  const availablePermissions = selectedPermissions.filter((p) => !userPermissions.includes(p));

  return (
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Current Role */}
              {data?.role && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Current Role:</span>{' '}
                    <Badge variant="secondary">{data.role}</Badge>
                  </p>
                </div>
              )}

              {/* Add Mode Toggle */}
              {!addMode ? (
                <>
                  {/* Current Permissions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Current Permissions ({userPermissions.length})
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => setAddMode(true)}
                        data-testid="add-permission-button"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Permissions
                      </Button>
                    </div>

                    {hasWildcard && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          <strong>Wildcard Permission (*):</strong> This user has all permissions.
                        </p>
                      </div>
                    )}

                    {userPermissions.length === 0 ? (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                        <p className="text-gray-600 dark:text-gray-400">No permissions assigned</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {userPermissions.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                          >
                            <div className="flex-1">
                              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                {permission}
                              </code>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemovePermission(permission)}
                              disabled={isRemoving}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                              data-testid={`remove-permission-${permission}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Add Permissions Mode */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Select Permissions to Add
                      </h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAddMode(false);
                          setSelectedPermissions([]);
                        }}
                        disabled={isAdding}
                      >
                        Cancel
                      </Button>
                    </div>

                    <PermissionSelector
                      selectedPermissions={selectedPermissions}
                      onChange={setSelectedPermissions}
                      disabled={isAdding}
                    />

                    <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        {availablePermissions.length} new permission
                        {availablePermissions.length !== 1 ? 's' : ''} will be added
                      </p>
                      <Button
                        onClick={handleAddPermissions}
                        disabled={availablePermissions.length === 0 || isAdding}
                        data-testid="confirm-add-permissions"
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add {availablePermissions.length} Permission
                            {availablePermissions.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
