import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PermissionNodeProps {
  /**
   * Permission string (e.g., "users:read:all")
   */
  permission: string;

  /**
   * Node depth level for indentation
   */
  level?: number;

  /**
   * Visual variant
   */
  variant?: 'default' | 'inherited' | 'direct';

  /**
   * Optional className
   */
  className?: string;
}

/**
 * PermissionNode - Single permission display in tree
 *
 * Features:
 * - Indentation based on level
 * - Visual variants for inherited/direct permissions
 * - Minimal aesthetic
 *
 * @example
 * ```tsx
 * <PermissionNode permission="users:read:all" level={1} variant="inherited" />
 * ```
 */
export const PermissionNode = memo(function PermissionNode({
  permission,
  level = 0,
  variant = 'default',
  className,
}: PermissionNodeProps) {
  // Parse permission parts
  const parts = permission.split(':');
  const resource = parts[0] || permission;
  const action = parts[1];
  const scope = parts[2];

  // Variant styles
  const variantStyles = {
    default: 'bg-surface-secondary border-border-subtle text-foreground',
    inherited:
      'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-100',
    direct:
      'bg-green-50 border-green-100 text-green-900 dark:bg-green-950/50 dark:border-green-900 dark:text-green-100',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md border text-xs',
        'transition-all duration-150',
        variantStyles[variant],
        className,
      )}
      style={{ marginLeft: `${level * 16}px` }}
      data-testid={`permission-node-${permission}`}
    >
      {level > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0 text-muted-foreground/40" />}
      <code className="font-mono flex-1">
        <span className="font-semibold">{resource}</span>
        {action && <span className="text-muted-foreground/60">:{action}</span>}
        {scope && <span className="text-muted-foreground/40">:{scope}</span>}
      </code>
    </div>
  );
});
