'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGetLinkedProvidersQuery, useGetEnabledProvidersQuery } from '../store';
import { LinkedAccountCard } from './LinkedAccountCard';
import { LinkProviderButton } from './LinkProviderButton';
import type { OAuthProvider } from '../types/auth.types';

/**
 * LinkedAccounts Component
 *
 * Displays all linked OAuth providers and allows:
 * - Viewing linked accounts
 * - Linking new providers
 * - Unlinking providers
 * - Setting primary provider
 */
export function LinkedAccounts() {
  const t = useTranslations('settings.accounts');

  const {
    data: linkedProvidersData,
    isLoading: isLoadingLinked,
    refetch,
  } = useGetLinkedProvidersQuery();

  const { data: enabledProvidersData, isLoading: isLoadingEnabled } = useGetEnabledProvidersQuery();

  const linkedProviders = linkedProvidersData?.providers || [];
  const primaryProvider = linkedProvidersData?.primaryProvider;
  const enabledProviders = enabledProvidersData?.providers || [];

  // Filter out already linked providers
  const availableProviders = enabledProviders.filter(
    (provider) => !linkedProviders.includes(provider),
  );

  const canUnlink = linkedProviders.length > 1;

  if (isLoadingLinked || isLoadingEnabled) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Linked Accounts Section */}
        {linkedProviders.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t('linkedAccountsLabel')}</h3>
            <div className="space-y-3">
              {linkedProviders.map((provider) => (
                <LinkedAccountCard
                  key={provider}
                  provider={provider}
                  isPrimary={provider === primaryProvider}
                  canUnlink={canUnlink}
                  onLinkSuccess={refetch}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cannot Unlink Warning */}
        {!canUnlink && linkedProviders.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('cannotUnlinkWarning')}</AlertDescription>
          </Alert>
        )}

        {/* Available Providers Section */}
        {availableProviders.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t('availableProvidersLabel')}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {availableProviders.map((provider) => (
                <LinkProviderButton
                  key={provider}
                  provider={provider.toLowerCase() as OAuthProvider}
                  onLinkSuccess={refetch}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Providers Linked */}
        {availableProviders.length === 0 && linkedProviders.length > 0 && (
          <Alert>
            <AlertDescription>{t('allProvidersLinked')}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
