import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseOAuthStrategy } from './base-oauth.strategy';
import { OAuthUserProfile } from './oauth.strategy.interface';

/**
 * Facebook Token Response
 */
interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Facebook User Profile Response
 */
interface FacebookUserProfileResponse {
  id: string;
  email?: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

/**
 * Facebook OAuth Strategy
 * Implements OAuth 2.0 for Facebook authentication using Graph API v18.0
 */
@Injectable()
export class FacebookOAuthStrategy extends BaseOAuthStrategy {
  private readonly AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
  private readonly TOKEN_URL =
    'https://graph.facebook.com/v18.0/oauth/access_token';
  private readonly USER_INFO_URL = 'https://graph.facebook.com/v18.0/me';

  constructor(configService: ConfigService) {
    super(configService, 'facebook');
  }

  /**
   * Get OAuth scopes for Facebook
   */
  protected getScopes(): string[] {
    return ['email', 'public_profile'];
  }

  /**
   * Get the authorization URL for Facebook OAuth
   * @param state - Optional state parameter for CSRF protection
   * @returns Authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: this.config.scopes.join(','),
      response_type: 'code',
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for user profile
   * @param code - Authorization code from Facebook OAuth callback
   * @param _state - Optional state parameter for CSRF protection (unused)
   * @returns User profile from Facebook
   */
  async getUserProfile(
    code: string,
    _state?: string,
  ): Promise<OAuthUserProfile> {
    try {
      // Exchange authorization code for access token
      const tokenResponse = await this.exchangeCodeForToken(code);

      this.logger.log('Successfully obtained access token for Facebook OAuth');

      // Use access token to get user profile
      const userProfile = await this.fetchUserProfile(
        tokenResponse.access_token,
      );

      // Validate email exists
      if (!userProfile.email) {
        throw new Error('No email found on Facebook account');
      }

      // Transform to standardized OAuthUserProfile format
      return {
        providerId: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture?.data?.url,
        emailVerified: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get Facebook user profile: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from Facebook
   * @returns Token response
   */
  private async exchangeCodeForToken(
    code: string,
  ): Promise<FacebookTokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.callbackUrl,
      code,
    });

    const response = await fetch(`${this.TOKEN_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = (await response.json()) as
      | FacebookTokenResponse
      | { error: { message: string; type: string; code: number } };

    if ('error' in data) {
      throw new Error(`Facebook OAuth error: ${data.error.message}`);
    }

    return data;
  }

  /**
   * Fetch user profile from Facebook Graph API
   * @param accessToken - Facebook access token
   * @returns User profile
   */
  private async fetchUserProfile(
    accessToken: string,
  ): Promise<FacebookUserProfileResponse> {
    const params = new URLSearchParams({
      fields: 'id,email,name,picture',
      access_token: accessToken,
    });

    const response = await fetch(`${this.USER_INFO_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch user profile: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = (await response.json()) as
      | FacebookUserProfileResponse
      | { error: { message: string; type: string; code: number } };

    if ('error' in data) {
      throw new Error(`Facebook API error: ${data.error.message}`);
    }

    return data;
  }
}
