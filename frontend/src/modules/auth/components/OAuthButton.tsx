'use client';

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
 * Displays an icon-only button for OAuth authentication with a specific provider
 */
export function OAuthButton({ provider, onSuccess, onError, disabled = false }: OAuthButtonProps) {
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

  const { bgColor, hoverColor, textColor, borderColor } = getProviderStyles(provider);
  const providerName = formatProviderName(provider);

  return (
    <button
      type="button"
      onClick={handleOAuthClick}
      disabled={disabled || isLoading || isFetchingUrl}
      className={`
        group relative inline-flex h-14 w-14 items-center justify-center rounded-full
        transition-all duration-200 ease-in-out
        ${bgColor} ${textColor} ${borderColor}
        ${!disabled && !isLoading && !isFetchingUrl ? hoverColor : ''}
        ${disabled || isLoading || isFetchingUrl ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:pointer-events-none
      `}
      aria-label={t('signInWith', { provider: providerName })}
      title={t('signInWith', { provider: providerName })}
      data-testid={`oauth-${provider}-button`}
    >
      {isLoading || isFetchingUrl ? (
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      ) : (
        <svg
          className="h-6 w-6 transition-transform duration-200 group-hover:scale-110"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={getOAuthProviderIconPath(provider)} />
        </svg>
      )}

      {/* Tooltip on hover */}
      <span
        className="
        absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap
        rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white
        opacity-0 transition-opacity duration-200
        group-hover:opacity-100
        pointer-events-none z-50
        shadow-lg
      "
      >
        {providerName}
        {/* Tooltip arrow */}
        <span
          className="
          absolute -bottom-1 left-1/2 -translate-x-1/2
          h-2 w-2 rotate-45 bg-gray-900
        "
        />
      </span>
    </button>
  );
}

/**
 * Returns the appropriate style classes for a provider
 */
function getProviderStyles(provider: OAuthProvider): {
  bgColor: string;
  hoverColor: string;
  textColor: string;
  borderColor: string;
} {
  const styleMap: Record<
    OAuthProvider,
    { bgColor: string; hoverColor: string; textColor: string; borderColor: string }
  > = {
    google: {
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-gray-50 hover:shadow-md',
      textColor: 'text-gray-900',
      borderColor: 'border-2 border-gray-300',
    },
    github: {
      bgColor: 'bg-gray-900',
      hoverColor: 'hover:bg-gray-800 hover:shadow-lg',
      textColor: 'text-white',
      borderColor: 'border-2 border-gray-900',
    },
    facebook: {
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700 hover:shadow-lg',
      textColor: 'text-white',
      borderColor: 'border-2 border-blue-600',
    },
  };

  return (
    styleMap[provider] || {
      bgColor: 'bg-gray-100',
      hoverColor: 'hover:bg-gray-200',
      textColor: 'text-gray-900',
      borderColor: 'border-2 border-gray-300',
    }
  );
}
