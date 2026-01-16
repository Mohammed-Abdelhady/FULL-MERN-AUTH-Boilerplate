/**
 * Boolean Validators
 *
 * Collection of boolean validation schemas with localization support.
 *
 * @module lib/validations/boolean
 */

import { z } from 'zod';

/**
 * Boolean validator
 * @example
 * zodBoolean({ required: false })
 */
export const zodBoolean = (options?: {
  required?: boolean;
  messages?: {
    required?: string;
    invalid?: string;
  };
}) => {
  const schema = z.boolean({
    required_error: options?.messages?.required || 'This field is required',
    invalid_type_error: options?.messages?.invalid || 'Must be true or false',
  });

  return options?.required === false ? schema.optional() : schema;
};

/**
 * Accept terms validator (must be true)
 * @example
 * zodAcceptTerms({ message: 'You must agree' })
 */
export const zodAcceptTerms = (options?: { message?: string }) => {
  return z.literal(true, {
    errorMap: () => ({ message: options?.message || 'You must accept the terms and conditions' }),
  });
};
