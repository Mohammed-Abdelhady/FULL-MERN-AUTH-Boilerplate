/**
 * Change Password Validation Schema
 *
 * Validates the change password form with:
 * - Current password (required)
 * - New password (8+ chars, uppercase, lowercase, number)
 * - Confirm password (must match new password)
 */

import { z } from 'zod';
import { zodPassword } from './string';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: zodPassword({ required: true }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
