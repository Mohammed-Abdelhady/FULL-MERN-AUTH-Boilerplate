import { configureStore } from '@reduxjs/toolkit';

/**
 * Redux store configuration with RTK Query integration
 * Includes Redux DevTools support and middleware configuration
 */
export const store = configureStore({
  reducer: {
    // Reducers will be added here as features are implemented
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action types or paths if needed
        ignoredActions: [],
        ignoredPaths: [],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
