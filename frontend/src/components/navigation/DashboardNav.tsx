'use client';

import { useState } from 'react';
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
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Activity,
  Code,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  permissions?: string[];
  anyPermissions?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  permissions?: string[];
  anyPermissions?: string[];
}

const NAV_SECTIONS: (NavItem | NavSection)[] = [
  // Top-level items (always visible)
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

  // Admin Section
  {
    title: 'Admin',
    icon: Shield,
    anyPermissions: [
      USER_PERMISSIONS.LIST_ALL,
      ROLE_PERMISSIONS.LIST_ALL,
      PERMISSION_PERMISSIONS.MANAGE_ALL,
    ],
    items: [
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
        label: 'Permissions Demo',
        href: '/admin/permissions-demo',
        icon: Code,
        permission: PERMISSION_PERMISSIONS.MANAGE_ALL,
      },
    ],
  },

  // Activity Section
  {
    title: 'Activity',
    icon: Activity,
    anyPermissions: [SESSION_PERMISSIONS.READ_ALL, SESSION_PERMISSIONS.READ_OWN],
    items: [
      {
        label: 'Sessions',
        href: '/sessions',
        icon: Activity,
        anyPermissions: [SESSION_PERMISSIONS.READ_ALL, SESSION_PERMISSIONS.READ_OWN],
      },
    ],
  },
];

interface DashboardNavProps {
  /**
   * Optional callback when a navigation item is clicked (for mobile auto-close)
   */
  onNavigate?: () => void;
}

/**
 * Dashboard navigation component with permission-based rendering.
 * Only shows navigation items the user has permission to access.
 *
 * @example
 * ```tsx
 * <DashboardNav />
 * // With mobile auto-close
 * <DashboardNav onNavigate={() => setMobileMenuOpen(false)} />
 * ```
 */
function isNavSection(item: NavItem | NavSection): item is NavSection {
  return 'title' in item && 'items' in item;
}

export function DashboardNav({ onNavigate }: DashboardNavProps = {}) {
  const pathname = usePathname();

  // Manage collapsed state for sections in localStorage
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed-sections');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
          return {};
        }
      }
    }
    return {};
  });

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections((prev) => {
      const newState = { ...prev, [sectionTitle]: !prev[sectionTitle] };
      localStorage.setItem('sidebar-collapsed-sections', JSON.stringify(newState));
      return newState;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = pathname?.startsWith(item.href);

    const navLink = (
      <Link
        href={item.href}
        onClick={onNavigate}
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
  };

  return (
    <nav className="space-y-1" data-testid="dashboard-nav">
      {NAV_SECTIONS.map((item) => {
        if (isNavSection(item)) {
          // Collapsible Section
          const isCollapsed = collapsedSections[item.title] ?? false;
          const SectionIcon = item.icon;

          return (
            <PermissionGuard
              key={item.title}
              permission={item.permission}
              permissions={item.permissions}
              anyPermissions={item.anyPermissions}
            >
              <div className="space-y-1">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(item.title)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  data-testid={`nav-section-${item.title.toLowerCase()}`}
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {/* Section Items */}
                {!isCollapsed && (
                  <div className="ml-4 space-y-1 border-l border-border pl-3">
                    {item.items.map(renderNavItem)}
                  </div>
                )}
              </div>
            </PermissionGuard>
          );
        }

        // Regular nav item (top-level)
        return renderNavItem(item);
      })}
    </nav>
  );
}
