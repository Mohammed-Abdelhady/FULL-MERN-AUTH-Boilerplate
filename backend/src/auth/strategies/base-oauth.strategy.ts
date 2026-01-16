import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IOAuthStrategy,
  OAuthConfig,
  OAuthUserProfile,
} from './oauth.strategy.interface';

/**
 * Base OAuth Strategy
 * Provides common functionality for OAuth provider implementations
 */
@Injectable()
export abstract class BaseOAuthStrategy implements IOAuthStrategy {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly config: OAuthConfig;

  constructor(
    protected readonly configService: ConfigService,
    protected readonly providerName: string,
  ) {
    this.config = this.loadConfig();
  }

  /**
   * Get the provider name
   */
  get provider(): string {
    return this.providerName;
  }

  /**
   * Load OAuth configuration from environment variables
   */
  protected loadConfig(): OAuthConfig {
    const clientId = this.configService.get<string>(
      `oauth.${this.providerName}.clientId`,
    );
    const clientSecret = this.configService.get<string>(
      `oauth.${this.providerName}.clientSecret`,
    );
    const callbackUrl = this.configService.get<string>(
      `oauth.${this.providerName}.callbackUrl`,
    );
    const scopes = this.getScopes();

    if (!clientId || !clientSecret || !callbackUrl) {
      throw new Error(
        `Missing OAuth configuration for ${this.providerName}. Required: clientId, clientSecret, callbackUrl`,
      );
    }

    return {
      clientId,
      clientSecret,
      callbackUrl,
      scopes,
    };
  }

  /**
   * Get OAuth scopes for the provider
   * Override in provider-specific implementations
   */
  protected abstract getScopes(): string[];

  /**
   * Get the authorization URL for the OAuth provider
   * @param state - Optional state parameter for CSRF protection
   * @returns Authorization URL
   */
  abstract getAuthorizationUrl(state?: string): string;

  /**
   * Exchange authorization code for user profile
   * @param code - Authorization code from OAuth callback
   * @param state - Optional state parameter for CSRF protection
   * @returns User profile from OAuth provider
   */
  abstract getUserProfile(
    code: string,
    state?: string,
  ): Promise<OAuthUserProfile>;

  /**
   * Generate a random state string for CSRF protection
   */
  protected generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Validate state parameter for CSRF protection
   * @param state - State from callback
   * @param expectedState - Expected state from session
   */
  protected validateState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }

  /**
   * Make an HTTP GET request
   * @param url - URL to request
   * @param headers - Optional headers
   * @returns Response data
   */
  protected async httpGet<T>(
    url: string,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make an HTTP POST request with form data
   * @param url - URL to request
   * @param data - Form data to send
   * @param headers - Optional headers
   * @returns Response data
   */
  protected async httpPostForm<T>(
    url: string,
    data: Record<string, string>,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP request failed: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
