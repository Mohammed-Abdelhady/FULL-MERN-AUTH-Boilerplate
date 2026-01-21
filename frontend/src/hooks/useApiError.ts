'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  parseApiError,
  getErrorCode,
  isErrorCode,
  isValidationError,
  getFieldErrors,
  type ParsedApiError,
} from '@/lib/apiError';
import { ErrorCode } from '@/constants/errorCodes';

/**
 * Options for useApiError hook
 */
export interface UseApiErrorOptions {
  /**
   * Translation namespace for error codes
   * @default 'errors.codes'
   */
  namespace?: string;

  /**
   * Whether to automatically show toast on error
   * @default false
   */
  showToast?: boolean;

  /**
   * Fallback message when translation is not found
   */
  fallbackMessage?: string;
}

/**
 * Return type for useApiError hook
 */
export interface UseApiErrorReturn {
  /**
   * Parse an API error and get all details
   */
  parseError: (error: unknown) => ParsedApiError;

  /**
   * Get translated error message from an error
   */
  getErrorMessage: (error: unknown) => string;

  /**
   * Get error code from an error
   */
  getCode: (error: unknown) => string;

  /**
   * Check if error matches a specific code
   */
  isCode: (error: unknown, code: string) => boolean;

  /**
   * Check if error is a validation error
   */
  isValidation: (error: unknown) => boolean;

  /**
   * Get field-level errors from validation error
   */
  getFields: (error: unknown) => Record<string, string[]> | undefined;

  /**
   * Handle error with optional toast notification
   * Returns the translated error message
   */
  handleError: (error: unknown, showToast?: boolean) => string;

  /**
   * ErrorCode constants for comparison
   */
  ErrorCode: typeof ErrorCode;
}

/**
 * useApiError - Hook for handling API errors with i18n support
 *
 * Provides utilities to parse, translate, and handle API errors consistently
 * across all components. Uses the centralized error code translations.
 *
 * @param options - Configuration options
 * @returns Object with error handling utilities
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { handleError, isCode, ErrorCode } = useApiError();
 *   const [login] = useLoginMutation();
 *
 *   const onSubmit = async (data) => {
 *     try {
 *       await login(data).unwrap();
 *     } catch (error) {
 *       const message = handleError(error, true); // Shows toast
 *
 *       // Handle specific errors
 *       if (isCode(error, ErrorCode.INVALID_CREDENTIALS)) {
 *         form.setError('password', { message });
 *       }
 *     }
 *   };
 * }
 * ```
 */
export function useApiError(options: UseApiErrorOptions = {}): UseApiErrorReturn {
  const { namespace = 'errors.codes', showToast = false, fallbackMessage } = options;

  const t = useTranslations(namespace);
  const tGeneric = useTranslations();

  /**
   * Get translated message for an error
   */
  const getErrorMessage = useCallback(
    (error: unknown): string => {
      const parsed = parseApiError(error);

      // Try to get translation for the error code
      try {
        // For network/timeout errors, use the generic toast translations
        if (parsed.translationKey.startsWith('toast.')) {
          const translated = tGeneric(parsed.translationKey);
          if (translated !== parsed.translationKey) {
            return translated;
          }
        }

        // For error codes, use the error code namespace
        const translated = t(parsed.code);
        if (translated !== parsed.code) {
          return translated;
        }
      } catch {
        // Translation not found
      }

      // Fallback to provided fallback or original message
      return fallbackMessage || parsed.message;
    },
    [t, tGeneric, fallbackMessage],
  );

  /**
   * Handle error with optional toast
   */
  const handleError = useCallback(
    (error: unknown, shouldShowToast?: boolean): string => {
      const message = getErrorMessage(error);

      if (shouldShowToast ?? showToast) {
        toast.error(message);
      }

      return message;
    },
    [getErrorMessage, showToast],
  );

  /**
   * Memoized return object
   */
  return useMemo(
    () => ({
      parseError: parseApiError,
      getErrorMessage,
      getCode: getErrorCode,
      isCode: isErrorCode,
      isValidation: isValidationError,
      getFields: getFieldErrors,
      handleError,
      ErrorCode,
    }),
    [getErrorMessage, handleError],
  );
}

export default useApiError;
