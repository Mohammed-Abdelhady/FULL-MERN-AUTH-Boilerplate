'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  PermissionGuard,
  USER_PERMISSIONS,
  ROLE_PERMISSIONS,
  PERMISSION_PERMISSIONS,
  SESSION_PERMISSIONS,
} from '@/modules/permissions';
import { LayoutDashboard, Users, Shield, Settings, Activity, UserCog, Code } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  permissions?: string[];
  anyPermissions?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: USER_PERMISSIONS.LIST_ALL,
  },
  {
    label: 'Roles',
    href: '/admin/roles',
    icon: Shield,
    permission: ROLE_PERMISSIONS.LIST_ALL,
  },
  {
    label: 'User Permissions',
    href: '/admin/users/permissions',
    icon: UserCog,
    permission: PERMISSION_PERMISSIONS.MANAGE_ALL,
  },
  {
    label: 'Sessions',
    href: '/admin/sessions',
    icon: Activity,
    anyPermissions: [SESSION_PERMISSIONS.READ_ALL, SESSION_PERMISSIONS.READ_OWN],
  },
  {
    label: 'Permissions Demo',
    href: '/admin/permissions-demo',
    icon: Code,
    permission: PERMISSION_PERMISSIONS.MANAGE_ALL,
  },
];

/**
 * Dashboard navigation component with permission-based rendering.
 * Only shows navigation items the user has permission to access.
 *
 * @example
 * ```tsx
 * <DashboardNav />
 * ```
 */
export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" data-testid="dashboard-nav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname?.startsWith(item.href);

        const navLink = (
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );

        // If no permission required, always show
        if (!item.permission && !item.permissions && !item.anyPermissions) {
          return <div key={item.href}>{navLink}</div>;
        }

        // Wrap with permission guard
        return (
          <PermissionGuard
            key={item.href}
            permission={item.permission}
            permissions={item.permissions}
            anyPermissions={item.anyPermissions}
          >
            {navLink}
          </PermissionGuard>
        );
      })}
    </nav>
  );
}
