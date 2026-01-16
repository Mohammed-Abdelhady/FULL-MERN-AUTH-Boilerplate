/**
 * Validation Schemas
 *
 * Central export point for all validation schemas organized by category.
 * All exports are tree-shakeable - only imported validators will be included in your bundle.
 *
 * @module lib/validations
 *
 * @example
 * ```typescript
 * // Import only what you need
 * import { zodEmail, zodPassword } from '@/lib/validations';
 *
 * // Use in schemas
 * const loginSchema = z.object({
 *   email: zodEmail,
 *   password: zodPassword
 * });
 * ```
 */

// Export validators by category
export * from './string';
export * from './number';
export * from './date';
export * from './boolean';
export * from './array';
export * from './object';
export * from './special';
export * from './file';
export * from './composed';
