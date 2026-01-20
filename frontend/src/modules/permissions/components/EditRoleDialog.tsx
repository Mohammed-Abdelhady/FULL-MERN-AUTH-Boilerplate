'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateRoleMutation, type Role } from '../api/rolesApi';
import { PermissionSelector } from './PermissionSelector';
import { toast } from 'sonner';

export interface EditRoleDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Callback when dialog should close
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Role to edit
   */
  role: Role | null;

  /**
   * Callback when role is successfully updated
   */
  onSuccess?: () => void;
}

/**
 * Dialog for editing an existing role.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * const [selectedRole, setSelectedRole] = useState<Role | null>(null);
 *
 * <EditRoleDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   role={selectedRole}
 *   onSuccess={() => console.log('Role updated!')}
 * />
 * ```
 */
export function EditRoleDialog({ open, onOpenChange, role, onSuccess }: EditRoleDialogProps) {
  const [updateRole, { isLoading }] = useUpdateRoleMutation();

  // Initialize form state from role
  // Component will remount when role.id changes due to key prop on Dialog
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [permissions, setPermissions] = useState<string[]>(role?.permissions || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) return;

    if (!name.trim()) {
      toast.error('Please enter a role name');
      return;
    }

    if (permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      await updateRole({
        idOrSlug: role.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          permissions,
        },
      }).unwrap();

      toast.success('Role updated successfully');

      // Close dialog
      onOpenChange(false);

      // Call success callback
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string })?.message || 'Failed to update role'
          : 'Failed to update role';

      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    // Close dialog - form will reset when reopened due to component remounting
    onOpenChange(false);
  };

  if (!role) return null;

  const isProtected = role.isProtected;

  return (
    <Dialog key={role.id} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              {isProtected
                ? 'This is a protected system role. Some fields cannot be modified.'
                : 'Update the role name, description, and permissions.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Protected Role Warning */}
            {isProtected && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  <strong>Protected Role:</strong> This role cannot be deleted and its core
                  permissions are managed by the system.
                </p>
              </div>
            )}

            {/* Role Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">
                Role Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || isProtected}
                required
                data-testid="edit-role-name-input"
              />
              {isProtected && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Protected role names cannot be changed
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this role is for..."
                rows={3}
                disabled={isLoading}
                data-testid="edit-role-description-input"
              />
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <Label>
                Permissions <span className="text-red-500">*</span>
              </Label>
              <PermissionSelector
                selectedPermissions={permissions}
                onChange={setPermissions}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="save-role-button">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
