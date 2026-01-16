/**
 * Number Validators
 *
 * Collection of number validation schemas with localization support.
 *
 * @module lib/validations/number
 */

import { z } from 'zod';
import { makeOptional, createNumberValidator, createNumberInRange } from '../utils';

/**
 * Generic number validator
 */
export const zodNumber = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: {
    required?: string;
    invalid?: string;
    min?: string;
    max?: string;
  };
}) => {
  let schema = z
    .number({
      required_error: options?.messages?.required || 'This field is required',
      invalid_type_error: options?.messages?.invalid || 'Must be a number',
    })
    .finite('Must be a finite number');

  if (options?.min !== undefined) {
    schema = schema.min(options.min, options.messages?.min || `Must be at least ${options.min}`);
  }
  if (options?.max !== undefined) {
    schema = schema.max(options.max, options.messages?.max || `Must not exceed ${options.max}`);
  }

  return makeOptional(schema, options?.required);
};

// Simple number validators using utility
export const zodPositiveNumber = (options?: { required?: boolean; message?: string }) =>
  createNumberValidator('positive', 'Must be a positive number', options);

export const zodNegativeNumber = (options?: { required?: boolean; message?: string }) =>
  createNumberValidator('negative', 'Must be a negative number', options);

export const zodInteger = (options?: { required?: boolean; message?: string }) =>
  createNumberValidator('int', 'Must be an integer', options);

export const zodFloat = (options?: { required?: boolean; message?: string }) =>
  createNumberValidator('finite', 'Must be a valid decimal number', options);

/**
 * Percentage validator (0-100)
 */
export const zodPercentage = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: {
    min?: string;
    max?: string;
  };
}) =>
  createNumberInRange(0, 100, {
    ...options,
    integer: false,
    messages: {
      min: options?.messages?.min || `Percentage must be at least ${options?.min ?? 0}`,
      max: options?.messages?.max || `Percentage must not exceed ${options?.max ?? 100}`,
    },
  });

/**
 * Price validator (currency with 2 decimals)
 */
export const zodPrice = (options?: { required?: boolean; message?: string }) => {
  const schema = z
    .number()
    .nonnegative(options?.message || 'Price must be non-negative')
    .multipleOf(0.01, 'Price must have at most 2 decimal places');

  return makeOptional(schema, options?.required);
};

// Age validator (0-150)
export const zodAge = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: {
    integer?: string;
    min?: string;
    max?: string;
  };
}) => createNumberInRange(0, 150, options);

// Year validator (1900 to current year + 10)
export const zodYear = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: {
    integer?: string;
    min?: string;
    max?: string;
  };
}) => createNumberInRange(1900, new Date().getFullYear() + 10, options);

// Month validator (1-12)
export const zodMonth = (options?: {
  required?: boolean;
  messages?: {
    integer?: string;
    min?: string;
    max?: string;
  };
}) => createNumberInRange(1, 12, options);

// Day validator (1-31)
export const zodDay = (options?: {
  required?: boolean;
  messages?: {
    integer?: string;
    min?: string;
    max?: string;
  };
}) => createNumberInRange(1, 31, options);

// Rating validator (1-5 stars)
export const zodRating = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: {
    integer?: string;
    min?: string;
    max?: string;
  };
}) => createNumberInRange(1, 5, options);
