'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';

interface ReduxProviderProps {
  children: React.ReactNode;
}

/**
 * Redux Provider wrapper for Next.js App Router
 * Marked as 'use client' to enable Redux in client components
 * Wraps the app with Redux store provider
 *
 * @example
 * <ReduxProvider>
 *   <YourApp />
 * </ReduxProvider>
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}
