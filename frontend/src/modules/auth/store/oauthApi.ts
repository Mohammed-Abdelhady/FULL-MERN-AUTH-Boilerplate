import { baseApi } from '@/store/api/baseApi';
import type {
  OAuthProvider,
  OAuthAuthUrlResponse,
  OAuthCallbackRequest,
  OAuthCallbackResponse,
  OAuthProvidersResponse,
} from '../types/auth.types';

/**
 * OAuth API slice with OAuth authentication endpoints
 * Extends the base API with OAuth-specific operations
 */
export const oauthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get authorization URL for OAuth provider
     * Returns the URL to redirect user to for OAuth authorization
     */
    getAuthorizationUrl: builder.query<OAuthAuthUrlResponse, OAuthProvider>({
      query: (provider) => ({
        url: `/api/auth/oauth/authorize?provider=${provider}`,
        method: 'GET',
      }),
      transformResponse: (response: {
        success: boolean;
        data: OAuthAuthUrlResponse;
        message: string;
      }) => response.data,
    }),

    /**
     * Handle OAuth callback
     * Processes the OAuth callback from the provider after user authentication
     * Exchanges the authorization code for access tokens and creates/updates user account
     */
    handleCallback: builder.mutation<OAuthCallbackResponse, OAuthCallbackRequest>({
      query: (data) => ({
        url: '/api/auth/oauth/callback',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        data: OAuthCallbackResponse;
        message: string;
      }) => response.data,
      invalidatesTags: ['Auth', 'User', 'LinkedProviders', 'ProfileSync'],
    }),

    /**
     * Get list of enabled OAuth providers
     * Returns a list of configured OAuth providers for authentication
     */
    getEnabledProviders: builder.query<OAuthProvidersResponse, void>({
      query: () => ({
        url: '/api/auth/oauth/providers',
        method: 'GET',
      }),
      transformResponse: (response: {
        success: boolean;
        data: OAuthProvidersResponse;
        message: string;
      }) => response.data,
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAuthorizationUrlQuery,
  useHandleCallbackMutation,
  useGetEnabledProvidersQuery,
} = oauthApi;
