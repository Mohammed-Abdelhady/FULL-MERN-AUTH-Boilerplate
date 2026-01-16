/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Response } from 'express';
import { OAuthService, OAuthProvider } from './oauth.service';
import { GoogleOAuthStrategy } from '../strategies/google-oauth.strategy';
import { SessionService } from './session.service';
import { User } from '../../user/schemas/user.schema';
import { AuthProvider } from '../../user/enums/auth-provider.enum';
import { OAuthUserProfile } from '../strategies/oauth.strategy.interface';
import { AppException } from '../../common/exceptions/app.exception';

describe('OAuthService', () => {
  let service: OAuthService;
  let googleStrategy: jest.Mocked<GoogleOAuthStrategy>;
  let sessionService: jest.Mocked<SessionService>;
  let userModel: {
    findOne: jest.Mock;
    create: jest.Mock;
  };
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    authProvider: AuthProvider.GOOGLE,
    isVerified: true,
    googleId: 'google-123',
    save: jest.fn().mockResolvedValue(undefined),
  };

  const mockOAuthProfile: OAuthUserProfile = {
    providerId: 'google-123',
    email: 'test@example.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    picture: 'https://example.com/picture.jpg',
    emailVerified: true,
  };

  const mockResponse = {
    req: {
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
    },
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    // Mock GoogleOAuthStrategy
    googleStrategy = {
      provider: 'google',
      getAuthorizationUrl: jest.fn(),
      getUserProfile: jest.fn(),
    } as unknown as jest.Mocked<GoogleOAuthStrategy>;

    // Mock SessionService
    sessionService = {
      createSession: jest.fn().mockResolvedValue('session-token-123'),
    } as unknown as jest.Mocked<SessionService>;

    // Mock UserModel
    userModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    // Mock ConfigService
    configService = {
      get: jest.fn((key: string, defaultValue?: string | number) => {
        const defaults: Record<string, string | number> = {
          'session.cookieName': 'sid',
          'session.cookieMaxAge': 604800000,
          NODE_ENV: 'development',
        };
        return defaults[key] ?? defaultValue;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: SessionService,
          useValue: sessionService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: GoogleOAuthStrategy,
          useValue: googleStrategy,
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should return authorization URL for google provider', () => {
      const expectedUrl = 'https://accounts.google.com/o/oauth2/v2/auth?...';
      googleStrategy.getAuthorizationUrl.mockReturnValue(expectedUrl);

      const result = service.getAuthorizationUrl('google');

      expect(result).toBe(expectedUrl);
      expect(
        jest.mocked(googleStrategy.getAuthorizationUrl),
      ).toHaveBeenCalled();
    });

    it('should throw error for unsupported provider', () => {
      expect(() =>
        service.getAuthorizationUrl('facebook' as OAuthProvider),
      ).toThrow(AppException);
    });
  });

  describe('handleCallback', () => {
    it('should authenticate existing user by provider ID', async () => {
      userModel.findOne.mockResolvedValue(mockUser);
      googleStrategy.getUserProfile.mockResolvedValue(mockOAuthProfile);

      const result = await service.handleCallback(
        'google',
        'code123',
        'state',
        mockResponse,
      );

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
      expect(jest.mocked(mockResponse.cookie)).toHaveBeenCalledWith(
        'sid',
        'session-token-123',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      );
    });

    it('should link OAuth account to existing user by email', async () => {
      const existingUser = {
        ...mockUser,
        googleId: undefined,
        authProvider: AuthProvider.EMAIL,
        save: jest.fn().mockResolvedValue(undefined),
      };
      userModel.findOne
        .mockResolvedValueOnce(null) // First call - find by provider ID
        .mockResolvedValueOnce(existingUser); // Second call - find by email
      googleStrategy.getUserProfile.mockResolvedValue(mockOAuthProfile);

      const result = await service.handleCallback(
        'google',
        'code123',
        'state',
        mockResponse,
      );

      expect(result.success).toBe(true);
      expect(existingUser.googleId).toBe('google-123');
      expect(existingUser.isVerified).toBe(true);
      expect(existingUser.save).toHaveBeenCalled();
    });

    it('should create new user for first-time OAuth login', async () => {
      userModel.findOne.mockResolvedValue(null);
      userModel.create.mockResolvedValue(mockUser);
      googleStrategy.getUserProfile.mockResolvedValue(mockOAuthProfile);

      const result = await service.handleCallback(
        'google',
        'code123',
        'state',
        mockResponse,
      );

      expect(result.success).toBe(true);
      expect(userModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'google-123',
        isVerified: true,
        authProvider: AuthProvider.GOOGLE,
        role: 'user',
      });
    });

    it('should update user info if changed', async () => {
      const existingUser = {
        ...mockUser,
        name: 'Old Name',
        email: 'old@example.com',
        save: jest.fn().mockResolvedValue(undefined),
      };
      userModel.findOne.mockResolvedValue(existingUser);
      googleStrategy.getUserProfile.mockResolvedValue(mockOAuthProfile);

      await service.handleCallback('google', 'code123', 'state', mockResponse);

      expect(existingUser.name).toBe('Test User');
      expect(existingUser.email).toBe('test@example.com');
      expect(existingUser.save).toHaveBeenCalled();
    });
  });

  describe('getSupportedProviders', () => {
    it('should return list of supported providers', () => {
      const providers = service.getSupportedProviders();

      expect(providers).toContain('google');
      expect(Array.isArray(providers)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid provider', async () => {
      await expect(
        service.handleCallback(
          'facebook' as OAuthProvider,
          'code',
          'state',
          mockResponse,
        ),
      ).rejects.toThrow(AppException);
    });

    it('should propagate OAuth errors', async () => {
      googleStrategy.getUserProfile.mockRejectedValue(
        new Error('OAuth failed'),
      );

      await expect(
        service.handleCallback('google', 'code', 'state', mockResponse),
      ).rejects.toThrow('OAuth failed');
    });
  });
});
