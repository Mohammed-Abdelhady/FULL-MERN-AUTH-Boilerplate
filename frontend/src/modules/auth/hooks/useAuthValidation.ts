'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useGetCurrentUserQuery } from '../store/authApi';
import { logout, selectIsAuthenticated } from '../store/authSlice';

/**
 * Hook to validate authentication state on app load
 * Checks if user is authenticated and validates session with server
 * Automatically logs out user if session is invalid
 *
 * @returns Loading state while validating
 *
 * @example
 * function App() {
 *   const isValidating = useAuthValidation();
 *
 *   if (isValidating) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return <YourApp />;
 * }
 */
export function useAuthValidation() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Only call getCurrentUser if we think we're authenticated
  // This prevents unnecessary API calls on every page load
  const { isLoading, isError } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated, // Skip query if not authenticated
    refetchOnMountOrArgChange: true, // Always validate on mount
  });

  useEffect(() => {
    // If getCurrentUser query fails and we think we're authenticated,
    // our session is invalid - logout
    if (isError && isAuthenticated) {
      dispatch(logout());
    }
  }, [isError, isAuthenticated, dispatch]);

  // Return loading state
  // True while validating, false once validated or if not authenticated
  return isAuthenticated && isLoading;
}
