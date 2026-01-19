'use client';

import { useGetEnabledProvidersQuery } from '@/modules/auth/store/oauthApi';
import { OAuthButton } from './OAuthButton';
import { OAuthProvider } from '@/modules/auth/types/auth.types';
import { Loader2 } from 'lucide-react';

interface OAuthButtonsProps {
  mode?: 'signin' | 'link';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

/**
 * OAuthButtons Component
 * Container component that renders OAuth buttons for all enabled providers
 */
export function OAuthButtons({
  mode = 'signin',
  onSuccess,
  onError,
  disabled = false,
}: OAuthButtonsProps) {
  const { data: providersData, isLoading: isLoadingProviders } = useGetEnabledProvidersQuery();

  if (isLoadingProviders) {
    return (
      <div className="flex items-center justify-center py-4" data-testid="oauth-loading">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const enabledProviders = providersData?.providers || [];

  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <div
      className="space-y-3"
      data-testid="oauth-buttons"
      role="group"
      aria-label="OAuth authentication options"
    >
      {enabledProviders.map((provider) => (
        <OAuthButton
          key={provider}
          provider={provider as OAuthProvider}
          mode={mode}
          onSuccess={onSuccess}
          onError={onError}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
