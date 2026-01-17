/**
 * Toast Notification Type Definitions
 *
 * Defines the structure and types for the global toast notification system.
 * Supports success, error, warning, info, and loading states with full i18n.
 */

/**
 * Toast notification types matching semantic color tokens
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

/**
 * Toast notification interface
 */
export interface Toast {
  /** Unique identifier for the toast */
  id: string;

  /** Type of notification determining styling and ARIA role */
  type: ToastType;

  /** Message content (can be translation key or direct message) */
  message: string;

  /** Optional description for additional context */
  description?: string;

  /** Duration in milliseconds before auto-dismiss (Infinity for manual only) */
  duration?: number;

  /** Timestamp when toast was created */
  timestamp: number;

  /** Whether this toast is dismissible by user */
  dismissible?: boolean;

  /** Optional action button configuration */
  action?: ToastAction;
}

/**
 * Toast action button configuration
 */
export interface ToastAction {
  /** Button label (translation key or direct text) */
  label: string;

  /** Click handler function */
  onClick: () => void;

  /** Optional aria-label for accessibility */
  ariaLabel?: string;
}

/**
 * Toast state in Redux store
 */
export interface ToastState {
  /** Array of currently active toasts */
  toasts: Toast[];

  /** Maximum number of visible toasts at once */
  maxToasts: number;

  /** Map for deduplication tracking (hash → timestamp) */
  deduplicationCache: Record<string, number>;
}

/**
 * Configuration options for creating a toast
 */
export interface ToastOptions {
  /** Duration in milliseconds (default: 5000) */
  duration?: number;

  /** Whether toast can be dismissed by user (default: true) */
  dismissible?: boolean;

  /** Optional description text */
  description?: string;

  /** Optional action button */
  action?: ToastAction;

  /** Force show even if duplicate exists (bypass deduplication) */
  force?: boolean;
}

/**
 * Error metadata for toast generation
 */
export interface ErrorMetadata {
  /** HTTP status code (if network error) */
  status?: number;

  /** Error message from server or network layer */
  message: string;

  /** API endpoint that failed */
  endpoint?: string;

  /** HTTP method used */
  method?: string;

  /** Whether this error should be silent (no toast) */
  silent?: boolean;

  /** Custom toast type override */
  toastType?: ToastType;

  /** Custom toast duration override */
  toastDuration?: number;
}

/**
 * Toast deduplication hash configuration
 */
export interface ToastDeduplicationConfig {
  /** Time window in milliseconds for considering errors duplicate (default: 5000) */
  timeWindow: number;

  /** Cleanup interval in milliseconds (default: 60000) */
  cleanupInterval: number;

  /** Maximum cache size before forced cleanup (default: 100) */
  maxCacheSize: number;
}
