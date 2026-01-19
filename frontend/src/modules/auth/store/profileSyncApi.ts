import { baseApi } from '@/store/api/baseApi';
import type { AuthProvider } from '../types/auth.types';

/**
 * Profile Sync Status Response
 */
export interface ProfileSyncStatus {
  lastSyncedAt?: string;
  lastSyncedProvider?: string;
  primaryProvider?: AuthProvider;
  canSync: boolean;
}

/**
 * Manual Sync Response
 */
export interface ManualSyncResponse {
  requiresOAuth: boolean;
  provider: AuthProvider;
  message: string;
}

/**
 * Profile Sync API
 * RTK Query endpoints for profile synchronization
 */
export const profileSyncApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get profile sync status
     */
    getSyncStatus: builder.query<ProfileSyncStatus, void>({
      query: () => '/user/sync-status',
      transformResponse: (response: { data: ProfileSyncStatus }) => response.data,
      providesTags: ['ProfileSync'],
    }),

    /**
     * Initiate manual profile sync
     * Returns instructions to re-authenticate with OAuth
     */
    initiateProfileSync: builder.mutation<ManualSyncResponse, void>({
      query: () => ({
        url: '/user/sync-profile',
        method: 'POST',
      }),
      transformResponse: (response: { data: ManualSyncResponse }) =>
        response.data,
      invalidatesTags: ['ProfileSync', 'User'],
    }),
  }),
});

export const { useGetSyncStatusQuery, useInitiateProfileSyncMutation } =
  profileSyncApi;
