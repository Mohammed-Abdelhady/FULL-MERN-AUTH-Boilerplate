import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Status type
   */
  status: 'verified' | 'pending' | 'active' | 'inactive' | 'success' | 'warning' | 'danger';

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Visual variant
   */
  variant?: 'solid' | 'soft' | 'outline';

  /**
   * Show animated pulse for active states
   */
  pulse?: boolean;
}

/**
 * StatusBadge - Refined status indicators
 *
 * Features:
 * - Desaturated colors for sophistication
 * - Optional subtle glow
 * - Multiple variants (solid, soft, outline)
 * - Animated pulse for active states
 * - Consistent sizing
 *
 * @example
 * ```tsx
 * <StatusBadge status="verified" />
 * <StatusBadge status="active" pulse />
 * <StatusBadge status="pending" variant="soft" size="sm" />
 * ```
 */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    { status, size = 'md', variant = 'soft', pulse = false, className, children, ...props },
    ref,
  ) => {
    const statusColors = {
      verified: {
        solid: 'bg-status-success text-white',
        soft: 'bg-status-success/10 text-status-success border-status-success/20',
        outline: 'border-status-success text-status-success',
      },
      pending: {
        solid: 'bg-status-warning text-white',
        soft: 'bg-status-warning/10 text-status-warning border-status-warning/20',
        outline: 'border-status-warning text-status-warning',
      },
      active: {
        solid: 'bg-status-success text-white',
        soft: 'bg-status-success/10 text-status-success border-status-success/20',
        outline: 'border-status-success text-status-success',
      },
      inactive: {
        solid: 'bg-muted text-muted-foreground',
        soft: 'bg-muted/50 text-muted-foreground border-muted',
        outline: 'border-muted text-muted-foreground',
      },
      success: {
        solid: 'bg-status-success text-white',
        soft: 'bg-status-success/10 text-status-success border-status-success/20',
        outline: 'border-status-success text-status-success',
      },
      warning: {
        solid: 'bg-status-warning text-white',
        soft: 'bg-status-warning/10 text-status-warning border-status-warning/20',
        outline: 'border-status-warning text-status-warning',
      },
      danger: {
        solid: 'bg-status-danger text-white',
        soft: 'bg-status-danger/10 text-status-danger border-status-danger/20',
        outline: 'border-status-danger text-status-danger',
      },
    };

    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-xs px-2.5 py-1',
      lg: 'text-sm px-3 py-1.5',
    };

    const variantClasses = {
      solid: '',
      soft: 'border',
      outline: 'border bg-transparent',
    };

    return (
      <span
        ref={ref}
        data-testid={`status-badge-${status}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md font-medium tracking-wide',
          'transition-all duration-150',
          sizeClasses[size],
          variantClasses[variant],
          statusColors[status][variant],
          pulse && 'animate-pulse',
          className,
        )}
        {...props}
      >
        {/* Pulse dot for active states */}
        {pulse && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full animate-pulse',
              status === 'active' && 'bg-status-success',
              status === 'verified' && 'bg-status-success',
            )}
            data-testid="pulse-indicator"
          />
        )}

        {children || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  },
);

StatusBadge.displayName = 'StatusBadge';
