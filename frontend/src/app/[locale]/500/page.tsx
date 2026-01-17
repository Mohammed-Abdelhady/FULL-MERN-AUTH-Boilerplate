'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ServerCrash, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

/**
 * 500 Server Error Page (Accessible via /500 route)
 *
 * Split-screen design matching LoginForm aesthetic.
 * This is the routable version - the special error.tsx handles actual errors.
 */
export default function ServerErrorPage() {
  const router = useRouter();
  const t = useTranslations('errors.500');
  const tCommon = useTranslations('errors');

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-20 bg-card shadow sm:rounded-lg flex justify-center flex-1">
        {/* Left Side - Error Content */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex flex-col justify-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Error Code */}
            <div className="mb-6">
              <h2 className="text-8xl font-extrabold text-destructive">500</h2>
            </div>

            {/* Title */}
            <h1 className="text-3xl xl:text-4xl font-extrabold text-foreground mb-4">
              {t('title')}
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8 max-w-md">{t('description')}</p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button onClick={() => router.refresh()} className="w-full sm:w-auto">
                <RefreshCw className="w-5 h-5 mr-2" />
                {t('reload')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast.info(tCommon('comingSoon'));
                }}
                className="w-full sm:w-auto"
              >
                <Mail className="w-5 h-5 mr-2" />
                {t('reportIssue')}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="flex-1 bg-destructive/10 text-center hidden lg:flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-12">
            <ServerCrash
              className="w-64 h-64 text-destructive/30"
              strokeWidth={1}
              aria-hidden="true"
            />
            <p className="mt-8 text-xl font-semibold text-destructive/60">{t('subtitle')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
