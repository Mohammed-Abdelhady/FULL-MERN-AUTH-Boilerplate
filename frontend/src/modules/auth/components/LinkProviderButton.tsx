'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGetAuthorizationUrlQuery, useLinkProviderMutation } from '../store';
import type { OAuthProvider } from '../types/auth.types';
import {
  getOAuthProviderIconPath,
  formatProviderName,
  openOAuthPopup,
  waitForOAuthCallback,
} from '../utils/oauthHelpers';

interface LinkProviderButtonProps {
  provider: OAuthProvider;
  onLinkSuccess?: () => void;
  disabled?: boolean;
}

/**
 * LinkProviderButton Component
 *
 * Button to initiate OAuth linking flow for a provider
 * Opens OAuth popup and handles callback
 */
export function LinkProviderButton({
  provider,
  onLinkSuccess,
  disabled = false,
}: LinkProviderButtonProps) {
  const t = useTranslations('settings.accounts');
  const [isLinking, setIsLinking] = useState(false);

  const { data: authUrlData, isLoading: isFetchingUrl } = useGetAuthorizationUrlQuery(provider, {
    skip: isLinking || disabled,
  });

  const [linkProvider] = useLinkProviderMutation();

  const handleLinkClick = async () => {
    if (!authUrlData?.url) {
      toast.error(t('linkError', { provider: formatProviderName(provider) }));
      return;
    }

    try {
      setIsLinking(true);

      // Open OAuth popup
      const popup = openOAuthPopup(authUrlData.url);
      if (!popup) {
        throw new Error('Failed to open OAuth popup');
      }

      // Wait for OAuth callback
      const callbackData = await waitForOAuthCallback(popup);

      // Link the provider to current account
      await linkProvider({
        provider: callbackData.provider as OAuthProvider,
        code: callbackData.code,
        state: callbackData.state,
      }).unwrap();

      toast.success(t('linkSuccess', { provider: formatProviderName(provider) }));
      onLinkSuccess?.();
    } catch (error: unknown) {
      const err = error as Error & { data?: { message?: string } };
      if (err.message === 'OAuth authorization timed out') {
        toast.error(t('linkTimeout'));
      } else if (err.message === 'OAuth authorization was cancelled') {
        toast.info(t('linkCancelled'));
      } else {
        toast.error(
          err?.data?.message || t('linkError', { provider: formatProviderName(provider) }),
        );
      }
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLinkClick}
      disabled={disabled || isLinking || isFetchingUrl}
      className="w-full justify-start"
    >
      {isLinking || isFetchingUrl ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t('connecting', { provider: formatProviderName(provider) })}
        </>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d={getOAuthProviderIconPath(provider)} />
          </svg>
          {t('linkWith', { provider: formatProviderName(provider) })}
        </>
      )}
    </Button>
  );
}
