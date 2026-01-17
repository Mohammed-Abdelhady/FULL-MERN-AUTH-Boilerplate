/**
 * Toast Slice - Redux State Management
 *
 * Centralized toast notification state with deduplication and auto-dismiss logic.
 * Integrates with error interceptor middleware for automatic error handling.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Toast, ToastState, ToastOptions, ToastType } from '@/types/toast.types';
import { TOAST_CONFIG, TOAST_DURATION } from '@/constants/toastMessages';
import type { RootState } from '../store';

/**
 * Initial state for toast slice
 */
const initialState: ToastState = {
  toasts: [],
  maxToasts: TOAST_CONFIG.MAX_VISIBLE,
  deduplicationCache: {},
};

/**
 * Generate unique toast ID
 */
const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Generate deduplication hash for toast
 */
const generateDeduplicationHash = (message: string, type: ToastType): string => {
  const timeWindow = Math.floor(Date.now() / TOAST_CONFIG.DEDUPLICATION_WINDOW);
  return `${type}-${message}-${timeWindow}`;
};

/**
 * Check if toast should be shown (not duplicate)
 */
const shouldShowToast = (state: ToastState, hash: string, force: boolean = false): boolean => {
  if (force) return true;

  const cached = state.deduplicationCache[hash];
  const now = Date.now();

  // Not in cache or expired → show toast
  if (!cached || now - cached > TOAST_CONFIG.DEDUPLICATION_WINDOW) {
    return true;
  }

  // Recent duplicate → skip
  return false;
};

/**
 * Clean up expired entries from deduplication cache
 */
const cleanupDeduplicationCache = (state: ToastState): void => {
  const now = Date.now();
  const cacheEntries = Object.entries(state.deduplicationCache);

  // If cache is getting too large, force cleanup
  if (cacheEntries.length > TOAST_CONFIG.MAX_CACHE_SIZE) {
    const sortedEntries = cacheEntries.sort((a, b) => b[1] - a[1]);
    const keepEntries = sortedEntries.slice(0, Math.floor(TOAST_CONFIG.MAX_CACHE_SIZE / 2));
    state.deduplicationCache = Object.fromEntries(keepEntries);
    return;
  }

  // Remove expired entries
  for (const [hash, timestamp] of cacheEntries) {
    if (now - timestamp > TOAST_CONFIG.CLEANUP_INTERVAL) {
      delete state.deduplicationCache[hash];
    }
  }
};

/**
 * Get default duration for toast type
 */
const getDefaultDuration = (type: ToastType): number => {
  switch (type) {
    case 'success':
      return TOAST_DURATION.SUCCESS;
    case 'error':
      return TOAST_DURATION.ERROR;
    case 'warning':
      return TOAST_DURATION.WARNING;
    case 'info':
      return TOAST_DURATION.INFO;
    case 'loading':
      return TOAST_DURATION.LOADING;
    default:
      return TOAST_DURATION.INFO;
  }
};

/**
 * Toast slice with actions and reducers
 */
export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    /**
     * Add a new toast notification
     */
    addToast: (
      state,
      action: PayloadAction<{
        type: ToastType;
        message: string;
        options?: ToastOptions;
      }>,
    ) => {
      const { type, message, options = {} } = action.payload;
      const hash = generateDeduplicationHash(message, type);

      // Check if should show (deduplication)
      if (!shouldShowToast(state, hash, options.force)) {
        return;
      }

      // Create new toast
      const newToast: Toast = {
        id: generateToastId(),
        type,
        message,
        description: options.description,
        duration: options.duration ?? getDefaultDuration(type),
        timestamp: Date.now(),
        dismissible: options.dismissible ?? true,
        action: options.action,
      };

      // Add to cache
      state.deduplicationCache[hash] = Date.now();

      // Enforce max toasts limit (FIFO)
      if (state.toasts.length >= state.maxToasts) {
        state.toasts = state.toasts.slice(-(state.maxToasts - 1));
      }

      // Add new toast to end of array
      state.toasts.push(newToast);

      // Cleanup old cache entries periodically
      if (Math.random() < 0.1) {
        // 10% chance on each add
        cleanupDeduplicationCache(state);
      }
    },

    /**
     * Remove a specific toast by ID
     */
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },

    /**
     * Clear all toasts
     */
    clearAllToasts: (state) => {
      state.toasts = [];
    },

    /**
     * Update toast message or description
     */
    updateToast: (
      state,
      action: PayloadAction<{
        id: string;
        message?: string;
        description?: string;
        type?: ToastType;
      }>,
    ) => {
      const toast = state.toasts.find((t) => t.id === action.payload.id);
      if (toast) {
        if (action.payload.message !== undefined) {
          toast.message = action.payload.message;
        }
        if (action.payload.description !== undefined) {
          toast.description = action.payload.description;
        }
        if (action.payload.type !== undefined) {
          toast.type = action.payload.type;
        }
      }
    },

    /**
     * Manually clear deduplication cache (for testing or edge cases)
     */
    clearDeduplicationCache: (state) => {
      state.deduplicationCache = {};
    },
  },
});

/**
 * Action creators
 */
export const { addToast, removeToast, clearAllToasts, updateToast, clearDeduplicationCache } =
  toastSlice.actions;

/**
 * Selectors
 */
export const selectToasts = (state: RootState) => state.toast.toasts;
export const selectToastCount = (state: RootState) => state.toast.toasts.length;
export const selectToastById = (id: string) => (state: RootState) =>
  state.toast.toasts.find((toast) => toast.id === id);

/**
 * Reducer export
 */
export default toastSlice.reducer;
