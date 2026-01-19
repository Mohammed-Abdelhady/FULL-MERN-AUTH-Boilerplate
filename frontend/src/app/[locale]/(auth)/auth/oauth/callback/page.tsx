'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useHandleCallbackMutation } from '@/modules/auth/store/oauthApi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * OAuth Callback Page
 * Handles the OAuth callback from providers after user authentication
 */
export default function OAuthCallbackPage() {
  const t = useTranslations('auth.oauth.callback');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [handleCallback, { isLoading }] = useHandleCallbackMutation();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get callback data from session storage
        const callbackDataStr = sessionStorage.getItem('oauth_callback_data');

        if (!callbackDataStr) {
          throw new Error('No OAuth callback data found');
        }

        const callbackData = JSON.parse(callbackDataStr);

        // Call the backend callback endpoint
        await handleCallback({
          provider: callbackData.provider,
          code: callbackData.code,
          state: callbackData.state,
        }).unwrap();

        // Clear session storage
        sessionStorage.removeItem('oauth_callback_data');

        // Show success message
        toast.success(t('success'));

        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setIsProcessing(false);
        toast.error(t('error'));

        // Redirect to login with error after a delay
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    processCallback();
  }, [handleCallback, router, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center" data-testid="oauth-callback-page">
        {isProcessing || isLoading ? (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h1 className="mt-4 text-2xl font-semibold text-foreground">{t('title')}</h1>
            <p className="mt-2 text-muted-foreground">
              Please wait while we complete your authentication...
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <svg
                className="h-6 w-6 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0m-9 0v.01"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-destructive">{t('error')}</h1>
            <p className="mt-2 text-muted-foreground">Redirecting you back to login page...</p>
          </>
        )}
      </div>
    </div>
  );
}
