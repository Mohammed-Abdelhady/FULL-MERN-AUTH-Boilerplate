'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPermissionsDialog } from '@/modules/permissions/components/UserPermissionsDialog';
import { UserPermissionsBadge } from '@/modules/permissions/components/UserPermissionsBadge';
import { RoutePermissionGuard, PERMISSION_PERMISSIONS } from '@/modules/permissions';
import { Shield, Settings } from 'lucide-react';

/**
 * Demo page for user permission management.
 * This demonstrates how to integrate the UserPermissionsDialog component.
 *
 * In a real application, this would be integrated into the user list page
 * where you can click on a user to manage their permissions.
 */
export default function UserPermissionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  // Demo user data (replace with actual API call)
  const demoUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      permissions: ['profile:read:own', 'profile:update:own'],
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'manager',
      permissions: ['users:read:all', 'users:update:all', 'roles:read:all'],
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      permissions: ['*'],
    },
  ];

  const handleManagePermissions = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setDialogOpen(true);
  };

  return (
    <RoutePermissionGuard permission={PERMISSION_PERMISSIONS.MANAGE_ALL}>
      <div className="container mx-auto max-w-6xl space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              User Permission Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage individual user permissions
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Direct User Permissions
              </h3>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                Permissions are assigned directly to users, not inherited from roles. Each user has
                their own permission array that can be customized independently.
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Permissions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {demoUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  data-testid={`user-row-${user.id}`}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <UserPermissionsBadge permissions={user.permissions} maxDisplay={2} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManagePermissions(user.id, user.name)}
                      data-testid={`manage-permissions-${user.id}`}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Integration Note */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Integration Guide</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This is a demonstration page. In a production environment, you would:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>Fetch real user data from your API</li>
            <li>
              Add the &quot;Manage Permissions&quot; button to your existing user list/detail pages
            </li>
            <li>Use the UserPermissionsDialog component with actual user IDs</li>
            <li>Optionally integrate UserPermissionsBadge into user cards/rows</li>
          </ul>
        </div>

        {/* Permissions Dialog */}
        <UserPermissionsDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userId={selectedUserId}
          userName={selectedUserName}
        />
      </div>
    </RoutePermissionGuard>
  );
}
