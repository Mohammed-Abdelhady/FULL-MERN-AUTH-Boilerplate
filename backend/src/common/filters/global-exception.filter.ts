import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';
import { AppException } from '../exceptions/app.exception';
import { ErrorCode } from '../enums/error-code.enum';
import { ErrorResponse } from '../dto/api-response.dto';

/**
 * Global exception filter that transforms all exceptions into standardized error responses.
 * Handles AppException, HttpException, ValidationException, ThrottlerException, and unknown errors.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let errorResponse: ErrorResponse;
    let statusCode: number;

    if (exception instanceof AppException) {
      // Handle custom AppException with embedded error code
      statusCode = exception.getStatus();
      errorResponse = ErrorResponse.error(
        exception.getCode(),
        exception.message,
        exception.getDetails(),
      );
      this.logger.warn(
        `AppException: ${exception.getCode()} - ${exception.message}`,
      );
    } else if (exception instanceof ThrottlerException) {
      // Handle rate limiting exceptions (must be before HttpException since it extends HttpException)
      statusCode = HttpStatus.TOO_MANY_REQUESTS;
      const response = exception.getResponse();
      const retryAfter =
        typeof response === 'object' &&
        response !== null &&
        'retryAfter' in response
          ? (response as { retryAfter: number }).retryAfter
          : 60;
      errorResponse = ErrorResponse.error(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Too many requests',
        {
          retryAfter,
        },
      );
      this.logger.warn(`ThrottlerException: ${exception.message}`);
    } else if (exception instanceof HttpException) {
      // Handle standard NestJS HttpException
      statusCode = exception.getStatus();

      // Check for validation exceptions (from ValidationPipe)
      const validationResult = this.extractValidationErrors(exception);
      if (validationResult) {
        errorResponse = ErrorResponse.error(
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          validationResult,
        );
        this.logger.warn(
          `ValidationException: ${JSON.stringify(validationResult.fields)}`,
        );
      } else {
        const { code, details } = this.mapHttpExceptionToErrorCode(exception);
        errorResponse = ErrorResponse.error(code, exception.message, details);
        this.logger.warn(
          `HttpException (${statusCode}): ${code} - ${exception.message}`,
        );
      }
    } else {
      // Handle unknown exceptions
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = ErrorResponse.error(
        ErrorCode.INTERNAL_ERROR,
        'An unexpected error occurred',
      );
      this.logger.error(
        `Unknown exception: ${exception instanceof Error ? exception.message : String(exception)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(statusCode).json(errorResponse);
  }

  /**
   * Maps standard NestJS HttpException messages to error codes.
   * This enables backward compatibility while using the new error code system.
   */
  private mapHttpExceptionToErrorCode(exception: HttpException): {
    code: ErrorCode;
    details?: Record<string, unknown>;
  } {
    const message = exception.message;

    // Authentication errors
    if (message.includes('Authentication required')) {
      return { code: ErrorCode.SESSION_REQUIRED };
    }
    if (
      message.includes('Invalid or expired session') ||
      message.includes('Invalid session')
    ) {
      return { code: ErrorCode.SESSION_INVALID };
    }
    if (message.includes('Invalid email or password')) {
      return { code: ErrorCode.INVALID_CREDENTIALS };
    }

    // Activation errors
    if (message.includes('Email already registered')) {
      return { code: ErrorCode.EMAIL_ALREADY_EXISTS };
    }
    if (message.includes('Failed to send activation email')) {
      return { code: ErrorCode.EMAIL_SEND_FAILED };
    }
    if (message.includes('No pending registration found')) {
      return { code: ErrorCode.NO_PENDING_REGISTRATION };
    }
    if (message.includes('Activation code has expired')) {
      return { code: ErrorCode.ACTIVATION_CODE_EXPIRED };
    }
    if (
      message.includes('Invalid code') ||
      message.includes('attempts remaining')
    ) {
      return { code: ErrorCode.ACTIVATION_CODE_INVALID };
    }
    if (message.includes('Maximum attempts exceeded')) {
      return { code: ErrorCode.MAX_ATTEMPTS_EXCEEDED };
    }

    // Verification errors
    if (message.includes('Email verification required')) {
      return { code: ErrorCode.EMAIL_NOT_VERIFIED };
    }

    // HTTP status code mappings
    const status = exception.getStatus();
    if (status === 404) {
      return { code: ErrorCode.NOT_FOUND };
    }
    if (status === 403) {
      return { code: ErrorCode.FORBIDDEN };
    }
    if (status === 401) {
      return { code: ErrorCode.SESSION_INVALID };
    }
    return { code: ErrorCode.INTERNAL_ERROR };
  }

  /**
   * Extracts validation errors from BadRequestException thrown by ValidationPipe.
   * Returns null if not a validation exception.
   */
  private extractValidationErrors(
    exception: HttpException,
  ): { fields: Record<string, string[]> } | null {
    const status = exception.getStatus() as HttpStatus;
    if (status !== HttpStatus.BAD_REQUEST) {
      return null;
    }

    const response = exception.getResponse();

    // ValidationPipe returns { message: string[], error: 'Bad Request', statusCode: 400 }
    if (typeof response === 'object' && response !== null) {
      const responseObj = response as Record<string, unknown>;
      const messages = responseObj.message;

      // Check if message is an array (validation errors)
      if (Array.isArray(messages) && messages.length > 0) {
        // Parse messages into field-based errors
        const fields: Record<string, string[]> = {};

        for (const msg of messages) {
          if (typeof msg === 'string') {
            // Try to extract field name from message (e.g., "email must be an email")
            const fieldMatch = msg.match(/^(\w+)\s/);
            const fieldName = fieldMatch ? fieldMatch[1] : 'general';

            if (!fields[fieldName]) {
              fields[fieldName] = [];
            }
            fields[fieldName].push(msg);
          }
        }

        return { fields };
      }
    }

    return null;
  }
}
