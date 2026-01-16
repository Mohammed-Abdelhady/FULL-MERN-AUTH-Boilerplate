import { Test, TestingModule } from '@nestjs/testing';
import { GlobalExceptionFilter } from './global-exception.filter';
import { AppException } from '../exceptions/app.exception';
import { ErrorCode } from '../enums/error-code.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';
import { ArgumentsHost } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalExceptionFilter],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AppException handling', () => {
    it('should handle AppException with correct error code and message', () => {
      const exception = new AppException(
        ErrorCode.EMAIL_ALREADY_EXISTS,
        'Email already registered',
        HttpStatus.CONFLICT,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ErrorCode.EMAIL_ALREADY_EXISTS,
            message: 'Email already registered',
          }),
        }),
      );
    });

    it('should include details when provided', () => {
      const exception = new AppException(
        ErrorCode.ACTIVATION_CODE_INVALID,
        'Invalid code',
        HttpStatus.BAD_REQUEST,
        { remainingAttempts: 3 },
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: { remainingAttempts: 3 },
          }),
        }),
      );
    });
  });

  describe('HttpException handling', () => {
    it('should map "Email already registered" to EMAIL_ALREADY_EXISTS', () => {
      const exception = new HttpException(
        'Email already registered',
        HttpStatus.CONFLICT,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.EMAIL_ALREADY_EXISTS,
          }),
        }),
      );
    });

    it('should map "Authentication required" to SESSION_REQUIRED', () => {
      const exception = new HttpException(
        'Authentication required',
        HttpStatus.UNAUTHORIZED,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.SESSION_REQUIRED,
          }),
        }),
      );
    });

    it('should map "Invalid email or password" to INVALID_CREDENTIALS', () => {
      const exception = new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.INVALID_CREDENTIALS,
          }),
        }),
      );
    });

    it('should map 404 status to NOT_FOUND', () => {
      const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.NOT_FOUND,
          }),
        }),
      );
    });

    it('should map 403 status to FORBIDDEN', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.FORBIDDEN,
          }),
        }),
      );
    });

    it('should map unknown HttpException to INTERNAL_ERROR', () => {
      const exception = new HttpException(
        'Unknown error',
        HttpStatus.I_AM_A_TEAPOT,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.INTERNAL_ERROR,
          }),
        }),
      );
    });
  });

  describe('Validation exception handling', () => {
    it('should handle validation errors with field details', () => {
      const exception = new HttpException(
        {
          message: [
            'email must be an email',
            'password must be at least 8 characters',
          ],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            details: expect.objectContaining({
              fields: expect.objectContaining({
                email: ['email must be an email'],
                password: ['password must be at least 8 characters'],
              }),
            }),
          }),
        }),
      );
    });

    it('should handle single validation error', () => {
      const exception = new HttpException(
        {
          message: ['name should not be empty'],
          error: 'Bad Request',
          statusCode: 400,
        },
        HttpStatus.BAD_REQUEST,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.VALIDATION_ERROR,
            details: expect.objectContaining({
              fields: expect.objectContaining({
                name: ['name should not be empty'],
              }),
            }),
          }),
        }),
      );
    });

    it('should not treat regular BadRequestException as validation error', () => {
      const exception = new HttpException(
        'Something went wrong',
        HttpStatus.BAD_REQUEST,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.INTERNAL_ERROR, // Falls back to generic mapping
          }),
        }),
      );
    });
  });

  describe('ThrottlerException handling', () => {
    it('should handle ThrottlerException with RATE_LIMIT_EXCEEDED code', () => {
      const exception = new ThrottlerException('60');

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.TOO_MANY_REQUESTS,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.RATE_LIMIT_EXCEEDED,
            details: expect.objectContaining({
              retryAfter: 60,
            }),
          }),
        }),
      );
    });
  });

  describe('Unknown exception handling', () => {
    it('should handle unknown exceptions with INTERNAL_ERROR code', () => {
      const exception = new Error('Unexpected error');

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.INTERNAL_ERROR,
            message: 'An unexpected error occurred',
          }),
        }),
      );
    });

    it('should handle non-Error exceptions', () => {
      const exception = 'String exception';

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.INTERNAL_ERROR,
            message: 'An unexpected error occurred',
          }),
        }),
      );
    });
  });

  describe('Response format', () => {
    it('should always return success: false for errors', () => {
      const exception = new AppException(
        ErrorCode.EMAIL_ALREADY_EXISTS,
        'Test error',
        HttpStatus.CONFLICT,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        }),
      );
    });

    it('should include error object with code and message', () => {
      const exception = new AppException(
        ErrorCode.EMAIL_SEND_FAILED,
        'Failed to send email',
        HttpStatus.BAD_REQUEST,
      );

      const mockHost: ArgumentsHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: () => mockResponse,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: ErrorCode.EMAIL_SEND_FAILED,
            message: 'Failed to send email',
          }),
        }),
      );
    });
  });
});
