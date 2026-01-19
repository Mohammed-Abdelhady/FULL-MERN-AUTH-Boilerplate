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
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { baseApi } from './api/baseApi';
import authReducer from '@/modules/auth/store/authSlice';
import toastReducer from './slices/toastSlice';
import { errorInterceptor } from './middleware/errorInterceptor';

/**
 * Create a noop storage for server-side rendering
 * Prevents redux-persist from trying to access localStorage during SSR
 */
const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

/**
 * Use browser localStorage only when running in the browser
 * Falls back to noop storage during SSR
 */
const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

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
