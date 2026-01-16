import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

/**
 * Base query configuration for RTK Query
 * Includes credentials for cookie-based auth
 */
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  credentials: 'include', // Send cookies with requests
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * Base query with automatic token refresh on 401 errors
 * Intercepts failed requests and attempts to refresh auth token
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await baseQuery(args, api, extraOptions);

  // If request fails with 401, attempt token refresh
  if (result.error?.status === 401) {
    // Try to refresh the token
    const refreshResult = await baseQuery('/api/auth/refresh', api, extraOptions);

    if (refreshResult.data) {
      // Refresh successful, retry the original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, user needs to login again
      // The authSlice will handle logout via matcher
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
  tagTypes: ['User', 'Auth'],
  endpoints: () => ({}),
});
