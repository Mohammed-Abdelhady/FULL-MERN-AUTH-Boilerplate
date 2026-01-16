import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseOAuthStrategy } from './base-oauth.strategy';
import { OAuthUserProfile } from './oauth.strategy.interface';

/**
 * GitHub Token Response
 */
interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/**
 * GitHub User Profile Response
 */
interface GitHubUserProfileResponse {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

/**
 * GitHub Email Response
 */
interface GitHubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

/**
 * GitHub OAuth Strategy
 * Implements OAuth 2.0 for GitHub authentication
 */
@Injectable()
export class GitHubOAuthStrategy extends BaseOAuthStrategy {
  private readonly AUTH_URL = 'https://github.com/login/oauth/authorize';
  private readonly TOKEN_URL = 'https://github.com/login/oauth/access_token';
  private readonly USER_INFO_URL = 'https://api.github.com/user';
  private readonly USER_EMAILS_URL = 'https://api.github.com/user/emails';

  constructor(configService: ConfigService) {
    super(configService, 'github');
  }

  /**
   * Get OAuth scopes for GitHub
   */
  protected getScopes(): string[] {
    return ['user:email', 'read:user'];
  }

  /**
   * Get the authorization URL for GitHub OAuth
   * @param state - Optional state parameter for CSRF protection
   * @returns Authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.callbackUrl,
      scope: this.config.scopes.join(' '),
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for user profile
   * @param code - Authorization code from GitHub OAuth callback
   * @param _state - Optional state parameter for CSRF protection (unused in GitHub implementation)
   * @returns User profile from GitHub
   */
  async getUserProfile(
    code: string,
    _state?: string,
  ): Promise<OAuthUserProfile> {
    try {
      // Exchange authorization code for access token
      const tokenResponse = await this.exchangeCodeForToken(code);

      this.logger.log('Successfully obtained access token for GitHub OAuth');

      // Use access token to get user profile
      const userProfile = await this.httpGet<GitHubUserProfileResponse>(
        this.USER_INFO_URL,
        {
          Authorization: `Bearer ${tokenResponse.access_token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'NestJS-Auth-App',
        },
      );

      // Get verified email from GitHub emails API
      const email = await this.getPrimaryVerifiedEmail(
        tokenResponse.access_token,
      );

      if (!email) {
        throw new Error('No verified email found on GitHub account');
      }

      // Transform to standardized OAuthUserProfile format
      return {
        providerId: userProfile.id.toString(),
        email,
        name: userProfile.name || userProfile.login,
        picture: userProfile.avatar_url,
        emailVerified: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get GitHub user profile: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from GitHub
   * @returns Token response
   */
  private async exchangeCodeForToken(
    code: string,
  ): Promise<GitHubTokenResponse> {
    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = (await response.json()) as GitHubTokenResponse & {
      error?: string;
      error_description?: string;
    };

    if (data.error) {
      throw new Error(
        `GitHub OAuth error: ${data.error} - ${data.error_description || 'Unknown error'}`,
      );
    }

    return data;
  }

  /**
   * Get primary verified email from GitHub emails API
   * @param accessToken - GitHub access token
   * @returns Primary verified email or null
   */
  private async getPrimaryVerifiedEmail(
    accessToken: string,
  ): Promise<string | null> {
    try {
      const emails = await this.httpGet<GitHubEmailResponse[]>(
        this.USER_EMAILS_URL,
        {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'NestJS-Auth-App',
        },
      );

      // Find primary verified email
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      if (primaryEmail) {
        return primaryEmail.email;
      }

      // Fallback to any verified email
      const verifiedEmail = emails.find((e) => e.verified);
      return verifiedEmail?.email ?? null;
    } catch (error) {
      this.logger.error(
        `Failed to get GitHub emails: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
