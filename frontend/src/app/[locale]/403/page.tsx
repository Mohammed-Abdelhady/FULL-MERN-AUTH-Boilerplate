'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShieldAlert, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

/**
 * 403 Forbidden Error Page
 *
 * Split-screen design matching LoginForm aesthetic.
 * Left: Error message and actions | Right: Decorative illustration
 */
export default function Forbidden() {
  const t = useTranslations('errors.403');
  const tCommon = useTranslations('errors');

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-20 bg-card shadow sm:rounded-lg flex justify-center flex-1">
        {/* Left Side - Error Content */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex flex-col justify-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Error Code */}
            <div className="mb-6">
              <h2 className="text-8xl font-extrabold text-destructive">403</h2>
            </div>

            {/* Title */}
            <h1 className="text-3xl xl:text-4xl font-extrabold text-foreground mb-4">
              {t('title')}
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-8 max-w-md">{t('description')}</p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/">
                  <Home className="w-5 h-5 mr-2" />
                  {t('goDashboard')}
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  toast.info(tCommon('comingSoon'));
                }}
                className="w-full sm:w-auto"
              >
                <Mail className="w-5 h-5 mr-2" />
                {t('contactSupport')}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="flex-1 bg-destructive/10 text-center hidden lg:flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-12">
            <ShieldAlert
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
