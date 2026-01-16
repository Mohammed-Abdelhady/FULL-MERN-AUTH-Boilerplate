import {
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormSetError,
} from 'react-hook-form';
import { type z } from 'zod';

/**
 * Transform Zod errors into a more readable format
 *
 * @param error - Zod validation error
 * @returns Formatted error messages object
 *
 * @example
 * ```ts
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     const formatted = formatZodError(error);
 *     console.log(formatted);
 *     // { email: 'Invalid email', password: 'Password too short' }
 *   }
 * }
 * ```
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (path) {
      formatted[path] = err.message;
    }
  });

  return formatted;
}

/**
 * Extract error message for a specific field
 *
 * @param errors - React Hook Form errors object
 * @param fieldName - Name of the field
 * @returns Error message or undefined
 *
 * @example
 * ```ts
 * const emailError = getFieldError(form.formState.errors, 'email');
 * if (emailError) {
 *   console.log(emailError); // 'Invalid email address'
 * }
 * ```
 */
export function getFieldError<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
  fieldName: Path<TFieldValues>,
): string | undefined {
  const error = errors[fieldName];
  return error?.message as string | undefined;
}

/**
 * Check if a field has an error
 *
 * @param errors - React Hook Form errors object
 * @param fieldName - Name of the field
 * @returns True if field has error
 *
 * @example
 * ```ts
 * const hasError = hasFieldError(form.formState.errors, 'email');
 * if (hasError) {
 *   // Apply error styling
 * }
 * ```
 */
export function hasFieldError<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
  fieldName: Path<TFieldValues>,
): boolean {
  return !!errors[fieldName];
}

/**
 * Map server-side API errors to form fields
 *
 * @param setError - React Hook Form setError function
 * @param serverErrors - API error response (flat object or nested)
 *
 * @example
 * ```ts
 * try {
 *   await api.post('/auth/login', data);
 * } catch (error) {
 *   if (error.response?.data?.errors) {
 *     setServerErrors(form.setError, error.response.data.errors);
 *     // Maps { email: 'User not found', password: 'Incorrect' } to form fields
 *   }
 * }
 * ```
 */
export function setServerErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  serverErrors: Record<string, string | string[]>,
): void {
  Object.entries(serverErrors).forEach(([field, message]) => {
    const errorMessage = Array.isArray(message) ? message[0] : message;

    setError(field as Path<TFieldValues>, {
      type: 'server',
      message: errorMessage,
    });
  });
}

/**
 * Clear all form errors
 *
 * @param clearErrors - React Hook Form clearErrors function
 *
 * @example
 * ```ts
 * clearAllErrors(form.clearErrors);
 * ```
 */
export function clearAllErrors<TFieldValues extends FieldValues>(
  clearErrors: (name?: Path<TFieldValues> | Path<TFieldValues>[]) => void,
): void {
  clearErrors();
}

/**
 * Get all error messages as an array
 *
 * @param errors - React Hook Form errors object
 * @returns Array of error messages
 *
 * @example
 * ```ts
 * const allErrors = getAllErrorMessages(form.formState.errors);
 * console.log(allErrors); // ['Invalid email', 'Password too short']
 * ```
 */
export function getAllErrorMessages<TFieldValues extends FieldValues>(
  errors: FieldErrors<TFieldValues>,
): string[] {
  const messages: string[] = [];

  Object.values(errors).forEach((error) => {
    if (error?.message) {
      messages.push(error.message as string);
    }
  });

  return messages;
}
