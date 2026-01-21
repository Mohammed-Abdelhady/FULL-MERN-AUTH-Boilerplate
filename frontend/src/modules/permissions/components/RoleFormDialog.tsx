'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { PermissionSelector } from './PermissionSelector';
import { useCreateRoleMutation, useUpdateRoleMutation, type Role } from '../api/rolesApi';
import { useToast } from '@/hooks/use-toast';

interface RoleFormDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly mode: 'create' | 'edit';
  readonly role?: Role;
}

interface RoleFormProps {
  mode: 'create' | 'edit';
  initialName: string;
  initialDescription: string;
  initialPermissions: string[];
  isProtected: boolean;
  isLoading: boolean;
  onSubmit: (data: { name: string; description: string; permissions: string[] }) => Promise<void>;
  onCancel: () => void;
}

/**
 * Inner form component - remounts when mode/role changes via key prop
 */
function RoleForm({
  mode,
  initialName,
  initialDescription,
  initialPermissions,
  isProtected,
  isLoading,
  onSubmit,
  onCancel,
}: RoleFormProps) {
  // Initialize directly from props - component remounts when key changes
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPermissions);
  const [errors, setErrors] = useState<{ name?: string; permissions?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; permissions?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      permissions: selectedPermissions,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Role Name */}
      <div className="space-y-2">
        <Label htmlFor="role-name">
          Role Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="role-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Content Editor"
          disabled={isLoading || isProtected}
          data-testid="role-name-input"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive" data-testid="role-name-error">
            {errors.name}
          </p>
        )}
      </div>

      {/* Role Description */}
      <div className="space-y-2">
        <Label htmlFor="role-description">Description</Label>
        <Textarea
          id="role-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of what this role can do"
          rows={3}
          disabled={isLoading || isProtected}
          data-testid="role-description-input"
        />
      </div>

      {/* Permissions */}
      <div className="space-y-2">
        <Label>
          Permissions <span className="text-destructive">*</span>
        </Label>
        {errors.permissions && (
          <p className="text-sm text-destructive" data-testid="permissions-error">
            {errors.permissions}
          </p>
        )}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <PermissionSelector
            selectedPermissions={selectedPermissions}
            onChange={setSelectedPermissions}
            disabled={isLoading || isProtected}
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="cancel-button"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || isProtected} data-testid="save-button">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>{mode === 'create' ? 'Create Role' : 'Update Role'}</>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * RoleFormDialog - Unified dialog for creating and editing roles
 *
 * Provides a form interface for role management with:
 * - Name and description fields
 * - Permission selection via PermissionSelector
 * - Validation for required fields
 * - Protection against editing system roles
 *
 * @param open - Controls dialog visibility
 * @param onOpenChange - Callback when dialog should close
 * @param mode - Operation mode: 'create' for new roles, 'edit' for existing
 * @param role - Existing role data (required in edit mode)
 *
 * @example
 * ```tsx
 * // Create mode
 * <RoleFormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   mode="create"
 * />
 *
 * // Edit mode
 * <RoleFormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   mode="edit"
 *   role={selectedRole}
 * />
 * ```
 */
export function RoleFormDialog({ open, onOpenChange, mode, role }: RoleFormDialogProps) {
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const { toast } = useToast();

  const isLoading = isCreating || isUpdating;
  const isProtected = role?.isProtected || false;

  const handleSubmit = async (data: {
    name: string;
    description: string;
    permissions: string[];
  }) => {
    try {
      if (mode === 'create') {
        await createRole({
          name: data.name,
          description: data.description || undefined,
          permissions: data.permissions,
        }).unwrap();
        toast.success(`Role "${data.name}" created successfully`);
      } else if (mode === 'edit' && role) {
        await updateRole({
          idOrSlug: role.slug,
          data: {
            name: data.name,
            description: data.description || undefined,
            permissions: data.permissions,
          },
        }).unwrap();
        toast.success(`Role "${data.name}" updated successfully`);
      }

      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error && error.data
          ? String((error.data as { message?: string }).message)
          : 'An error occurred';
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Generate a unique key for the form based on mode and role
  const formKey = mode === 'edit' && role ? `edit-${role.id}` : 'create';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        data-testid="role-form-dialog"
      >
        <DialogHeader>
          <DialogTitle data-testid="role-form-title">
            {mode === 'create' ? 'Create New Role' : `Edit Role: ${role?.name}`}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a custom role with specific permissions for your users.'
              : isProtected
                ? 'This is a protected system role. Some fields cannot be modified.'
                : 'Modify the role name, description, and permissions.'}
          </DialogDescription>
        </DialogHeader>

        {/* Key forces remount when mode/role changes, reinitializing state */}
        <RoleForm
          key={formKey}
          mode={mode}
          initialName={mode === 'edit' && role ? role.name : ''}
          initialDescription={mode === 'edit' && role ? role.description || '' : ''}
          initialPermissions={mode === 'edit' && role ? role.permissions : []}
          isProtected={isProtected}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
