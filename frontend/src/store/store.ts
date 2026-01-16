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

/**
 * Redux persist configuration
 * Persists only the auth slice to localStorage
 */
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist auth slice
};

/**
 * Root reducer combining all slices
 */
const rootReducer = combineReducers({
  // RTK Query API reducer
  [baseApi.reducerPath]: baseApi.reducer,
  // Auth slice reducer
  auth: authReducer,
});

/**
 * Persisted reducer with redux-persist
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux store configuration with RTK Query integration and redux-persist
 * Includes Redux DevTools support and middleware configuration
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
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
