/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './services/oauth.service';
import { OAuthCallbackDto } from './dto/oauth-callback.dto';

describe('OAuthController', () => {
  let controller: OAuthController;
  let oauthService: jest.Mocked<OAuthService>;
  let mockResponse: Partial<Response>;

  const mockAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?...';
  const mockOAuthData = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    isVerified: true,
    provider: 'google',
  };

  beforeEach(async () => {
    oauthService = {
      getAuthorizationUrl: jest.fn().mockReturnValue(mockAuthUrl),
      handleCallback: jest.fn().mockResolvedValue({
        success: true,
        data: mockOAuthData,
        message: 'User authenticated successfully',
      }),
      getSupportedProviders: jest.fn().mockReturnValue(['google']),
    } as unknown as jest.Mocked<OAuthService>;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
    } as unknown as Partial<Response>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthController],
      providers: [
        {
          provide: OAuthService,
          useValue: oauthService,
        },
      ],
    }).compile();

    controller = module.get<OAuthController>(OAuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should return authorization URL for google provider', () => {
      const result = controller.getAuthorizationUrl({ provider: 'google' });

      expect(result.success).toBe(true);
      expect(result.data?.url).toBe(mockAuthUrl);
      expect(result.data?.provider).toBe('google');
      expect(
        jest.mocked(oauthService.getAuthorizationUrl),
      ).toHaveBeenCalledWith('google');
    });
  });

  describe('handleCallback', () => {
    it('should handle OAuth callback and return user data', async () => {
      const dto: OAuthCallbackDto = {
        provider: 'google',
        code: 'test-code',
        state: 'test-state',
      };

      const response = mockResponse as Response;
      await controller.handleCallback(dto, response);

      expect(jest.mocked(oauthService.handleCallback)).toHaveBeenCalledWith(
        'google',
        'test-code',
        'test-state',
        response,
      );
      expect(jest.mocked(mockResponse.status)).toHaveBeenCalledWith(200);
      expect(jest.mocked(mockResponse.json)).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockOAuthData,
        }),
      );
    });

    it('should handle callback without state', async () => {
      const dto: OAuthCallbackDto = {
        provider: 'google',
        code: 'test-code',
      };

      const response = mockResponse as Response;
      await controller.handleCallback(dto, response);

      expect(jest.mocked(oauthService.handleCallback)).toHaveBeenCalledWith(
        'google',
        'test-code',
        '',
        response,
      );
    });
  });

  describe('getProviders', () => {
    it('should return list of supported providers', () => {
      const result = controller.getProviders();

      expect(result.success).toBe(true);
      expect(result.data?.providers).toEqual(['google']);
      expect(
        jest.mocked(oauthService.getSupportedProviders),
      ).toHaveBeenCalled();
    });
  });
});
