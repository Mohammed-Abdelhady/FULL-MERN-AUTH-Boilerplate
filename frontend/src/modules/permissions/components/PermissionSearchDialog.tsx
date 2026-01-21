'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SearchBar } from '@/components/design-system';
import { Plus, Shield } from 'lucide-react';
import {
  PROFILE_PERMISSIONS,
  USER_PERMISSIONS,
  ROLE_PERMISSIONS,
  PERMISSION_PERMISSIONS,
  SESSION_PERMISSIONS,
  REPORT_PERMISSIONS,
  WILDCARD_PERMISSION,
} from '../constants/permissions';
import { parsePermission } from '../utils/permissionUtils';

export interface PermissionSearchDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Callback when dialog should close
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Currently selected permissions
   */
  selectedPermissions: string[];

  /**
   * Callback when permissions change
   */
  onChange: (permissions: string[]) => void;

  /**
   * Permissions to exclude from selection (already assigned)
   */
  excludedPermissions?: string[];

  /**
   * Whether to show the wildcard permission option
   */
  showWildcard?: boolean;

  /**
   * Whether the dialog is in loading state
   */
  isLoading?: boolean;

  /**
   * Callback when confirm button is clicked
   */
  onConfirm?: () => void;
}

interface PermissionGroup {
  id: string;
  name: string;
  permissions: Record<string, string>;
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  { id: 'profile', name: 'Profile', permissions: PROFILE_PERMISSIONS },
  { id: 'users', name: 'Users', permissions: USER_PERMISSIONS },
  { id: 'roles', name: 'Roles', permissions: ROLE_PERMISSIONS },
  { id: 'permissions', name: 'Permissions', permissions: PERMISSION_PERMISSIONS },
  { id: 'sessions', name: 'Sessions', permissions: SESSION_PERMISSIONS },
  { id: 'reports', name: 'Reports', permissions: REPORT_PERMISSIONS },
];

/**
 * PermissionSearchDialog - Advanced permission selection dialog
 *
 * Features:
 * - Search across all permissions
 * - Category tabs for organized browsing
 * - Bulk selection per category
 * - Wildcard permission option
 * - Excludes already assigned permissions
 * - Minimal & refined design
 *
 * @example
 * ```tsx
 * <PermissionSearchDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   selectedPermissions={selected}
 *   onChange={setSelected}
 *   excludedPermissions={existingPermissions}
 *   onConfirm={handleAdd}
 * />
 * ```
 */
export const PermissionSearchDialog = memo(function PermissionSearchDialog({
  open,
  onOpenChange,
  selectedPermissions,
  onChange,
  excludedPermissions = [],
  showWildcard = true,
  isLoading = false,
  onConfirm,
}: PermissionSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleTogglePermission = useCallback(
    (permission: string) => {
      const isSelected = selectedPermissions.includes(permission);

      if (isSelected) {
        onChange(selectedPermissions.filter((p) => p !== permission));
      } else {
        onChange([...selectedPermissions, permission]);
      }
    },
    [selectedPermissions, onChange],
  );

  const handleToggleWildcard = useCallback(() => {
    const hasWildcard = selectedPermissions.includes(WILDCARD_PERMISSION);

    if (hasWildcard) {
      onChange(selectedPermissions.filter((p) => p !== WILDCARD_PERMISSION));
    } else {
      onChange([WILDCARD_PERMISSION]);
    }
  }, [selectedPermissions, onChange]);

  const handleSelectAll = useCallback(
    (groupPermissions: Record<string, string>) => {
      const groupPerms = Object.values(groupPermissions).filter(
        (p) => !excludedPermissions.includes(p),
      );
      const allSelected = groupPerms.every((p) => selectedPermissions.includes(p));

      if (allSelected) {
        onChange(selectedPermissions.filter((p) => !groupPerms.includes(p)));
      } else {
        const newPermissions = [...selectedPermissions];
        groupPerms.forEach((p) => {
          if (!newPermissions.includes(p)) {
            newPermissions.push(p);
          }
        });
        onChange(newPermissions);
      }
    },
    [selectedPermissions, excludedPermissions, onChange],
  );

  const formatPermissionLabel = (permission: string): string => {
    const parsed = parsePermission(permission);
    if (!parsed) return permission;

    const { action, scope } = parsed;
    const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
    const scopeLabel = scope ? ` (${scope})` : '';

    return `${actionLabel}${scopeLabel}`;
  };

  // Filter permissions by search query and tab
  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return PERMISSION_GROUPS.map((group) => {
      const filteredPermissions = Object.entries(group.permissions).filter(([, perm]) => {
        // Exclude already assigned permissions
        if (excludedPermissions.includes(perm)) return false;

        // Filter by search query
        if (query && !perm.toLowerCase().includes(query)) {
          const label = formatPermissionLabel(perm).toLowerCase();
          if (!label.includes(query)) return false;
        }

        return true;
      });

      return {
        ...group,
        filteredPermissions: Object.fromEntries(filteredPermissions),
      };
    }).filter((group) => Object.keys(group.filteredPermissions).length > 0);
  }, [searchQuery, excludedPermissions]);

  const hasWildcard = selectedPermissions.includes(WILDCARD_PERMISSION);
  const availableCount = selectedPermissions.filter((p) => !excludedPermissions.includes(p)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Permissions</DialogTitle>
          <DialogDescription>
            Search and select permissions to add. Use tabs to browse by category.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search Bar */}
          <SearchBar
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            showClear={searchQuery.length > 0}
            data-testid="permission-search-input"
          />

          {/* Wildcard Option */}
          {showWildcard && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="wildcard-permission"
                  checked={hasWildcard}
                  onCheckedChange={handleToggleWildcard}
                  disabled={isLoading}
                  data-testid="wildcard-permission-checkbox"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="wildcard-permission"
                    className="font-semibold text-amber-900 dark:text-amber-100 flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Wildcard Permission (*)
                  </Label>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    Grants all permissions. Use only for super administrators.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs */}
          {!hasWildcard && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">All</TabsTrigger>
                {PERMISSION_GROUPS.map((group) => (
                  <TabsTrigger key={group.id} value={group.id}>
                    {group.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* All Permissions Tab */}
              <TabsContent value="all" className="flex-1 overflow-y-auto mt-4 space-y-6">
                {filteredGroups.map((group) => {
                  const groupPerms = Object.values(group.filteredPermissions);
                  const allSelected = groupPerms.every((p) => selectedPermissions.includes(p));

                  return (
                    <div key={group.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold tracking-tight">{group.name}</h3>
                        <button
                          type="button"
                          onClick={() => handleSelectAll(group.filteredPermissions)}
                          disabled={isLoading || groupPerms.length === 0}
                          className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border-subtle bg-surface-secondary p-4">
                        {Object.entries(group.filteredPermissions).map(([, permission]) => (
                          <div key={permission} className="flex items-start space-x-3">
                            <Checkbox
                              id={`permission-${permission}`}
                              checked={selectedPermissions.includes(permission)}
                              onCheckedChange={() => handleTogglePermission(permission)}
                              disabled={isLoading}
                              data-testid={`permission-checkbox-${permission}`}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`permission-${permission}`}
                                className="cursor-pointer text-sm leading-tight"
                              >
                                {formatPermissionLabel(permission)}
                              </Label>
                              <p className="mt-0.5 text-xs text-muted-foreground/60 font-mono">
                                {permission}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredGroups.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground/60">
                    No permissions found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </TabsContent>

              {/* Individual Category Tabs */}
              {PERMISSION_GROUPS.map((group) => {
                const filtered = filteredGroups.find((g) => g.id === group.id);
                const groupPerms = filtered ? Object.values(filtered.filteredPermissions) : [];
                const allSelected = groupPerms.every((p) => selectedPermissions.includes(p));

                return (
                  <TabsContent
                    key={group.id}
                    value={group.id}
                    className="flex-1 overflow-y-auto mt-4 space-y-4"
                  >
                    {filtered && groupPerms.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground/60">
                            {groupPerms.length} permission{groupPerms.length !== 1 ? 's' : ''}{' '}
                            available
                          </p>
                          <button
                            type="button"
                            onClick={() => handleSelectAll(filtered.filteredPermissions)}
                            disabled={isLoading}
                            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border-subtle bg-surface-secondary p-4">
                          {Object.entries(filtered.filteredPermissions).map(([, permission]) => (
                            <div key={permission} className="flex items-start space-x-3">
                              <Checkbox
                                id={`permission-${permission}`}
                                checked={selectedPermissions.includes(permission)}
                                onCheckedChange={() => handleTogglePermission(permission)}
                                disabled={isLoading}
                                data-testid={`permission-checkbox-${permission}`}
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={`permission-${permission}`}
                                  className="cursor-pointer text-sm leading-tight"
                                >
                                  {formatPermissionLabel(permission)}
                                </Label>
                                <p className="mt-0.5 text-xs text-muted-foreground/60 font-mono">
                                  {permission}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-sm text-muted-foreground/60">
                        {searchQuery
                          ? `No ${group.name.toLowerCase()} permissions found matching "${searchQuery}"`
                          : `All ${group.name.toLowerCase()} permissions are already assigned`}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}

          {/* Wildcard Notice */}
          {hasWildcard && (
            <div className="rounded-lg border border-border-subtle bg-surface-secondary p-4 text-center">
              <p className="text-sm text-muted-foreground/60">
                Wildcard permission selected. All other permissions are implicitly granted.
              </p>
            </div>
          )}
        </div>

        {/* Footer with Selection Summary and Confirm Button */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <div className="text-sm text-muted-foreground/60">
            {hasWildcard ? (
              <span>All permissions granted via wildcard (*)</span>
            ) : (
              <span>
                {availableCount} new permission{availableCount !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={availableCount === 0 || isLoading}
              data-testid="confirm-add-permissions"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add {availableCount} Permission{availableCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
