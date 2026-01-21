// Auth API exports
export {
  authApi,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useChangePasswordMutation,
  useUpdateProfileMutation,
} from './authApi';

// OAuth API exports
export {
  oauthApi,
  useGetAuthorizationUrlQuery,
  useHandleCallbackMutation,
  useGetEnabledProvidersQuery,
} from './oauthApi';

// Account Linking API exports
export {
  accountLinkingApi,
  useGetLinkedProvidersQuery,
  useLinkProviderMutation,
  useUnlinkProviderMutation,
  useSetPrimaryProviderMutation,
} from './accountLinkingApi';

// Auth slice exports
export {
  authSlice,
  loginFulfilled,
  logout,
  setLoading,
  setError,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from './authSlice';
export { default as authReducer } from './authSlice';
