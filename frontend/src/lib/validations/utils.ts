/**
 * Validation Utilities
 *
 * Reusable helper functions for creating dynamic validators.
 *
 * @module lib/validations/utils
 */

import { z } from 'zod';

/**
 * Make a schema optional based on the required flag
 */
export const makeOptional = <T extends z.ZodTypeAny>(schema: T, required?: boolean) => {
  return required === false ? schema.optional() : schema;
};

/**
 * Create a simple string validator with regex pattern
 */
export const createStringValidator = (
  pattern: RegExp,
  patternMessage: string,
  options?: { required?: boolean; message?: string },
) => {
  const schema = z.string().regex(pattern, options?.message || patternMessage);
  return makeOptional(schema, options?.required);
};

/**
 * Create a string validator with min/max and optional regex
 */
export const createBoundedString = (
  defaultMin: number,
  defaultMax: number,
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    messages?: {
      min?: string;
      max?: string;
      pattern?: string;
    };
  },
) => {
  const min = options?.min ?? defaultMin;
  const max = options?.max ?? defaultMax;

  let schema = z
    .string()
    .trim()
    .min(min, options?.messages?.min || `Must be at least ${min} characters`)
    .max(max, options?.messages?.max || `Must not exceed ${max} characters`);

  if (options?.pattern) {
    schema = schema.regex(options.pattern, options.messages?.pattern || 'Invalid format');
  }

  return makeOptional(schema, options?.required);
};

/**
 * Create a number validator with range
 */
export const createNumberInRange = (
  defaultMin: number,
  defaultMax: number,
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
    messages?: {
      integer?: string;
      min?: string;
      max?: string;
    };
  },
) => {
  const min = options?.min ?? defaultMin;
  const max = options?.max ?? defaultMax;

  let schema = z.number();

  if (options?.integer !== false) {
    schema = schema.int(options?.messages?.integer || 'Must be a whole number');
  }

  schema = schema
    .min(min, options?.messages?.min || `Must be at least ${min}`)
    .max(max, options?.messages?.max || `Must not exceed ${max}`);

  return makeOptional(schema, options?.required);
};

/**
 * Create a simple number validator
 */
export const createNumberValidator = (
  method: 'positive' | 'negative' | 'nonnegative' | 'int' | 'finite',
  defaultMessage: string,
  options?: { required?: boolean; message?: string },
) => {
  const schema = z.number()[method](options?.message || defaultMessage);
  return makeOptional(schema, options?.required);
};

/**
 * Create a date validator with refine
 */
export const createDateValidator = (
  refineFn: (date: Date) => boolean,
  defaultMessage: string,
  options?: { required?: boolean; message?: string },
) => {
  const schema = z.date().refine(refineFn, { message: options?.message || defaultMessage });
  return makeOptional(schema, options?.required);
};

/**
 * Create a file validator with size and type constraints
 */
export const createFileValidator = (
  maxSize: number,
  allowedTypes: string[],
  options?: {
    required?: boolean;
    maxSize?: number;
    allowedTypes?: string[];
    messages?: {
      size?: string;
      type?: string;
    };
  },
) => {
  const finalMaxSize = options?.maxSize ?? maxSize;
  const finalTypes = options?.allowedTypes ?? allowedTypes;

  const schema = z
    .instanceof(File)
    .refine(
      (file) => file.size <= finalMaxSize,
      options?.messages?.size || `File must be less than ${Math.round(finalMaxSize / 1_000_000)}MB`,
    )
    .refine(
      (file) => finalTypes.includes(file.type),
      options?.messages?.type ||
        `Only ${finalTypes.map((t) => t.split('/')[1]?.toUpperCase()).join(', ')} files allowed`,
    );

  return makeOptional(schema, options?.required);
};
