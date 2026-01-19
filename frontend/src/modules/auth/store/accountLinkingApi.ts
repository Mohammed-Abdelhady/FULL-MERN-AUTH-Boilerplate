import { baseApi } from '@/store/api/baseApi';
import type { OAuthProvider } from '../types/auth.types';
import type { User } from '../types/auth.types';

/**
 * Response type for linked providers endpoint
 */
export interface LinkedProvidersResponse {
  providers: string[];
  primaryProvider?: string;
}

/**
 * Request type for linking a provider
 */
export interface LinkProviderRequest {
  provider: OAuthProvider;
  code: string;
  state?: string;
}

/**
 * Request type for setting primary provider
 */
export interface SetPrimaryProviderRequest {
  provider: OAuthProvider;
}

/**
 * Account Linking API slice
 * Manages linking/unlinking OAuth providers to user accounts
 */
export const accountLinkingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all linked providers for current user
     */
    getLinkedProviders: builder.query<LinkedProvidersResponse, void>({
      query: () => ({
        url: '/api/user/linked-providers',
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; data: LinkedProvidersResponse }) =>
        response.data,
      providesTags: ['LinkedProviders'],
    }),

    /**
     * Link a new OAuth provider to current account
     */
    linkProvider: builder.mutation<User, LinkProviderRequest>({
      query: (data) => ({
        url: '/api/user/link-provider',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: User }) => response.data,
      invalidatesTags: ['Auth', 'User', 'LinkedProviders'],
    }),

    /**
     * Unlink an OAuth provider from current account
     */
    unlinkProvider: builder.mutation<User, OAuthProvider>({
      query: (provider) => ({
        url: `/api/user/unlink-provider/${provider}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean; data: User }) => response.data,
      invalidatesTags: ['Auth', 'User', 'LinkedProviders'],
    }),

    /**
     * Set primary provider for profile synchronization
     */
    setPrimaryProvider: builder.mutation<User, SetPrimaryProviderRequest>({
      query: (data) => ({
        url: '/api/user/set-primary-provider',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: User }) => response.data,
      invalidatesTags: ['Auth', 'User', 'LinkedProviders'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetLinkedProvidersQuery,
  useLinkProviderMutation,
  useUnlinkProviderMutation,
  useSetPrimaryProviderMutation,
} = accountLinkingApi;
