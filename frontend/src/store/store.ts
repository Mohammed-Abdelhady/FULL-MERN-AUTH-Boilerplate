import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { baseApi } from './api/baseApi';
import authReducer from '@/modules/auth/store/authSlice';
import toastReducer from './slices/toastSlice';
import { errorInterceptor } from './middleware/errorInterceptor';

/**
 * Redux persist configuration
 * Persists only the auth slice to localStorage
 * Toast slice is explicitly excluded (ephemeral notifications only)
 */
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist auth slice, NOT toast
};

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
  // RTK Query API reducer
  [baseApi.reducerPath]: baseApi.reducer,
  // Auth slice reducer
  auth: authReducer,
  // Toast slice reducer (not persisted)
  toast: toastReducer,
});

/**
 * Persisted reducer with redux-persist
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux store configuration with RTK Query integration and redux-persist
 * Includes Redux DevTools support and middleware configuration
 */
/**
 * Redux store configuration with RTK Query integration and redux-persist
 * Middleware order: errorInterceptor → RTK Query → defaults
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(errorInterceptor) // Error interceptor MUST be before RTK Query
      .concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Persistor for redux-persist
 * Used in PersistGate to delay rendering until state is rehydrated
 */
export const persistor = persistStore(store);

// Infer RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
