import { baseApi } from '@/store/api/baseApi';
import type {
  Session,
  ListSessionsResponse,
  DeleteSessionResponse,
  RevokeAllSessionsResponse,
} from '../types/session.types';

/**
 * Sessions API slice with session management endpoints
 */
export const sessionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get all active sessions for current user
     */
    getSessions: builder.query<Session[], void>({
      query: () => '/api/user/sessions',
      transformResponse: (response: { success: boolean; data: ListSessionsResponse }) =>
        response.data.sessions,
      providesTags: ['Sessions'],
    }),

    /**
     * Delete specific session by ID
     */
    deleteSession: builder.mutation<DeleteSessionResponse, string>({
      query: (sessionId) => ({
        url: `/api/user/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: {
        success: boolean;
        data?: DeleteSessionResponse;
        message: string;
      }) => response.data || { message: response.message },
      invalidatesTags: ['Sessions'],
    }),

    /**
     * Revoke all sessions except current one
     */
    revokeAllOtherSessions: builder.mutation<RevokeAllSessionsResponse, void>({
      query: () => ({
        url: '/api/user/sessions/revoke-others',
        method: 'POST',
      }),
      transformResponse: (response: { success: boolean; data: RevokeAllSessionsResponse }) =>
        response.data,
      invalidatesTags: ['Sessions'],
    }),
  }),
});

// Export hooks
export const { useGetSessionsQuery, useDeleteSessionMutation, useRevokeAllOtherSessionsMutation } =
  sessionsApi;
