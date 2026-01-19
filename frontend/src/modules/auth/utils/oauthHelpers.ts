import type { OAuthProvider } from '../types/auth.types';

/**
 * OAuth callback data received from popup window
 */
export interface OAuthCallbackData {
  code: string;
  state: string;
  provider: OAuthProvider;
}

/**
 * Opens a centered popup window for OAuth authorization
 * @param url - The OAuth authorization URL
 * @param width - Popup width (default: 500)
 * @param height - Popup height (default: 600)
 * @returns The popup window reference
 */
export function openOAuthPopup(
  url: string,
  width: number = 500,
  height: number = 600,
): Window | null {
  // Calculate center position
  const left = window.innerWidth / 2 - width / 2 + window.screenX;
  const top = window.innerHeight / 2 - height / 2 + window.screenY;

  // Open popup with calculated dimensions
  return window.open(
    url,
    'oauth_popup',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
  );
}

/**
 * Waits for OAuth callback data from popup window via postMessage
 * @param popup - The popup window reference
 * @param timeout - Maximum time to wait in milliseconds (default: 2 minutes)
 * @returns Promise that resolves with OAuth callback data or rejects on timeout/error
 */
export function waitForOAuthCallback(
  popup: Window | null,
  timeout: number = 2 * 60 * 1000,
): Promise<OAuthCallbackData> {
  return new Promise((resolve, reject) => {
    // Set up timeout
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('OAuth authorization timed out'));
    }, timeout);

    // Check if popup was closed by user
    const checkPopupClosed = setInterval(() => {
      if (popup && popup.closed) {
        cleanup();
        reject(new Error('OAuth authorization was cancelled'));
      }
    }, 500);

    // Handle message from popup
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security (should be your app's origin)
      if (event.origin !== window.location.origin) {
        return;
      }

      // Check if message contains OAuth callback data
      if (event.data && event.data.type === 'oauth_callback') {
        cleanup();
        resolve(event.data as OAuthCallbackData);
      }
    };

    // Cleanup function
    const cleanup = () => {
      clearTimeout(timeoutId);
      clearInterval(checkPopupClosed);
      window.removeEventListener('message', handleMessage);
    };

    // Set up event listeners
    window.addEventListener('message', handleMessage);
  });
}

/**
 * Returns the icon path for a given OAuth provider
 * @param provider - The OAuth provider name
 * @returns SVG path data string
 */
export function getOAuthProviderIconPath(provider: string): string {
  const iconPaths: Record<string, string> = {
    google:
      'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z',
    github:
      'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
    facebook:
      'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z',
  };

  return iconPaths[provider] || '';
}

/**
 * Formats provider name for display
 * @param provider - The OAuth provider name (e.g., 'github')
 * @returns Formatted provider name (e.g., 'GitHub')
 */
export function formatProviderName(provider: string): string {
  const nameMap: Record<string, string> = {
    github: 'GitHub',
    google: 'Google',
    facebook: 'Facebook',
  };

  return nameMap[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
}

/**
 * Validates OAuth callback data
 * @param data - The callback data to validate
 * @returns True if valid, false otherwise
 */
export function isValidOAuthCallbackData(data: unknown): data is OAuthCallbackData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    'state' in data &&
    'provider' in data &&
    typeof data.code === 'string' &&
    typeof data.state === 'string' &&
    typeof data.provider === 'string'
  );
}
