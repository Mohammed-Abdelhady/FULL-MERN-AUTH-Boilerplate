import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import {
  IOAuthStrategy,
  OAuthUserProfile,
} from '../strategies/oauth.strategy.interface';
import { GoogleOAuthStrategy } from '../strategies/google-oauth.strategy';
import { User, UserDocument } from '../../user/schemas/user.schema';
import { AuthProvider } from '../../user/enums/auth-provider.enum';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { SessionService } from './session.service';

/**
 * OAuth Provider Type
 */
export type OAuthProvider = 'google' | 'facebook';

/**
 * OAuth Service
 * Manages OAuth providers and handles OAuth authentication flow
 */
@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly strategies: Map<OAuthProvider, IOAuthStrategy> = new Map();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
    private readonly googleStrategy: GoogleOAuthStrategy,
  ) {
    this.registerStrategies();
  }

  /**
   * Register available OAuth strategies
   */
  private registerStrategies(): void {
    this.strategies.set('google', this.googleStrategy);
    // Add other providers here as they are implemented
    // this.strategies.set('facebook', this.facebookStrategy);
  }

  /**
   * Get strategy for a specific provider
   * @param provider - OAuth provider name
   * @returns OAuth strategy
   * @throws Error if provider is not supported
   */
  private getStrategy(provider: OAuthProvider): IOAuthStrategy {
    const strategy = this.strategies.get(provider);

    if (!strategy) {
      throw new AppException(
        ErrorCode.INVALID_OAUTH_PROVIDER,
        `OAuth provider '${provider}' is not supported`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return strategy;
  }

  /**
   * Get authorization URL for OAuth provider
   * @param provider - OAuth provider name
   * @returns Authorization URL
   */
  getAuthorizationUrl(provider: OAuthProvider): string {
    const strategy = this.getStrategy(provider);
    const state = this.generateState();
    return strategy.getAuthorizationUrl(state);
  }

  /**
   * Handle OAuth callback and authenticate user
   * @param provider - OAuth provider name
   * @param code - Authorization code from OAuth callback
   * @param state - State parameter for CSRF protection
   * @param response - Express response object for setting cookie
   * @returns User data
   */
  async handleCallback(
    provider: OAuthProvider,
    code: string,
    state: string,
    response: Response,
  ): Promise<ApiResponse<OAuthLoginResponseData>> {
    try {
      const strategy = this.getStrategy(provider);

      // Get user profile from OAuth provider
      const oauthProfile = await strategy.getUserProfile(code, state);

      this.logger.log(
        `Received OAuth profile from ${provider}: ${oauthProfile.email}`,
      );

      // Find or create user
      const user = await this.findOrCreateUser(provider, oauthProfile);

      // Create session
      const userAgent = response.req.headers['user-agent'] || 'Unknown';
      const ip = response.req.ip || '127.0.0.1';
      const sessionToken = await this.sessionService.createSession(
        user._id,
        userAgent,
        ip,
      );

      // Set HTTP-only cookie
      const cookieName = this.configService.get<string>(
        'session.cookieName',
        'sid',
      );
      const cookieMaxAge = this.configService.get<number>(
        'session.cookieMaxAge',
        604800000,
      );

      response.cookie(cookieName, sessionToken, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'strict',
        maxAge: cookieMaxAge,
        path: '/',
      });

      this.logger.log(`User authenticated via ${provider}: ${user.email}`);

      return OAuthLoginResponseDto.success({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
        provider,
      });
    } catch (error) {
      this.logger.error(
        `OAuth callback failed for ${provider}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Find existing user or create new user from OAuth profile
   * @param provider - OAuth provider name
   * @param oauthProfile - User profile from OAuth provider
   * @returns User document
   */
  private async findOrCreateUser(
    provider: OAuthProvider,
    oauthProfile: OAuthUserProfile,
  ): Promise<UserDocument> {
    // First, try to find user by provider ID
    const providerIdField = `${provider}Id` as keyof User;
    const existingUserByProvider = await this.userModel.findOne({
      [providerIdField]: oauthProfile.providerId,
    });

    if (existingUserByProvider) {
      // Update user info if needed
      if (
        existingUserByProvider.name !== oauthProfile.name ||
        existingUserByProvider.email !== oauthProfile.email
      ) {
        existingUserByProvider.name = oauthProfile.name;
        existingUserByProvider.email = oauthProfile.email;
        await existingUserByProvider.save();
      }
      return existingUserByProvider;
    }

    // Try to find user by email
    const existingUserByEmail = await this.userModel.findOne({
      email: oauthProfile.email,
    });

    if (existingUserByEmail) {
      // Link OAuth account to existing user
      (existingUserByEmail[providerIdField] as string) =
        oauthProfile.providerId;
      existingUserByEmail.isVerified = true;
      await existingUserByEmail.save();

      this.logger.log(
        `Linked ${provider} account to existing user: ${oauthProfile.email}`,
      );
      return existingUserByEmail;
    }

    // Map provider to AuthProvider enum
    const authProviderMap: Record<OAuthProvider, AuthProvider> = {
      google: AuthProvider.GOOGLE,
      facebook: AuthProvider.FACEBOOK,
    };

    // Create new user
    const newUser = await this.userModel.create({
      email: oauthProfile.email,
      name: oauthProfile.name,
      [providerIdField]: oauthProfile.providerId,
      isVerified: oauthProfile.emailVerified ?? true,
      authProvider: authProviderMap[provider],
      role: 'user',
    });

    this.logger.log(`Created new user via ${provider}: ${oauthProfile.email}`);
    return newUser;
  }

  /**
   * Generate a random state string for CSRF protection
   */
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Get list of supported OAuth providers
   * @returns Array of provider names
   */
  getSupportedProviders(): OAuthProvider[] {
    return Array.from(this.strategies.keys());
  }
}

/**
 * OAuth Login Response DTO
 */
export interface OAuthLoginResponseData {
  id: string;
  email: string;
  name: string;
  role: string;
  authProvider: AuthProvider;
  isVerified: boolean;
  provider: string;
}

/**
 * OAuth Login Response DTO static methods
 */
export class OAuthLoginResponseDto {
  static success(
    data: OAuthLoginResponseData,
  ): ApiResponse<OAuthLoginResponseData> {
    return ApiResponse.success(data);
  }
}
