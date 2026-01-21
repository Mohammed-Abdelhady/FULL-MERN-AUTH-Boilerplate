import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/apiError';

/**
 * Standard RTK Query mutation trigger type.
 * Matches the return type of RTK Query mutation hooks.
 */
type MutationTrigger<TArg, TResult> = (arg: TArg) => {
  unwrap: () => Promise<TResult>;
};

/**
 * Options for the mutation wrapper.
 */
export interface MutationWithToastOptions<TResult> {
  /**
   * Message to show on success.
   * Can be a string or a function that receives the response data.
   */
  successMessage?: string | ((data: TResult) => string);

  /**
   * Message to show on error.
   * Can be a string or a function that receives the error.
   * If not provided, uses the default error parser.
   */
  errorMessage?: string | ((error: unknown) => string);

  /**
   * Callback when mutation succeeds.
   */
  onSuccess?: (data: TResult) => void;

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

/**
 * Return type for the wrapped mutation.
 */
export type WrappedMutation<TArg, TResult> = (arg: TArg) => Promise<TResult | null>;

/**
 * useMutationWithToast - Wrap RTK Query mutations with consistent toast handling.
 *
 * This hook provides:
 * - Automatic success/error toast notifications
 * - Centralized error parsing
 * - Type-safe mutation with callbacks
 *
 * @param mutationResult - The result tuple from an RTK Query mutation hook [trigger, result]
 * @param options - Configuration for toast messages and callbacks
 *
 * @returns A tuple with [wrappedMutation, result]
 *
 * @example
 * ```tsx
 * // Basic usage
 * const [deleteUser, { isLoading }] = useDeleteUserMutation();
 * const deleteWithToast = useMutationWithToast(
 *   deleteUser,
 *   { successMessage: 'User deleted successfully' }
 * );
 *
 * // With dynamic message
 * const updateWithToast = useMutationWithToast(
 *   updateUser,
 *   { successMessage: (user) => `${user.name} updated successfully` }
 * );
 *
 * // Usage in handler
 * const handleDelete = async () => {
 *   const result = await deleteWithToast(userId);
 *   if (result) {
 *     // Success path
 *     navigate('/users');
 *   }
 * };
 * ```
 */
export function useMutationWithToast<TArg, TResult>(
  mutationTrigger: MutationTrigger<TArg, TResult>,
  options: MutationWithToastOptions<TResult> = {},
): WrappedMutation<TArg, TResult> {
  const {
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  // Use translations for error codes
  const tErrorCodes = useTranslations('errors.codes');
  const tGeneric = useTranslations();

  /**
   * Get translated error message from error
   */
  const getTranslatedError = useCallback(
    (error: unknown): string => {
      const parsed = parseApiError(error);

      try {
        // For network/timeout errors, use generic toast translations
        if (parsed.translationKey.startsWith('toast.')) {
          const translated = tGeneric(parsed.translationKey);
          if (translated !== parsed.translationKey) {
            return translated;
          }
        }

        // For error codes, use the error codes namespace
        const translated = tErrorCodes(parsed.code);
        if (translated !== parsed.code) {
          return translated;
        }
      } catch {
        // Translation not found
      }

      // Fallback to original message
      return parsed.message;
    },
    [tErrorCodes, tGeneric],
  );

  const wrappedMutation = useCallback(
    async (arg: TArg): Promise<TResult | null> => {
      try {
        const data = await mutationTrigger(arg).unwrap();

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
            : getTranslatedError(error);
          toast.error(message);
        }

        // Error callback
        onError?.(error);

        return null;
      }
    },
    [
      mutationTrigger,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      showSuccessToast,
      showErrorToast,
      getTranslatedError,
    ],
  );

  return wrappedMutation;
}

export default useMutationWithToast;
