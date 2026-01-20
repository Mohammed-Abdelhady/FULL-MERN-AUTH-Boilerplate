'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useListRolesQuery, type Role } from '@/modules/permissions/api/rolesApi';
import { CreateRoleDialog } from '@/modules/permissions/components/CreateRoleDialog';
import { EditRoleDialog } from '@/modules/permissions/components/EditRoleDialog';
import { DeleteRoleDialog } from '@/modules/permissions/components/DeleteRoleDialog';
import { RoutePermissionGuard, ROLE_PERMISSIONS } from '@/modules/permissions';
import { Loader2, Plus, Pencil, Trash2, Shield, ShieldAlert } from 'lucide-react';

/**
 * Roles management page for administrators.
 * Allows viewing, creating, editing, and deleting roles.
 */
export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { data, isLoading, refetch } = useListRolesQuery(undefined);

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    refetch();
  };

  const filteredRoles =
    data?.roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <RoutePermissionGuard permission={ROLE_PERMISSIONS.LIST_ALL}>
      <div className="container mx-auto max-w-6xl space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Role Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage roles with custom permissions
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} data-testid="create-role-button">
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            data-testid="search-roles-input"
          />
        </div>

        {/* Roles List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              {searchTerm ? 'No roles found' : 'No roles created yet'}
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first custom role'}
            </p>
            {!searchTerm && (
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                data-testid={`role-card-${role.slug}`}
              >
                {/* Role Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {role.name}
                      </h3>
                      {role.isSystemRole && (
                        <span title="System Role">
                          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </span>
                      )}
                      {role.isProtected && (
                        <span title="Protected Role">
                          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{role.slug}</p>
                  </div>
                </div>

                {/* Description */}
                {role.description && (
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {role.description}
                  </p>
                )}

                {/* Permissions Count */}
                <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {role.permissions.length}
                    </span>{' '}
                    permission{role.permissions.length !== 1 ? 's' : ''}
                  </p>
                  {role.permissions.includes('*') && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Includes wildcard (*)
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(role)}
                    data-testid={`edit-role-${role.slug}`}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                    onClick={() => handleDelete(role)}
                    disabled={role.isProtected}
                    data-testid={`delete-role-${role.slug}`}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </div>

                {/* Protected Notice */}
                {role.isProtected && (
                  <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                    Protected roles cannot be deleted
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dialogs */}
        <CreateRoleDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleSuccess}
        />

        <EditRoleDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          role={selectedRole}
          onSuccess={handleSuccess}
        />

        <DeleteRoleDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          role={selectedRole}
          onSuccess={handleSuccess}
        />
      </div>
    </RoutePermissionGuard>
  );
}
