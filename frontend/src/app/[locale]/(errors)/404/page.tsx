'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SearchX, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 404 Not Found Page (Accessible via /404 route)
 *
 * Split-screen design matching LoginForm aesthetic.
 * This is the routable version - the special not-found.tsx handles actual 404s.
 */
export default function NotFoundPage() {
  const router = useRouter();
  const t = useTranslations('errors.404');

  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-20 bg-card shadow sm:rounded-lg flex justify-center flex-1">
        {/* Left Side - Error Content */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12 flex flex-col justify-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Error Code */}
            <div className="mb-6">
              <h2 className="text-8xl font-extrabold text-primary">404</h2>
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
                  {t('goHome')}
                </Link>
              </Button>
              <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('goBack')}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="flex-1 bg-primary/10 text-center hidden lg:flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-12">
            <SearchX className="w-64 h-64 text-primary/30" strokeWidth={1} aria-hidden="true" />
            <p className="mt-8 text-xl font-semibold text-primary/60">{t('subtitle')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
