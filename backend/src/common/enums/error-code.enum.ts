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

  // Admin errors
  /** User does not exist */
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  /** Cannot change own role/status */
  CANNOT_MODIFY_SELF = 'CANNOT_MODIFY_SELF',
  /** Cannot modify user with higher role */
  CANNOT_MODIFY_HIGHER_ROLE = 'CANNOT_MODIFY_HIGHER_ROLE',
  /** Cannot assign ADMIN role via API */
  INVALID_ROLE_ASSIGNMENT = 'INVALID_ROLE_ASSIGNMENT',
  /** User is already deleted */
  USER_ALREADY_DELETED = 'USER_ALREADY_DELETED',

  // User self-service errors
  /** Current password is incorrect */
  INVALID_CURRENT_PASSWORD = 'INVALID_CURRENT_PASSWORD',
  /** New password is same as current */
  SAME_PASSWORD = 'SAME_PASSWORD',
  /** Session not found */
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  /** Cannot revoke current session */
  CANNOT_REVOKE_CURRENT_SESSION = 'CANNOT_REVOKE_CURRENT_SESSION',
  /** Admin cannot deactivate their own account */
  ADMIN_CANNOT_DEACTIVATE_SELF = 'ADMIN_CANNOT_DEACTIVATE_SELF',
}
