import { ErrorCode } from '../enums/error-code.enum';

/**
 * Standard success response wrapper.
 * All successful API responses should use this format.
 */
export class ApiResponse<T> {
  success = true as const;
  data: T;
  message?: string;

  constructor(data: T, message?: string) {
    this.data = data;
    this.message = message;
  }

  /**
   * Factory method to create a success response.
   * @param data The response data
   * @param message Optional human-readable message
   * @returns ApiResponse instance
   */
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, message);
  }
}

/**
 * Standard error response structure.
 * All error API responses should use this format.
 */
export class ErrorResponse {
  success = false as const;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    this.error = {
      code,
      message,
      details,
    };
  }

  /**
   * Factory method to create an error response.
   * @param code The error code
   * @param message Human-readable error message
   * @param details Optional additional context
   * @returns ErrorResponse instance
   */
  static error(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ): ErrorResponse {
    return new ErrorResponse(code, message, details);
  }
}
