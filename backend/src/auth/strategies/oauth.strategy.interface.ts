/**
 * OAuth Strategy Interface
 * Defines the contract for OAuth provider implementations
 */
export interface IOAuthStrategy {
  /**
   * Get the provider name (e.g., 'google', 'facebook')
   */
  readonly provider: string;

  /**
   * Check if this OAuth provider is enabled and configured
   */
  readonly isEnabled: boolean;

  /**
   * Get the authorization URL for the OAuth provider
   * @param state - Optional state parameter for CSRF protection
   * @returns Authorization URL
   */
  getAuthorizationUrl(state?: string): string;

  /**
   * Exchange authorization code for user profile
   * @param code - Authorization code from OAuth callback
   * @param state - Optional state parameter for CSRF protection
   * @returns User profile from OAuth provider
   */
  getUserProfile(code: string, state?: string): Promise<OAuthUserProfile>;
}

/**
 * OAuth User Profile Interface
 * Standardized user profile structure from OAuth providers
 */
export interface OAuthUserProfile {
  /**
   * Unique provider ID
   */
  providerId: string;

  /**
   * User email
   */
  email: string;

  /**
   * User name (may be combined first/last name)
   */
  name: string;

  /**
   * First name (optional)
   */
  firstName?: string;

  /**
   * Last name (optional)
   */
  lastName?: string;

  /**
   * Profile picture URL (optional)
   */
  picture?: string;

  /**
   * Email verified status (optional, defaults to true for OAuth)
   */
  emailVerified?: boolean;
}

/**
 * OAuth Configuration Interface
 * Configuration required for OAuth providers
 */
export interface OAuthConfig {
  /**
   * OAuth client ID
   */
  clientId: string;

  /**
   * OAuth client secret
   */
  clientSecret: string;

  /**
   * OAuth callback URL
   */
  callbackUrl: string;

  /**
   * OAuth scopes to request
   */
  scopes: string[];
}
