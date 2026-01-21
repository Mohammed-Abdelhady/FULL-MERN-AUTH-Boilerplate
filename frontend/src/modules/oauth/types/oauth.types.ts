/**
 * OAuth provider type
 */
export type OAuthProvider = 'google' | 'facebook' | 'github';

/**
 * OAuth authorization URL response
 */
export interface OAuthAuthUrlResponse {
  url: string;
  provider: string;
}

/**
 * OAuth callback request payload
 */
export interface OAuthCallbackRequest {
  provider: OAuthProvider;
  code: string;
  state?: string;
}

/**
 * OAuth callback response from API
 * Uses httpOnly cookies for session management (no token in response)
 */
export interface OAuthCallbackResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
  message?: string;
}

/**
 * OAuth providers response
 */
export interface OAuthProvidersResponse {
  providers: string[];
}

/**
 * OAuth callback data received from popup window
 */
export interface OAuthCallbackData {
  code: string;
  state: string;
  provider: OAuthProvider;
}
