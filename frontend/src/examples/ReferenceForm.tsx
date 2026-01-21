'use client';

/**
 * ReferenceForm.tsx - Form with Custom Hook Pattern
 *
 * This reference implementation demonstrates:
 * 1. Extracting form state and validation to a custom hook
 * 2. Separation of concerns (hook handles logic, component handles UI)
 * 3. Reusable validation patterns
 * 4. Proper TypeScript typing for forms
 *
 * @example
 * // In a dialog component
 * function CreateUserDialog() {
 *   const { form, errors, isValid, handleSubmit, reset } = useReferenceForm();
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       ...
 *     </form>
 *   );
 * }
 */

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Form data shape - define your form fields here.
 * Keeping this as an interface allows easy extension.
 */
export interface ReferenceFormData {
  name: string;
  email: string;
  role: string;
}

/**
 * Form errors shape - maps field names to error messages.
 * Empty string = no error, string = error message.
 */
export interface ReferenceFormErrors {
  name?: string;
  email?: string;
  role?: string;
}

/**
 * Hook return type - everything the component needs.
 */
export interface UseReferenceFormReturn {
  /** Current form data */
  form: ReferenceFormData;
  /** Current validation errors */
  errors: ReferenceFormErrors;
  /** Whether form is currently valid */
  isValid: boolean;
  /** Whether form is being submitted */
  isSubmitting: boolean;
  /** Update a specific field */
  setField: <K extends keyof ReferenceFormData>(field: K, value: ReferenceFormData[K]) => void;
  /** Validate entire form */
  validate: () => boolean;
  /** Submit form (returns success boolean) */
  handleSubmit: () => Promise<boolean>;
  /** Reset form to initial state */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Default Values
// ---------------------------------------------------------------------------

const DEFAULT_FORM_DATA: ReferenceFormData = {
  name: '',
  email: '',
  role: 'user',
};

// ---------------------------------------------------------------------------
// Validation Utilities (could be extracted to src/lib/forms/validation.ts)
// ---------------------------------------------------------------------------

/**
 * Email validation regex.
 * Standard format: local-part@domain
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a single field.
 * Returns error message or undefined if valid.
 */
function validateField(field: keyof ReferenceFormData, value: string): string | undefined {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Name is required';
      if (value.trim().length < 2) return 'Name must be at least 2 characters';
      if (value.trim().length > 100) return 'Name must not exceed 100 characters';
      return undefined;

    case 'email':
      if (!value.trim()) return 'Email is required';
      if (!EMAIL_REGEX.test(value)) return 'Invalid email format';
      return undefined;

    case 'role':
      if (!value) return 'Role is required';
      if (!['user', 'admin', 'manager'].includes(value)) return 'Invalid role';
      return undefined;

    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// Custom Hook - Form Logic
// ---------------------------------------------------------------------------

/**
 * useReferenceForm - Custom hook for form state management.
 *
 * **Key Pattern**: Extracts all form logic from the component:
 * - State management (form data, errors, loading)
 * - Validation logic
 * - Submission handling
 *
 * **Benefits**:
 * - Component stays focused on rendering
 * - Logic is testable in isolation
 * - Reusable across similar forms
 * - Easy to mock in tests
 *
 * @param initialData - Optional initial form data
 * @param onSubmit - Optional callback when form is submitted successfully
 */
export function useReferenceForm(
  initialData?: Partial<ReferenceFormData>,
  onSubmit?: (data: ReferenceFormData) => Promise<void>,
): UseReferenceFormReturn {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [form, setForm] = useState<ReferenceFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });

  const [errors, setErrors] = useState<ReferenceFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  /**
   * Form is valid when all required fields have values and no errors.
   * Memoized to prevent unnecessary recalculations.
   */
  const isValid = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.role.length > 0 &&
      Object.values(errors).every((e) => !e)
    );
  }, [form, errors]);

  // ---------------------------------------------------------------------------
  // Field Update Handler
  // ---------------------------------------------------------------------------

  /**
   * Update a specific field and clear its error.
   * Uses generic to ensure type safety.
   */
  const setField = useCallback(
    <K extends keyof ReferenceFormData>(field: K, value: ReferenceFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  /**
   * Validate entire form.
   * Returns true if valid, false if errors exist.
   */
  const validate = useCallback((): boolean => {
    const newErrors: ReferenceFormErrors = {
      name: validateField('name', form.name),
      email: validateField('email', form.email),
      role: validateField('role', form.role),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e);
  }, [form]);

  // ---------------------------------------------------------------------------
  // Submit Handler
  // ---------------------------------------------------------------------------

  /**
   * Handle form submission.
   * Returns true on success, false on failure.
   */
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    // Validate first
    if (!validate()) {
      return false;
    }

    setIsSubmitting(true);

    try {
      // Call provided submit handler or default behavior
      if (onSubmit) {
        await onSubmit(form);
      } else {
        // Default: simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success('Form submitted successfully');
      }

      return true;
    } catch (error) {
      // Handle API errors
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error.data as { message?: string }).message || 'Submission failed'
          : 'An unexpected error occurred';
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, validate, onSubmit]);

  // ---------------------------------------------------------------------------
  // Reset Handler
  // ---------------------------------------------------------------------------

  /**
   * Reset form to initial state.
   * Useful when closing dialogs or after successful submission.
   */
  const reset = useCallback(() => {
    setForm({ ...DEFAULT_FORM_DATA, ...initialData });
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    form,
    errors,
    isValid,
    isSubmitting,
    setField,
    validate,
    handleSubmit,
    reset,
  };
}

// ---------------------------------------------------------------------------
// Example Component Using the Hook
// ---------------------------------------------------------------------------

export interface ReferenceFormProps {
  /** Called when form is submitted successfully */
  onSuccess?: (data: ReferenceFormData) => void;
  /** Called when form is cancelled */
  onCancel?: () => void;
}

/**
 * ReferenceForm - Example form component using the custom hook.
 *
 * **Key Pattern**: Component focuses on rendering, hook handles logic.
 *
 * This separation:
 * - Keeps component under 200 lines
 * - Makes logic testable
 * - Allows logic reuse in other forms
 */
export function ReferenceForm({ onSuccess, onCancel }: ReferenceFormProps) {
  const { form, errors, isSubmitting, setField, handleSubmit, reset } = useReferenceForm();

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      onSuccess?.(form);
      reset();
    }
  };

  const onFormCancel = () => {
    reset();
    onCancel?.();
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-4" data-testid="reference-form">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="Enter name"
          disabled={isSubmitting}
          className={errors.name ? 'border-red-500' : ''}
          data-testid="reference-form-name"
        />
        {errors.name && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="Enter email"
          disabled={isSubmitting}
          className={errors.email ? 'border-red-500' : ''}
          data-testid="reference-form-email"
        />
        {errors.email && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Role Field */}
      <div className="space-y-2">
        <Label htmlFor="role">
          Role <span className="text-red-500">*</span>
        </Label>
        <Select
          value={form.role}
          onValueChange={(value) => setField('role', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger data-testid="reference-form-role">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.role}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onFormCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} data-testid="reference-form-submit">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export default ReferenceForm;
