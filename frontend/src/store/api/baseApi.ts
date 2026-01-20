import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Base query configuration for RTK Query
 * Uses httpOnly cookies for authentication (credentials: 'include')
 */
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  credentials: 'include', // Send httpOnly cookies automatically
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    // Session managed via httpOnly cookies sent automatically
    return headers;
  },
});

/**
 * Base query with automatic session refresh on 401 errors
 * Uses cookie-based session refresh
 * Skips refresh for validation endpoints to prevent unnecessary calls
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  // If request fails with 401, attempt session refresh
  if (result.error?.status === 401) {
    // Skip auto-refresh for validation endpoints (getCurrentUser)
    // These endpoints expect 401 when user is not authenticated
    const url = typeof args === 'string' ? args : args.url;
    const skipRefresh = url.includes('/api/user/profile');

    if (skipRefresh) {
      // Don't attempt refresh for validation endpoints
      return result;
    }

    // Try to refresh the session (cookie-based)
    const refreshResult = await baseQuery('/api/auth/refresh', api, extraOptions);

    if (refreshResult.data) {
      // Refresh successful, retry the original request
      // New session cookie automatically set by backend
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, user needs to login again
      // Trigger logout to clear client state
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

/**
 * Base API configuration for RTK Query
 * All API slices should extend from this
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Auth', 'LinkedProviders', 'ProfileSync', 'Roles', 'Permissions'],
  endpoints: () => ({}),
});
