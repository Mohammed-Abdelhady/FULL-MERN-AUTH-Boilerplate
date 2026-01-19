'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Link as LinkIcon, Unlink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUnlinkProviderMutation, useSetPrimaryProviderMutation } from '../store';
import type { OAuthProvider } from '../types/auth.types';
import { getOAuthProviderIconPath, formatProviderName } from '../utils/oauthHelpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LinkedAccountCardProps {
  provider: string;
  isPrimary: boolean;
  canUnlink: boolean;
  onLinkSuccess?: () => void;
}

/**
 * LinkedAccountCard Component
 *
 * Displays a linked OAuth provider with options to:
 * - Set as primary provider
 * - Unlink the provider (if more than one linked)
 */
export function LinkedAccountCard({
  provider,
  isPrimary,
  canUnlink,
  onLinkSuccess,
}: LinkedAccountCardProps) {
  const t = useTranslations('settings.accounts');
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);

  const [unlinkProvider, { isLoading: isUnlinking }] = useUnlinkProviderMutation();
  const [setPrimaryProvider, { isLoading: isSettingPrimary }] = useSetPrimaryProviderMutation();

  const handleUnlink = async () => {
    try {
      await unlinkProvider(provider.toUpperCase() as OAuthProvider).unwrap();
      toast.success(t('unlinkSuccess', { provider: formatProviderName(provider) }));
      onLinkSuccess?.();
      setShowUnlinkDialog(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(
        err?.data?.message || t('unlinkError', { provider: formatProviderName(provider) }),
      );
    }
  };

  const handleSetPrimary = async () => {
    try {
      await setPrimaryProvider({
        provider: provider.toUpperCase() as OAuthProvider,
      }).unwrap();
      toast.success(t('setPrimarySuccess', { provider: formatProviderName(provider) }));
      onLinkSuccess?.();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(
        err?.data?.message || t('setPrimaryError', { provider: formatProviderName(provider) }),
      );
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Provider Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d={getOAuthProviderIconPath(provider.toLowerCase())} />
                </svg>
              </div>

              {/* Provider Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{formatProviderName(provider)}</h3>
                  {isPrimary && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {t('primary')}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPrimary ? t('primaryDescription') : t('linkedDescription')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isPrimary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetPrimary}
                  disabled={isSettingPrimary || isUnlinking}
                >
                  {isSettingPrimary ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {t('setPrimary')}
                    </>
                  )}
                </Button>
              )}

              {canUnlink && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowUnlinkDialog(true)}
                  disabled={isUnlinking || isSettingPrimary}
                >
                  {isUnlinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Unlink className="mr-2 h-4 w-4" />
                      {t('unlink')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('unlinkConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('unlinkConfirmDescription', {
                provider: formatProviderName(provider),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlink}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('confirmUnlink')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
