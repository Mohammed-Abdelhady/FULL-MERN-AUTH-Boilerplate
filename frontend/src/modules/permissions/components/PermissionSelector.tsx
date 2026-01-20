'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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

export interface PermissionSelectorProps {
  /**
   * Currently selected permissions
   */
  selectedPermissions: string[];

  /**
   * Callback when permissions change
   */
  onChange: (permissions: string[]) => void;

  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;

  /**
   * Whether to show the wildcard permission option
   * Default: true
   */
  showWildcard?: boolean;
}

interface PermissionGroup {
  name: string;
  permissions: Record<string, string>;
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  { name: 'Profile', permissions: PROFILE_PERMISSIONS },
  { name: 'Users', permissions: USER_PERMISSIONS },
  { name: 'Roles', permissions: ROLE_PERMISSIONS },
  { name: 'Permissions', permissions: PERMISSION_PERMISSIONS },
  { name: 'Sessions', permissions: SESSION_PERMISSIONS },
  { name: 'Reports', permissions: REPORT_PERMISSIONS },
];

/**
 * Component for selecting permissions.
 * Organizes permissions by resource category with checkboxes.
 *
 * @example
 * ```tsx
 * const [permissions, setPermissions] = useState<string[]>([]);
 *
 * <PermissionSelector
 *   selectedPermissions={permissions}
 *   onChange={setPermissions}
 * />
 * ```
 */
export function PermissionSelector({
  selectedPermissions,
  onChange,
  disabled = false,
  showWildcard = true,
}: PermissionSelectorProps) {
  const handleTogglePermission = (permission: string) => {
    if (disabled) return;

    const isSelected = selectedPermissions.includes(permission);

    if (isSelected) {
      // Remove permission
      onChange(selectedPermissions.filter((p) => p !== permission));
    } else {
      // Add permission
      onChange([...selectedPermissions, permission]);
    }
  };

  const handleToggleWildcard = () => {
    if (disabled) return;

    const hasWildcard = selectedPermissions.includes(WILDCARD_PERMISSION);

    if (hasWildcard) {
      // Remove wildcard
      onChange(selectedPermissions.filter((p) => p !== WILDCARD_PERMISSION));
    } else {
      // Add wildcard and remove all other permissions
      onChange([WILDCARD_PERMISSION]);
    }
  };

  const handleSelectAll = (groupPermissions: Record<string, string>) => {
    if (disabled) return;

    const groupPerms = Object.values(groupPermissions);
    const allSelected = groupPerms.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      // Deselect all from this group
      onChange(selectedPermissions.filter((p) => !groupPerms.includes(p)));
    } else {
      // Select all from this group
      const newPermissions = [...selectedPermissions];
      groupPerms.forEach((p) => {
        if (!newPermissions.includes(p)) {
          newPermissions.push(p);
        }
      });
      onChange(newPermissions);
    }
  };

  const formatPermissionLabel = (permission: string): string => {
    const parsed = parsePermission(permission);
    if (!parsed) return permission;

    const { action, scope } = parsed;
    const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
    const scopeLabel = scope ? ` (${scope})` : '';

    return `${actionLabel}${scopeLabel}`;
  };

  const hasWildcard = selectedPermissions.includes(WILDCARD_PERMISSION);

  return (
    <div className="space-y-4">
      {/* Wildcard Permission */}
      {showWildcard && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="wildcard-permission"
              checked={hasWildcard}
              onCheckedChange={handleToggleWildcard}
              disabled={disabled}
              data-testid="wildcard-permission-checkbox"
            />
            <div className="flex-1">
              <Label
                htmlFor="wildcard-permission"
                className="font-semibold text-amber-900 dark:text-amber-100"
              >
                Wildcard Permission (*)
              </Label>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Grants all permissions. Use only for super administrators.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Permission Groups */}
      {!hasWildcard && (
        <div className="space-y-6">
          {PERMISSION_GROUPS.map((group) => {
            const groupPerms = Object.values(group.permissions);
            const allSelected = groupPerms.every((p) => selectedPermissions.includes(p));

            return (
              <div key={group.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{group.name}</h3>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(group.permissions)}
                    disabled={disabled}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2">
                  {Object.entries(group.permissions).map(([, permission]) => (
                    <div key={permission} className="flex items-start space-x-3">
                      <Checkbox
                        id={`permission-${permission}`}
                        checked={selectedPermissions.includes(permission)}
                        onCheckedChange={() => handleTogglePermission(permission)}
                        disabled={disabled}
                        data-testid={`permission-checkbox-${permission}`}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`permission-${permission}`}
                          className="cursor-pointer text-sm"
                        >
                          {formatPermissionLabel(permission)}
                        </Label>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {permission}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Wildcard Notice */}
      {hasWildcard && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wildcard permission selected. All other permissions are implicitly granted.
          </p>
        </div>
      )}

      {/* Permission Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {hasWildcard ? (
          <span>All permissions granted via wildcard (*)</span>
        ) : (
          <span>
            {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''}{' '}
            selected
          </span>
        )}
      </div>
    </div>
  );
}
