'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/lib/toast';
import { RefreshCw, Info } from 'lucide-react';
import { useGetSyncStatusQuery, useInitiateProfileSyncMutation } from '../store/profileSyncApi';
import { openOAuthPopup, waitForOAuthCallback } from '../utils/oauthHelpers';
import { useHandleCallbackMutation, oauthApi } from '../store/oauthApi';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useAppDispatch } from '@/store/hooks';

/**
 * Profile Sync Status Component
 * Displays profile synchronization status and provides manual sync button
 */
export function ProfileSyncStatus() {
  const t = useTranslations('settings.profileSync');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: syncStatus, isLoading } = useGetSyncStatusQuery();
  const [initiateSync, { isLoading: isSyncInitiating }] = useInitiateProfileSyncMutation();
  const [handleOAuthCallback] = useHandleCallbackMutation();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      // Initiate sync - returns instructions to re-auth with OAuth
      const response = await initiateSync().unwrap();

      if (!response.requiresOAuth) {
        toast.error(t('syncError'), {
          description: response.message,
        });
        setIsSyncing(false);
        return;
      }

      // Open OAuth flow for the primary provider
      const provider = response.provider.toLowerCase() as 'google' | 'facebook' | 'github';

      // Get authorization URL using RTK Query
      const authUrlResult = await dispatch(
        oauthApi.endpoints.getAuthorizationUrl.initiate(provider),
      ).unwrap();

      if (!authUrlResult?.url) {
        throw new Error('Failed to get authorization URL');
      }

      // Open OAuth popup
      const popup = openOAuthPopup(authUrlResult.url);
      if (!popup) {
        throw new Error('Failed to open OAuth popup');
      }

      // Wait for callback
      const { code, state } = await waitForOAuthCallback(popup);

      // Handle OAuth callback
      await handleOAuthCallback({
        provider,
        code,
        state: state || '',
      }).unwrap();

      toast.success(t('syncSuccess'), {
        description: t('syncSuccessDescription'),
      });

      // Refresh the page to show updated profile
      router.refresh();
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast.error(t('syncError'), {
        description: error instanceof Error ? error.message : t('syncErrorDescription'),
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{t('loading')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!syncStatus) {
    return null;
  }

  const { lastSyncedAt, lastSyncedProvider, primaryProvider, canSync } = syncStatus;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('lastSynced')}</span>
            <span className="font-medium">
              {lastSyncedAt
                ? formatDistanceToNow(new Date(lastSyncedAt), {
                    addSuffix: true,
                  })
                : t('never')}
            </span>
          </div>

          {lastSyncedProvider && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('syncedFrom')}</span>
              <span className="font-medium capitalize">{lastSyncedProvider}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('primaryProvider')}</span>
            <span className="font-medium capitalize">{primaryProvider || t('none')}</span>
          </div>
        </div>

        {/* Info message if can't sync */}
        {!canSync && (
          <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
            <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('cannotSyncInfo')}</p>
          </div>
        )}

        {/* Manual Sync Button */}
        <Button
          onClick={handleManualSync}
          disabled={!canSync || isSyncInitiating || isSyncing}
          className="w-full whitespace-normal"
        >
          {isSyncInitiating || isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
              <span>{t('syncing')}</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 shrink-0" />
              <span>{t('syncNow')}</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
