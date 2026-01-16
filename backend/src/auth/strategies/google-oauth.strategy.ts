import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseOAuthStrategy } from './base-oauth.strategy';
import { OAuthUserProfile } from './oauth.strategy.interface';

/**
 * Google OAuth Token Response
 */
interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

/**
 * Google User Profile Response
 */
interface GoogleUserProfileResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * Google OAuth Strategy
 * Implements OAuth 2.0 for Google authentication
 */
@Injectable()
export class GoogleOAuthStrategy extends BaseOAuthStrategy {
  private readonly AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private readonly USER_INFO_URL =
    'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor(configService: ConfigService) {
    super(configService, 'google');
  }

  /**
   * Get OAuth scopes for Google
   */
  protected getScopes(): string[] {
    return ['openid', 'email', 'profile'];
  }

  /**
   * Get the authorization URL for Google OAuth
   * @param state - Optional state parameter for CSRF protection
   * @returns Authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for user profile
   * @param code - Authorization code from Google OAuth callback
   * @param _state - Optional state parameter for CSRF protection (unused in Google implementation)
   * @returns User profile from Google
   */
  async getUserProfile(
    code: string,
    _state?: string,
  ): Promise<OAuthUserProfile> {
    try {
      // Exchange authorization code for access token
      const tokenResponse = await this.httpPostForm<GoogleTokenResponse>(
        this.TOKEN_URL,
        {
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.callbackUrl,
          grant_type: 'authorization_code',
        },
      );

      this.logger.log(`Successfully obtained access token for Google OAuth`);

      // Use access token to get user profile
      const userProfile = await this.httpGet<GoogleUserProfileResponse>(
        this.USER_INFO_URL,
        {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      );

      // Validate that email is verified
      if (!userProfile.verified_email) {
        throw new Error('Google email is not verified');
      }

      // Transform to standardized OAuthUserProfile format
      return {
        providerId: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        firstName: userProfile.given_name,
        lastName: userProfile.family_name,
        picture: userProfile.picture,
        emailVerified: userProfile.verified_email,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get Google user profile: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
