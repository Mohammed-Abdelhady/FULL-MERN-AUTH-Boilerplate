import { baseApi } from '@/store/api/baseApi';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ActivateRequest,
  ActivateResponse,
} from '../types/auth.types';

/**
 * Auth API slice with authentication endpoints
 * Extends the base API with auth-specific operations
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Login mutation
     * Authenticates user with email and password
     */
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    /**
     * Logout mutation
     * Clears user session and auth cookies
     */
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    /**
     * Refresh token mutation
     * Refreshes the auth token using refresh cookie
     */
    refreshToken: builder.mutation<{ token: string }, void>({
      query: () => ({
        url: '/api/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Get current user query
     * Fetches the currently authenticated user's data
     */
    getCurrentUser: builder.query<User, void>({
      query: () => '/api/auth/me',
      providesTags: ['User'],
    }),

    /**
     * Register mutation
     * Creates new user account and sends activation email
     */
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (data) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    /**
     * Activate mutation
     * Verifies email with activation code and logs user in
     */
    activate: builder.mutation<ActivateResponse, ActivateRequest>({
      query: (data) => ({
        url: '/api/auth/activate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useRegisterMutation,
  useActivateMutation,
} = authApi;
