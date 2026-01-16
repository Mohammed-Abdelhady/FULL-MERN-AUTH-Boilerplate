'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';

interface ReduxProviderProps {
  readonly children: React.ReactNode;
}

/**
 * Redux Provider wrapper for Next.js App Router with persistence
 * Marked as 'use client' to enable Redux in client components
 * Wraps the app with Redux store provider and PersistGate for state rehydration
 *
 * @example
 * <ReduxProvider>
 *   <YourApp />
 * </ReduxProvider>
 */
export function ReduxProvider({ children }: Readonly<ReduxProviderProps>) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
