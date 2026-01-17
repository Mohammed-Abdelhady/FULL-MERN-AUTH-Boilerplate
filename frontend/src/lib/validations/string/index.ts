/**
 * String Validators
 *
 * Comprehensive collection of string validation schemas with localization and dynamic configuration support.
 *
 * @module lib/validations/string
 */

import { z } from 'zod';
import { makeOptional, createStringValidator } from '../utils';

/**
 * Generic string validator with configurable min/max length
 */
export const zodString = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  requiredMessage?: string;
  minMessage?: string;
  maxMessage?: string;
}) => {
  let schema = z.string({
    required_error: options?.requiredMessage || 'This field is required',
    invalid_type_error: 'Must be a string',
  });

  if (options?.min !== undefined) {
    schema = schema.min(
      options.min,
      options.minMessage || `Must be at least ${options.min} characters`,
    );
  }
  if (options?.max !== undefined) {
    schema = schema.max(
      options.max,
      options.maxMessage || `Must not exceed ${options.max} characters`,
    );
  }

  return makeOptional(schema, options?.required);
};

/**
 * String validator that automatically trims whitespace
 */
export const zodTrimmedString = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  requiredMessage?: string;
}) => {
  let schema = z.string().trim();

  if (options?.required !== false) {
    schema = schema.min(1, options?.requiredMessage || 'This field is required');
  }
  if (options?.min !== undefined) {
    schema = schema.min(options.min);
  }
  if (options?.max !== undefined) {
    schema = schema.max(options.max);
  }

  return makeOptional(schema, options?.required);
};

/**
 * Email validator (RFC 5322 compliant)
 * Returns required schema by default, optional when required: false
 */
export function zodEmail(options?: {
  required?: false;
  messages?: {
    required?: string;
    invalid?: string;
  };
}): z.ZodOptional<z.ZodString>;
export function zodEmail(options: {
  required: true;
  messages?: {
    required?: string;
    invalid?: string;
  };
}): z.ZodString;
export function zodEmail(options?: {
  required?: boolean;
  messages?: {
    required?: string;
    invalid?: string;
  };
}): z.ZodString | z.ZodOptional<z.ZodString>;
export function zodEmail(options?: {
  required?: boolean;
  messages?: {
    required?: string;
    invalid?: string;
  };
}) {
  const requiredMessage = options?.messages?.required || 'Email is required';
  const schema = z
    .string({ required_error: requiredMessage })
    .trim()
    .toLowerCase()
    .min(1, requiredMessage)
    .email(options?.messages?.invalid || 'Please enter a valid email address');

  if (options?.required === false) {
    return schema.optional();
  }
  return schema;
}

/**
 * Password validator (min 8 chars, uppercase, lowercase, number)
 * Returns required schema by default, optional when required: false
 */
export function zodPassword(options?: {
  required?: false;
  min?: number;
  messages?: {
    required?: string;
    min?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
  };
}): z.ZodOptional<z.ZodString>;
export function zodPassword(options: {
  required: true;
  min?: number;
  messages?: {
    required?: string;
    min?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
  };
}): z.ZodString;
export function zodPassword(options?: {
  required?: boolean;
  min?: number;
  messages?: {
    required?: string;
    min?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
  };
}): z.ZodString | z.ZodOptional<z.ZodString>;
export function zodPassword(options?: {
  required?: boolean;
  min?: number;
  messages?: {
    required?: string;
    min?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
  };
}) {
  const min = options?.min || 8;
  const requiredMessage = options?.messages?.required || 'Password is required';
  const minMessage = options?.messages?.min || `Password must be at least ${min} characters`;

  const schema = z
    .string({ required_error: requiredMessage })
    .min(1, requiredMessage)
    .min(min, minMessage)
    .regex(
      /[A-Z]/,
      options?.messages?.uppercase || 'Password must contain at least one uppercase letter',
    )
    .regex(
      /[a-z]/,
      options?.messages?.lowercase || 'Password must contain at least one lowercase letter',
    )
    .regex(/\d/, options?.messages?.number || 'Password must contain at least one number');

  if (options?.required === false) {
    return schema.optional();
  }
  return schema;
}

/**
 * Strong password validator (adds special character requirement)
 * Returns required schema by default, optional when required: false
 */
export function zodStrongPassword(options?: {
  required?: false;
  min?: number;
  messages?: {
    required?: string;
    min?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
    special?: string;
  };
}): z.ZodOptional<z.ZodString>;
export function zodStrongPassword(options: {
  required: true;
  min?: number;
  messages?: {
    required?: string;
    min?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
    special?: string;
  };
}): z.ZodString;
export function zodStrongPassword(options?: {
  required?: boolean;
  min?: number;
  messages?: {
    required?: string;
    min?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
    special?: string;
  };
}): z.ZodString | z.ZodOptional<z.ZodString>;
export function zodStrongPassword(options?: {
  required?: boolean;
  min?: number;
  messages?: {
    required?: string;
    min?: string;
    uppercase?: string;
    lowercase?: string;
    number?: string;
    special?: string;
  };
}) {
  const min = options?.min || 8;
  const requiredMessage = options?.messages?.required || 'Password is required';
  const minMessage = options?.messages?.min || `Password must be at least ${min} characters`;

  const schema = z
    .string({ required_error: requiredMessage })
    .min(1, requiredMessage)
    .min(min, minMessage)
    .regex(
      /[A-Z]/,
      options?.messages?.uppercase || 'Password must contain at least one uppercase letter',
    )
    .regex(
      /[a-z]/,
      options?.messages?.lowercase || 'Password must contain at least one lowercase letter',
    )
    .regex(/\d/, options?.messages?.number || 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      options?.messages?.special || 'Password must contain at least one special character',
    );

  if (options?.required === false) {
    return schema.optional();
  }
  return schema;
}

/**
 * Person name validator (2-50 chars, letters, spaces, hyphens, apostrophes)
 * Returns required schema by default, optional when required: false
 */
export function zodName(options?: {
  required?: false;
  min?: number;
  max?: number;
  messages?: {
    required?: string;
    min?: string;
    max?: string;
    pattern?: string;
  };
}): z.ZodOptional<z.ZodString>;
export function zodName(options: {
  required: true;
  min?: number;
  max?: number;
  messages?: {
    required?: string;
    min?: string;
    max?: string;
    pattern?: string;
  };
}): z.ZodString;
export function zodName(options?: {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: {
    required?: string;
    min?: string;
    max?: string;
    pattern?: string;
  };
}) {
  const min = options?.min ?? 2;
  const max = options?.max ?? 50;

  const schema = z
    .string({ required_error: options?.messages?.required || 'Name is required' })
    .trim()
    .min(1, options?.messages?.required || 'Name is required')
    .min(min, options?.messages?.min || `Name must be at least ${min} characters`)
    .max(max, options?.messages?.max || `Name must not exceed ${max} characters`)
    .regex(
      /^[a-zA-Z\s'-]+$/,
      options?.messages?.pattern ||
        'Name can only contain letters, spaces, hyphens, and apostrophes',
    );

  return makeOptional(schema, options?.required);
}

/**
 * Username validator (3-20 alphanumeric + underscore)
 */
export const zodUsername = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: {
    min?: string;
    max?: string;
    pattern?: string;
  };
}) => {
  const min = options?.min || 3;
  const max = options?.max || 20;

  const schema = z
    .string()
    .trim()
    .toLowerCase()
    .min(min, options?.messages?.min || `Username must be at least ${min} characters`)
    .max(max, options?.messages?.max || `Username must not exceed ${max} characters`)
    .regex(
      /^[a-z0-9_]+$/,
      options?.messages?.pattern ||
        'Username can only contain lowercase letters, numbers, and underscores',
    );

  return makeOptional(schema, options?.required);
};

/**
 * URL validator (HTTP/HTTPS only)
 */
export const zodUrl = (options?: {
  required?: boolean;
  message?: string;
  protocolMessage?: string;
}) => {
  const schema = z
    .string()
    .url(options?.message || 'Please enter a valid URL')
    .regex(/^https?:\/\//, options?.protocolMessage || 'URL must start with http:// or https://');

  return makeOptional(schema, options?.required);
};

/**
 * URL-safe slug validator (lowercase, hyphens)
 */
export const zodSlug = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: {
    required?: string;
    max?: string;
    pattern?: string;
  };
}) => {
  const max = options?.max || 100;
  const schema = z
    .string()
    .trim()
    .toLowerCase()
    .min(1, options?.messages?.required || 'Slug is required')
    .max(max, options?.messages?.max || `Slug must not exceed ${max} characters`)
    .regex(
      /^[a-z0-9-]+$/,
      options?.messages?.pattern || 'Slug can only contain lowercase letters, numbers, and hyphens',
    );

  return makeOptional(schema, options?.required);
};

// Simple string validators using utility
export const zodHexColor = (options?: { required?: boolean; message?: string }) =>
  createStringValidator(
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    'Please enter a valid hex color (e.g., #ff5733)',
    options,
  );

export const zodUuid = (options?: { required?: boolean; message?: string }) => {
  const schema = z.string().uuid(options?.message || 'Please enter a valid UUID');
  return makeOptional(schema, options?.required);
};

export const zodIpAddress = (options?: { required?: boolean; message?: string }) => {
  const schema = z.string().ip(options?.message || 'Please enter a valid IP address');
  return makeOptional(schema, options?.required);
};

export const zodPhoneNumber = (options?: { required?: boolean; message?: string }) =>
  createStringValidator(
    /^\+?[1-9]\d{1,14}$/,
    'Please enter a valid phone number (E.164 format)',
    options,
  );

export const zodPostalCode = (options?: { required?: boolean; message?: string }) =>
  createStringValidator(
    /^\d{5}(-\d{4})?$/,
    'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)',
    options,
  );

export const zodCreditCard = (options?: { required?: boolean; message?: string }) =>
  createStringValidator(/^\d{13,19}$/, 'Please enter a valid credit card number', options);

export const zodOptionalString = () => z.string().optional();

/**
 * Search query validator (1-100 chars)
 */
export const zodSearchQuery = (options?: {
  required?: boolean;
  max?: number;
  messages?: {
    required?: string;
    max?: string;
  };
}) => {
  const max = options?.max || 100;
  const schema = z
    .string()
    .trim()
    .min(1, options?.messages?.required || 'Search query cannot be empty')
    .max(max, options?.messages?.max || `Search query must not exceed ${max} characters`);

  return makeOptional(schema, options?.required);
};

/**
 * Textarea validator (configurable length)
 */
export const zodTextarea = (options?: {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: {
    required?: string;
    min?: string;
    max?: string;
  };
}) => {
  let schema = z.string().trim();

  if (options?.required !== false) {
    schema = schema.min(1, options?.messages?.required || 'This field is required');
  }
  if (options?.min !== undefined) {
    schema = schema.min(
      options.min,
      options.messages?.min || `Must be at least ${options.min} characters`,
    );
  }
  if (options?.max !== undefined) {
    schema = schema.max(
      options.max,
      options.messages?.max || `Must not exceed ${options.max} characters`,
    );
  }

  return makeOptional(schema, options?.required);
};

/**
 * Rich text/HTML content validator
 */
export const zodRichText = (options?: {
  required?: boolean;
  max?: number;
  messages?: {
    required?: string;
    max?: string;
  };
}) => {
  const max = options?.max || 50000;
  const schema = z
    .string()
    .min(1, options?.messages?.required || 'Content is required')
    .max(max, options?.messages?.max || `Content must not exceed ${max} characters`);

  return makeOptional(schema, options?.required);
};

/**
 * JSON string validator
 */
export const zodJson = (options?: { required?: boolean; message?: string }) => {
  const schema = z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: options?.message || 'Invalid JSON format' },
  );

  return makeOptional(schema, options?.required);
};

export const zodBase64 = (options?: { required?: boolean; message?: string }) =>
  createStringValidator(/^[A-Za-z0-9+/]+=*$/, 'Invalid Base64 format', options);

/**
 * Markdown content validator
 */
export const zodMarkdown = (options?: {
  required?: boolean;
  max?: number;
  messages?: {
    required?: string;
    max?: string;
  };
}) => {
  const max = options?.max || 10000;
  const schema = z
    .string()
    .min(1, options?.messages?.required || 'Content is required')
    .max(max, options?.messages?.max || `Content must not exceed ${max} characters`);

  return makeOptional(schema, options?.required);
};

export const zodAlphanumeric = (options?: { required?: boolean; message?: string }) =>
  createStringValidator(/^[a-zA-Z0-9]+$/, 'Must contain only letters and numbers', options);

export const zodLowercase = (options?: { required?: boolean; message?: string }) => {
  const schema = z
    .string()
    .toLowerCase()
    .regex(/^[a-z]+$/, options?.message || 'Must contain only lowercase letters');
  return makeOptional(schema, options?.required);
};

export const zodUppercase = (options?: { required?: boolean; message?: string }) => {
  const schema = z
    .string()
    .toUpperCase()
    .regex(/^[A-Z]+$/, options?.message || 'Must contain only uppercase letters');
  return makeOptional(schema, options?.required);
};
