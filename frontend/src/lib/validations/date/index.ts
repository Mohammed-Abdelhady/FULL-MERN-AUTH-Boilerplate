/**
 * Date & Time Validators
 *
 * Collection of date and time validation schemas with localization support.
 *
 * @module lib/validations/date
 */

import { z } from 'zod';
import { makeOptional, createDateValidator, createStringValidator } from '../utils';

/**
 * Date validator
 */
export const zodDate = (options?: {
  required?: boolean;
  messages?: {
    required?: string;
    invalid?: string;
  };
}) => {
  const schema = z.date({
    required_error: options?.messages?.required || 'Date is required',
    invalid_type_error: options?.messages?.invalid || 'Must be a valid date',
  });

  return makeOptional(schema, options?.required);
};

/**
 * Future date validator (must be after today)
 */
export const zodFutureDate = (options?: { required?: boolean; message?: string }) =>
  createDateValidator((date) => date > new Date(), 'Date must be in the future', options);

/**
 * Past date validator (must be before today)
 */
export const zodPastDate = (options?: { required?: boolean; message?: string }) =>
  createDateValidator((date) => date < new Date(), 'Date must be in the past', options);

/**
 * Date range validator factory
 */
export const zodDateRange = (
  min: Date,
  max: Date,
  options?: {
    required?: boolean;
    messages?: {
      min?: string;
      max?: string;
    };
  },
) => {
  const schema = z
    .date()
    .min(min, options?.messages?.min || `Date must be after ${min.toLocaleDateString()}`)
    .max(max, options?.messages?.max || `Date must be before ${max.toLocaleDateString()}`);

  return makeOptional(schema, options?.required);
};

/**
 * Time validator (HH:MM format)
 */
export const zodTime = (options?: { required?: boolean; message?: string }) =>
  createStringValidator(
    /^([01]\d|2[0-3]):([0-5]\d)$/,
    'Time must be in HH:MM format (e.g., 14:30)',
    options,
  );

/**
 * DateTime validator (ISO 8601 format)
 */
export const zodDateTime = (options?: { required?: boolean; message?: string }) => {
  const schema = z.string().datetime(options?.message || 'Must be a valid ISO 8601 datetime');
  return makeOptional(schema, options?.required);
};

/**
 * Unix timestamp validator
 */
export const zodTimestamp = (options?: {
  required?: boolean;
  messages?: {
    integer?: string;
    positive?: string;
  };
}) => {
  const schema = z
    .number()
    .int(options?.messages?.integer || 'Timestamp must be an integer')
    .positive(options?.messages?.positive || 'Timestamp must be positive');

  return makeOptional(schema, options?.required);
};
