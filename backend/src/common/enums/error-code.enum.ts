/**
 * Standard error codes for API responses.
 * Frontend can use these codes for i18n translation and programmatic error handling.
 */
export enum ErrorCode {
  // Authentication errors
  /** Invalid email or password provided */
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  /** Email address is already registered */
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',

  // Activation errors
  /** Activation code has expired */
  ACTIVATION_CODE_EXPIRED = 'ACTIVATION_CODE_EXPIRED',
  /** Invalid activation code provided */
  ACTIVATION_CODE_INVALID = 'ACTIVATION_CODE_INVALID',
  /** Maximum activation attempts exceeded */
  MAX_ATTEMPTS_EXCEEDED = 'MAX_ATTEMPTS_EXCEEDED',
  /** No pending registration found for email */
  NO_PENDING_REGISTRATION = 'NO_PENDING_REGISTRATION',

  // Email errors
  /** Failed to send email */
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',

  // Session errors
  /** Authentication session required */
  SESSION_REQUIRED = 'SESSION_REQUIRED',
  /** Session is invalid or malformed */
  SESSION_INVALID = 'SESSION_INVALID',
  /** Session has expired */
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Verification errors
  /** Email address not verified */
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',

  // Validation errors
  /** Request validation failed */
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Rate limiting errors
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Generic errors
  /** Internal server error */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  /** Resource not found */
  NOT_FOUND = 'NOT_FOUND',
  /** Access forbidden */
  FORBIDDEN = 'FORBIDDEN',
}
