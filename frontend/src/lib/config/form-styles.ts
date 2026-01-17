/**
 * Global Form Styles Configuration
 * ===================================
 *
 * This file provides centralized styling for all form components in the application.
 * Based on the original design from old-code/client-react/src/screens/Login.jsx
 *
 * ## Architecture
 *
 * Token-based composition system with three layers:
 * 1. **TOKENS**: Atomic design tokens (colors, spacing, typography)
 * 2. **BASE_COMPOSITIONS**: Pre-composed style groups shared across components
 * 3. **FORM_STYLES**: Final component styles built from compositions
 *
 * ## How to Customize
 *
 * ### Change Visual Design (affects all components)
 * ```typescript
 * TOKENS.colors.bg = 'bg-blue-50'      // All input backgrounds
 * TOKENS.spacing.borderRadius = 'rounded-xl'  // All border radius
 * ```
 *
 * ### Change Specific Component
 * ```typescript
 * TOKENS.input.height = 'h-16'         // Only input height
 * TOKENS.button.primary.bg = 'bg-purple-500'  // Only primary button color
 * ```
 *
 * ### Override Per Instance
 * ```tsx
 * <FormInput className="h-20 px-8" />  // Instance-specific override
 * ```
 */

/**
 * Atomic design tokens - single source of truth
 */
const TOKENS = {
  // Color palette
  colors: {
    bg: 'bg-gray-100',
    bgFocus: 'focus:bg-white',
    border: 'border-gray-200',
    borderFocus: 'focus:border-gray-400',
    placeholder: 'placeholder-gray-500',
    buttonPrimaryBg: 'bg-indigo-500',
    buttonPrimaryBgHover: 'hover:bg-indigo-700',
    buttonPrimaryText: 'text-gray-100',
    buttonSecondaryBg: 'bg-indigo-100',
    buttonSecondaryBgHover: 'hover:shadow',
    buttonSecondaryText: 'text-gray-800',
  },

  // Spacing & layout
  spacing: {
    width: 'w-full',
    borderRadius: 'rounded-lg',
  },

  // Typography
  typography: {
    fontSize: 'text-sm',
    fontWeight: 'font-medium',
    buttonPrimaryFont: 'tracking-wide font-semibold',
    buttonSecondaryFont: 'font-bold',
  },

  // Component-specific dimensions
  input: {
    height: 'h-14',
    padding: 'px-5',
  },

  textarea: {
    minHeight: 'min-h-30',
    padding: 'px-5 py-3',
    resize: 'resize-none',
  },

  button: {
    height: 'h-14',
    display: 'flex items-center justify-center',
    focusRing: 'focus:shadow-outline focus:outline-none',
    primaryPadding: 'py-4',
    secondaryPadding: 'py-3',
    secondaryMaxWidth: 'max-w-xs',
    secondaryShadow: 'shadow-sm focus:shadow-sm focus:shadow-outline',
  },

  // State styles
  states: {
    border: 'border',
    focusOutline: 'focus:outline-none',
    transition: 'transition-all duration-300 ease-in-out',
  },
} as const;

/**
 * Pre-composed style groups to eliminate repetition
 */
const BASE_COMPOSITIONS = {
  // Shared by both input and textarea
  formField: [
    TOKENS.spacing.width,
    TOKENS.spacing.borderRadius,
    TOKENS.typography.fontWeight,
    TOKENS.colors.bg,
    TOKENS.states.border,
    TOKENS.colors.border,
    TOKENS.colors.placeholder,
    TOKENS.typography.fontSize,
    TOKENS.states.focusOutline,
    TOKENS.colors.borderFocus,
    TOKENS.colors.bgFocus,
  ],

  // Shared by both button variants
  button: [
    TOKENS.button.height,
    TOKENS.spacing.width,
    TOKENS.spacing.borderRadius,
    TOKENS.states.transition,
    TOKENS.button.display,
  ],
} as const;

/**
 * Final composed styles for components
 */
export const FORM_STYLES = {
  input: {
    base: [...BASE_COMPOSITIONS.formField, TOKENS.input.height, TOKENS.input.padding].join(' '),
  },

  textarea: {
    base: [
      ...BASE_COMPOSITIONS.formField,
      TOKENS.textarea.minHeight,
      TOKENS.textarea.padding,
      TOKENS.textarea.resize,
    ].join(' '),
  },

  button: {
    primary: [
      ...BASE_COMPOSITIONS.button,
      TOKENS.typography.buttonPrimaryFont,
      TOKENS.colors.buttonPrimaryBg,
      TOKENS.colors.buttonPrimaryText,
      TOKENS.button.primaryPadding,
      TOKENS.colors.buttonPrimaryBgHover,
      TOKENS.button.focusRing,
    ].join(' '),

    secondary: [
      ...BASE_COMPOSITIONS.button,
      TOKENS.button.secondaryMaxWidth,
      TOKENS.typography.buttonSecondaryFont,
      TOKENS.button.secondaryShadow,
      TOKENS.button.secondaryPadding,
      TOKENS.colors.buttonSecondaryBg,
      TOKENS.colors.buttonSecondaryText,
      TOKENS.states.focusOutline,
      TOKENS.colors.buttonSecondaryBgHover,
    ].join(' '),
  },

  error: 'text-sm font-medium text-red-600 mt-1',
  label: 'sr-only',
  container: 'space-y-0',
} as const;

/**
 * Generic helper to build className strings
 */
const buildClassName = (baseClass: string, additionalClasses?: string): string => {
  return additionalClasses ? [baseClass, additionalClasses].join(' ') : baseClass;
};

/**
 * Helper functions for applying form styles
 */
export const getInputClassName = (additionalClasses?: string) =>
  buildClassName(FORM_STYLES.input.base, additionalClasses);

export const getTextareaClassName = (additionalClasses?: string) =>
  buildClassName(FORM_STYLES.textarea.base, additionalClasses);

export const getButtonClassName = (
  variant: 'primary' | 'secondary' = 'primary',
  additionalClasses?: string,
) => buildClassName(FORM_STYLES.button[variant], additionalClasses);
