'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  useGetAuthorizationUrlQuery,
  useHandleCallbackMutation,
} from '@/modules/auth/store/oauthApi';
import { OAuthProvider } from '@/modules/auth/types/auth.types';
import {
  formatProviderName,
  getOAuthProviderIconPath,
  openOAuthPopup,
  waitForOAuthCallback,
} from '@/modules/auth/utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface OAuthButtonProps {
  provider: OAuthProvider;
  mode?: 'signin' | 'link';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

/**
 * OAuthButton Component
 * Displays a button for OAuth authentication with a specific provider
 */
export function OAuthButton({
  provider,
  mode = 'signin',
  onSuccess,
  onError,
  disabled = false,
}: OAuthButtonProps) {
  const t = useTranslations('auth.oauth');
  const tCallback = useTranslations('auth.oauth.callback');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch authorization URL for the provider
  const { data: authUrlData, isLoading: isFetchingUrl } = useGetAuthorizationUrlQuery(provider, {
    skip: isLoading || disabled,
  });

  const [handleOAuthCallback] = useHandleCallbackMutation();

  const handleOAuthClick = async () => {
    if (!authUrlData?.url) {
      toast.error(t('error', { provider: formatProviderName(provider) }));
      onError?.(t('error', { provider: formatProviderName(provider) }));
      return;
    }

    try {
      setIsLoading(true);

      // Open OAuth popup
      const popup = openOAuthPopup(authUrlData.url);

      if (!popup) {
        throw new Error('Failed to open OAuth popup');
      }

      // Wait for callback from popup
      const callbackData = await waitForOAuthCallback(popup);

      if (!callbackData || !callbackData.code) {
        throw new Error('Invalid OAuth callback data');
      }

      // Call the backend callback endpoint directly
      await handleOAuthCallback({
        provider: callbackData.provider,
        code: callbackData.code,
        state: callbackData.state,
      }).unwrap();

      // Show success message
      toast.success(tCallback('success'));

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OAuth authentication failed';
      toast.error(t('error', { provider: formatProviderName(provider) }));
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const providerColor = getProviderColor(provider);

  return (
    <Button
      type="button"
      variant="default"
      className={`w-full ${providerColor}`}
      onClick={handleOAuthClick}
      disabled={disabled || isLoading || isFetchingUrl}
      data-testid={`oauth-${provider}-button`}
    >
      {isLoading || isFetchingUrl ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('connecting', { provider: formatProviderName(provider) })}
        </>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={getOAuthProviderIconPath(provider)} />
          </svg>
          {t('signInWith', { provider: formatProviderName(provider) })}
        </>
      )}
    </Button>
  );
}

/**
 * Returns the appropriate color class for a provider
 */
function getProviderColor(provider: OAuthProvider): string {
  const colorMap: Record<OAuthProvider, string> = {
    google: 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300',
    github: 'bg-gray-900 text-white hover:bg-gray-800',
    facebook: 'bg-blue-600 text-white hover:bg-blue-700',
  };

  return colorMap[provider] || 'bg-gray-100 text-gray-900 hover:bg-gray-200';
}
