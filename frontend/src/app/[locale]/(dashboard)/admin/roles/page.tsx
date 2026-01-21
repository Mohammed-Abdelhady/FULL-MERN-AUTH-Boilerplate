'use client';

import { useState, useMemo, useCallback, lazy, Suspense, Activity } from 'react';
import { Button } from '@/components/ui/button';
import { SearchBar, SplitView } from '@/components/design-system';
import { useListRolesQuery, type Role } from '@/modules/permissions/api/rolesApi';
import { RoleSidebarNav } from '@/modules/permissions/components/RoleSidebarNav';
import { RoleDetailPanel } from '@/modules/permissions/components/RoleDetailPanel';
import { RoutePermissionGuard, ROLE_PERMISSIONS } from '@/modules/permissions';
import { Plus, Loader2 } from 'lucide-react';

// Lazy load dialog components
const CreateRoleDialog = lazy(() =>
  import('@/modules/permissions/components/CreateRoleDialog').then((mod) => ({
    default: mod.CreateRoleDialog,
  })),
);

const EditRoleDialog = lazy(() =>
  import('@/modules/permissions/components/EditRoleDialog').then((mod) => ({
    default: mod.EditRoleDialog,
  })),
);

const DeleteRoleDialog = lazy(() =>
  import('@/modules/permissions/components/DeleteRoleDialog').then((mod) => ({
    default: mod.DeleteRoleDialog,
  })),
);

/**
 * Roles management page - Redesigned with split view
 * Allows viewing, creating, editing, and deleting roles.
 */
export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  const { data, isLoading, refetch } = useListRolesQuery(undefined);

  // Memoize roles array
  const roles = useMemo(() => data?.roles || [], [data?.roles]);

  // Filter roles by search term
  const filteredRoles = useMemo(() => {
    if (!searchTerm) return roles;
    const search = searchTerm.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(search) ||
        role.slug.toLowerCase().includes(search) ||
        role.description?.toLowerCase().includes(search),
    );
  }, [roles, searchTerm]);

  // Auto-select first role when roles load (derive from data, don't use effect)
  const effectiveSelectedRoleId =
    selectedRoleId || (filteredRoles.length > 0 ? filteredRoles[0].id : null);

  // Get selected role
  const selectedRole = useMemo(
    () => roles.find((r) => r.id === effectiveSelectedRoleId) || null,
    [roles, effectiveSelectedRoleId],
  );

  const handleSelectRole = useCallback((roleId: string) => {
    setSelectedRoleId(roleId);
  }, []);

  const handleEdit = useCallback((role: Role) => {
    setRoleToEdit(role);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((role: Role) => {
    setRoleToEdit(role);
    setDeleteDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <RoutePermissionGuard permission={ROLE_PERMISSIONS.LIST_ALL}>
      <div className="container max-w-7xl py-8 px-4" data-testid="admin-roles-page">
        {/* Header */}
        <div className="my-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-light tracking-tight">Roles</h1>
              <p className="text-sm text-muted-foreground/60 mt-1 leading-relaxed">
                {roles.length} {roles.length === 1 ? 'role' : 'roles'} defined
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} data-testid="create-role-button">
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </div>

          {/* Search */}
          <SearchBar
            placeholder="Search roles by name, slug, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
            showClear={searchTerm.length > 0}
            data-testid="search-roles-input"
          />
        </div>

        {/* Loading State */}
        <Activity mode={isLoading ? 'visible' : 'hidden'}>
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading roles...</p>
            </div>
          </div>
        </Activity>

        {/* Split View Layout */}
        <Activity mode={!isLoading && filteredRoles.length > 0 ? 'visible' : 'hidden'}>
          <SplitView
            sidebar={
              <RoleSidebarNav
                roles={filteredRoles}
                selectedRoleId={effectiveSelectedRoleId}
                onSelectRole={handleSelectRole}
              />
            }
            content={
              <RoleDetailPanel role={selectedRole} onEdit={handleEdit} onDelete={handleDelete} />
            }
            sidebarWidth="280px"
            stickySidebar
          />
        </Activity>

        {/* Empty State */}
        <Activity mode={!isLoading && filteredRoles.length === 0 ? 'visible' : 'hidden'}>
          <div className="flex items-center justify-center py-16 text-center">
            <div className="space-y-3 max-w-md">
              <h3 className="text-lg font-semibold">
                {searchTerm ? 'No roles found' : 'No roles created yet'}
              </h3>
              <p className="text-sm text-muted-foreground/60">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by creating your first custom role.'}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              )}
            </div>
          </div>
        </Activity>

        {/* Dialogs - Lazy Loaded with Activity for instant re-open */}
        <Suspense fallback={<div />}>
          <Activity mode={createDialogOpen ? 'visible' : 'hidden'}>
            <CreateRoleDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onSuccess={handleSuccess}
            />
          </Activity>
        </Suspense>

        <Suspense fallback={<div />}>
          <Activity mode={editDialogOpen ? 'visible' : 'hidden'}>
            <EditRoleDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              role={roleToEdit}
              onSuccess={handleSuccess}
            />
          </Activity>
        </Suspense>

        <Suspense fallback={<div />}>
          <Activity mode={deleteDialogOpen ? 'visible' : 'hidden'}>
            <DeleteRoleDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              role={roleToEdit}
              onSuccess={handleSuccess}
            />
          </Activity>
        </Suspense>
      </div>
    </RoutePermissionGuard>
  );
}
