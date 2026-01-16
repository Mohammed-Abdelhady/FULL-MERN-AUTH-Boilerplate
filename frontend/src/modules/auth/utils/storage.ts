import type { AuthState } from '../types/auth.types';

/**
 * Storage key for auth state in localStorage
 */
const AUTH_STORAGE_KEY = 'auth_state';

/**
 * Saves authentication state to localStorage
 * Handles errors gracefully and logs warnings
 *
 * @param state - Auth state to persist
 *
 * @example
 * saveAuthState({ user: { id: '1', email: 'user@example.com', name: 'User', role: 'user' }, isAuthenticated: true, isLoading: false, error: null })
 */
export function saveAuthState(state: AuthState): void {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(AUTH_STORAGE_KEY, serializedState);
  } catch (error) {
    console.warn('Failed to save auth state to localStorage:', error);
    // Silently fail - localStorage might be disabled or full
  }
}

/**
 * Loads authentication state from localStorage
 * Returns null if no state exists or if deserialization fails
 *
 * @returns Persisted auth state or null
 *
 * @example
 * const authState = loadAuthState();
 * if (authState) {
 *   // Restore auth state
 * }
 */
export function loadAuthState(): AuthState | null {
  try {
    const serializedState = localStorage.getItem(AUTH_STORAGE_KEY);

    if (serializedState === null) {
      return null;
    }

    return JSON.parse(serializedState) as AuthState;
  } catch (error) {
    console.warn('Failed to load auth state from localStorage:', error);
    // If state is corrupted, clear it
    clearAuthState();
    return null;
  }
}

/**
 * Clears authentication state from localStorage
 * Called on logout or when state is corrupted
 *
 * @example
 * clearAuthState(); // Removes auth state from localStorage
 */
export function clearAuthState(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear auth state from localStorage:', error);
    // Silently fail - localStorage might be disabled
  }
}

/**
 * Checks if localStorage is available and working
 * Some browsers disable localStorage in private mode
 *
 * @returns True if localStorage is available, false otherwise
 *
 * @example
 * if (isLocalStorageAvailable()) {
 *   saveAuthState(state);
 * }
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
