'use client';

/**
 * ReferenceMutation.tsx - Mutation with Consistent Error Handling Pattern
 *
 * This reference implementation demonstrates:
 * 1. Wrapping RTK Query mutations with toast notifications
 * 2. Centralized error parsing
 * 3. Consistent success/error handling across the app
 * 4. Type-safe mutation wrappers
 *
 * @example
 * // Using the wrapper hook
 * const [createUser, { isLoading }] = useMutationWithToast(
 *   useCreateUserMutation,
 *   {
 *     successMessage: 'User created successfully',
 *     onSuccess: (user) => navigate(`/users/${user.id}`),
 *   }
 * );
 */

import { useCallback } from 'react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Standard API error response shape.
 * Adjust based on your backend error format.
 */
export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * RTK Query mutation result shape (simplified).
 */
export interface MutationResult<TData> {
  data?: TData;
  error?: {
    status?: number | string;
    data?: ApiErrorResponse;
  };
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Options for the mutation wrapper.
 */
export interface MutationWrapperOptions<TData> {
  /**
   * Message to show on success.
   * Can be a string or a function that receives the response data.
   */
  successMessage?: string | ((data: TData) => string);

  /**
   * Message to show on error.
   * Can be a string or a function that receives the error.
   */
  errorMessage?: string | ((error: unknown) => string);

  /**
   * Callback when mutation succeeds.
   */
  onSuccess?: (data: TData) => void;

  /**
   * Callback when mutation fails.
   */
  onError?: (error: unknown) => void;

  /**
   * Whether to show toast on success.
   * @default true
   */
  showSuccessToast?: boolean;

  /**
   * Whether to show toast on error.
   * @default true
   */
  showErrorToast?: boolean;
}

// ---------------------------------------------------------------------------
// Error Parsing Utility
// ---------------------------------------------------------------------------

/**
 * Parse API error into human-readable message.
 * Centralize error parsing to ensure consistency.
 *
 * @example
 * // RTK Query error
 * const message = parseApiError({ status: 400, data: { message: 'Invalid email' } });
 * // => "Invalid email"
 *
 * // Network error
 * const message = parseApiError({ status: 'FETCH_ERROR' });
 * // => "Network error. Please check your connection."
 */
export function parseApiError(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle RTK Query FetchBaseQueryError
  if (typeof error === 'object' && 'status' in error) {
    const fetchError = error as { status: number | string; data?: ApiErrorResponse };

    // Network error
    if (fetchError.status === 'FETCH_ERROR') {
      return 'Network error. Please check your connection.';
    }

    // Server responded with error
    if (fetchError.data?.message) {
      return fetchError.data.message;
    }

    // Multiple validation errors
    if (fetchError.data?.errors) {
      const messages = Object.values(fetchError.data.errors).flat();
      return messages.join('. ');
    }

    // HTTP status codes
    if (typeof fetchError.status === 'number') {
      switch (fetchError.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Authentication required. Please sign in.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'A conflict occurred. The resource may already exist.';
        case 422:
          return 'Validation failed. Please check your input.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return `Error ${fetchError.status}. Please try again.`;
      }
    }
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'An unexpected error occurred';
}

// ---------------------------------------------------------------------------
// Mutation Wrapper Hook
// ---------------------------------------------------------------------------

/**
 * useMutationWithToast - Wrap RTK Query mutations with consistent toast handling.
 *
 * **Key Pattern**: Centralizes mutation error handling and success notifications.
 *
 * **Benefits**:
 * - Consistent UX across all mutations
 * - No need to manually handle toast in each component
 * - Centralized error parsing
 * - Easy to customize per-use-case
 *
 * @param useMutation - RTK Query mutation hook
 * @param options - Wrapper options
 *
 * @example
 * // Basic usage
 * const [createUser, { isLoading }] = useMutationWithToast(
 *   useCreateUserMutation,
 *   { successMessage: 'User created' }
 * );
 *
 * // Dynamic success message
 * const [deleteUser] = useMutationWithToast(
 *   useDeleteUserMutation,
 *   { successMessage: (user) => `Deleted ${user.name}` }
 * );
 *
 * // Custom error handling
 * const [updateUser] = useMutationWithToast(
 *   useUpdateUserMutation,
 *   {
 *     onError: (error) => {
 *       if (isConflictError(error)) {
 *         showConflictDialog();
 *       }
 *     }
 *   }
 * );
 */
export function useMutationWithToast<TData, TVariables>(
  useMutation: () => [
    (variables: TVariables) => { unwrap: () => Promise<TData> },
    MutationResult<TData>,
  ],
  options: MutationWrapperOptions<TData> = {},
): [(variables: TVariables) => Promise<TData | null>, MutationResult<TData>] {
  const {
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const [mutationFn, result] = useMutation();

  /**
   * Wrapped mutation function with toast handling.
   * Returns the data on success, null on error.
   */
  const wrappedMutation = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      try {
        const data = await mutationFn(variables).unwrap();

        // Success toast
        if (showSuccessToast && successMessage) {
          const message =
            typeof successMessage === 'function' ? successMessage(data) : successMessage;
          toast.success(message);
        }

        // Success callback
        onSuccess?.(data);

        return data;
      } catch (error) {
        // Error toast
        if (showErrorToast) {
          const message = errorMessage
            ? typeof errorMessage === 'function'
              ? errorMessage(error)
              : errorMessage
            : parseApiError(error);
          toast.error(message);
        }

        // Error callback
        onError?.(error);

        return null;
      }
    },
    [
      mutationFn,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      showSuccessToast,
      showErrorToast,
    ],
  );

  return [wrappedMutation, result];
}

// ---------------------------------------------------------------------------
// Example: Confirmation Dialog Hook
// ---------------------------------------------------------------------------

export interface ConfirmDialogState {
  /** Whether dialog is open */
  open: boolean;
  /** Title to display */
  title: string;
  /** Description text */
  description: string;
  /** Confirm button text */
  confirmText: string;
  /** Whether confirmation is in progress */
  isLoading: boolean;
}

export interface UseConfirmDialogReturn {
  /** Current dialog state */
  state: ConfirmDialogState;
  /** Open dialog with custom content */
  prompt: (options: {
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: () => Promise<void> | void;
  }) => void;
  /** Confirm the action */
  confirm: () => Promise<void>;
  /** Cancel and close dialog */
  cancel: () => void;
}

import { useState, useRef } from 'react';

/**
 * useConfirmDialog - Hook for managing confirmation dialogs.
 *
 * **Key Pattern**: Encapsulates confirmation flow state and logic.
 *
 * **Benefits**:
 * - Reusable across components
 * - Handles loading states during async confirmation
 * - Clean API for triggering confirmations
 *
 * @example
 * const { state, prompt, confirm, cancel } = useConfirmDialog();
 *
 * const handleDelete = () => {
 *   prompt({
 *     title: 'Delete User',
 *     description: 'Are you sure?',
 *     onConfirm: async () => await deleteUser(id),
 *   });
 * };
 *
 * return (
 *   <>
 *     <Button onClick={handleDelete}>Delete</Button>
 *     <AlertDialog open={state.open}>
 *       ...
 *       <AlertDialogAction onClick={confirm} disabled={state.isLoading}>
 *         {state.confirmText}
 *       </AlertDialogAction>
 *     </AlertDialog>
 *   </>
 * );
 */
export function useConfirmDialog(): UseConfirmDialogReturn {
  const [state, setState] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    isLoading: false,
  });

  // Store the callback in a ref to avoid re-renders
  const onConfirmRef = useRef<(() => Promise<void> | void) | null>(null);

  const prompt = useCallback(
    (options: {
      title: string;
      description: string;
      confirmText?: string;
      onConfirm: () => Promise<void> | void;
    }) => {
      onConfirmRef.current = options.onConfirm;
      setState({
        open: true,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || 'Confirm',
        isLoading: false,
      });
    },
    [],
  );

  const confirm = useCallback(async () => {
    if (!onConfirmRef.current) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await onConfirmRef.current();
      setState((prev) => ({ ...prev, open: false, isLoading: false }));
    } catch {
      // Error is handled by the callback (via useMutationWithToast)
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const cancel = useCallback(() => {
    onConfirmRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return { state, prompt, confirm, cancel };
}

// ---------------------------------------------------------------------------
// Example Component Using Both Patterns
// ---------------------------------------------------------------------------

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';

export interface ReferenceMutationProps {
  /** ID of the item to delete */
  itemId: string;
  /** Name of the item (for display) */
  itemName: string;
  /** Called after successful deletion */
  onSuccess?: () => void;
}

/**
 * ReferenceMutation - Example component showing mutation and confirmation patterns.
 *
 * **Key Patterns**:
 * 1. Uses useConfirmDialog for confirmation flow
 * 2. Uses useMutationWithToast for error handling
 * 3. Co-locates dialog with trigger button
 */
export function ReferenceMutation({ itemId, itemName, onSuccess }: ReferenceMutationProps) {
  const { state, prompt, confirm, cancel } = useConfirmDialog();

  // In real usage, this would be:
  // const [deleteItem, { isLoading }] = useMutationWithToast(
  //   useDeleteItemMutation,
  //   { successMessage: `${itemName} deleted` }
  // );

  const handleDelete = () => {
    prompt({
      title: 'Delete Item',
      description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        // Simulate API call - in real usage: await deleteItem(itemId).unwrap();
        console.log(`Deleting item with ID: ${itemId}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success(`${itemName} deleted`);
        onSuccess?.();
      },
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <Button variant="destructive" size="sm" onClick={handleDelete} data-testid="delete-button">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>

      {/* Co-located Confirmation Dialog */}
      <AlertDialog open={state.open} onOpenChange={(open) => !open && cancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={state.isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirm}
              disabled={state.isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="confirm-delete-button"
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                state.confirmText
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export default ReferenceMutation;
