/**
 * Array Validators
 *
 * Collection of array validation schemas.
 *
 * @module lib/validations/array
 */

import { z } from 'zod';

/**
 * Generic array validator factory
 * @example
 * zodArray(z.string()).min(1).max(10)
 */
export const zodArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(schema, {
    required_error: 'This field is required',
    invalid_type_error: 'Must be an array',
  });

/**
 * Non-empty array validator factory
 * @example
 * zodNonEmptyArray(z.string())
 */
export const zodNonEmptyArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(schema).nonempty('Array must contain at least one item');

/**
 * String array validator
 * @example
 * zodStringArray.parse(['a', 'b', 'c']) // valid
 */
export const zodStringArray = z.array(z.string());

/**
 * Number array validator
 * @example
 * zodNumberArray.parse([1, 2, 3]) // valid
 */
export const zodNumberArray = z.array(z.number());

/**
 * Unique array validator factory (no duplicates)
 * @example
 * zodUniqueArray(z.string())
 */
export const zodUniqueArray = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .array(schema)
    .refine((arr) => new Set(arr).size === arr.length, { message: 'Array items must be unique' });

/**
 * Object array validator factory
 * @example
 * zodObjectArray(z.object({ id: z.number(), name: z.string() }))
 */
export const zodObjectArray = <T extends z.ZodTypeAny>(schema: T) => z.array(schema);

/**
 * Enum array validator factory
 * @example
 * zodEnumArray(z.enum(['a', 'b', 'c']))
 */
export const zodEnumArray = <T extends z.ZodTypeAny>(schema: T) => z.array(schema);

/**
 * Tuple validator (fixed-length typed array)
 * @example
 * zodTuple([z.string(), z.number()])
 */
export const zodTuple = <T extends [z.ZodTypeAny, ...z.ZodTypeAny[]]>(schemas: T) =>
  z.tuple(schemas);
