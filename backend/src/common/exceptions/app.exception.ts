import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-code.enum';

/**
 * Custom exception class that includes error codes for standardized API responses.
 * Extends HttpException to maintain compatibility with NestJS exception handling.
 */
export class AppException extends HttpException {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, unknown>,
  ) {
    super(message, statusCode);
    this.code = code;
    this.details = details;
  }

  /**
   * Get the error code for this exception.
   */
  getCode(): ErrorCode {
    return this.code;
  }

  /**
   * Get optional additional context for this exception.
   */
  getDetails(): Record<string, unknown> | undefined {
    return this.details;
  }
}
