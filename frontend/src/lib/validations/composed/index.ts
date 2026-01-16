/**
 * Composed Validators
 *
 * Complex validators composed from multiple base validators.
 *
 * @module lib/validations/composed
 */

import { z } from 'zod';
import { zodPassword } from '../string';

/**
 * Password with confirmation validator
 * @example
 * zodPasswordWithConfirm({ min: 10 }).parse({ password: 'Test1234!', confirmPassword: 'Test1234!' })
 */
export const zodPasswordWithConfirm = (options?: {
  min?: number;
  messages?: {
    min?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
    match?: string;
  };
}) =>
  z
    .object({
      password: zodPassword({ min: options?.min, messages: options?.messages }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: options?.messages?.match || 'Passwords must match',
      path: ['confirmPassword'],
    });
