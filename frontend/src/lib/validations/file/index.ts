/**
 * File Validators
 *
 * Collection of file upload validation schemas with localization support.
 *
 * @module lib/validations/file
 */

import { z } from 'zod';
import { makeOptional, createFileValidator } from '../utils';

/**
 * Generic file validator with size and type limits
 */
export const zodFile = (options?: {
  required?: boolean;
  maxSize?: number;
  messages?: {
    required?: string;
    empty?: string;
    size?: string;
  };
}) => {
  let schema = z.instanceof(File, {
    message: options?.messages?.required || 'Please upload a file',
  });

  schema = schema.refine(
    (file) => file.size > 0,
    options?.messages?.empty || 'File cannot be empty',
  );

  if (options?.maxSize) {
    schema = schema.refine(
      (file) => file.size <= options.maxSize!,
      options.messages?.size ||
        `File must be less than ${Math.round(options.maxSize / 1_000_000)}MB`,
    );
  }

  return makeOptional(schema, options?.required);
};

/**
 * Image file validator (JPG, PNG, WebP, max 5MB)
 */
export const zodImage = (options?: {
  required?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  messages?: {
    size?: string;
    type?: string;
  };
}) =>
  createFileValidator(5_000_000, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], options);

/**
 * Document file validator (PDF, DOCX, max 10MB)
 */
export const zodDocument = (options?: {
  required?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  messages?: {
    size?: string;
    type?: string;
  };
}) =>
  createFileValidator(
    10_000_000,
    [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ],
    options,
  );

/**
 * Multiple files validator factory
 */
export const zodMultipleFiles = (options?: {
  maxFiles?: number;
  minFiles?: number;
  fileValidator?: z.ZodType<File>;
  messages?: {
    min?: string;
    max?: string;
  };
}) => {
  const maxFiles = options?.maxFiles ?? 10;
  const minFiles = options?.minFiles ?? 1;
  const fileSchema = options?.fileValidator ?? z.instanceof(File);

  return z
    .array(fileSchema)
    .min(
      minFiles,
      options?.messages?.min || `Please upload at least ${minFiles} file${minFiles > 1 ? 's' : ''}`,
    )
    .max(maxFiles, options?.messages?.max || `Maximum ${maxFiles} files allowed`);
};
