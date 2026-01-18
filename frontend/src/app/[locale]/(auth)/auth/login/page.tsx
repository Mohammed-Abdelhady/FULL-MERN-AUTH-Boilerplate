import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LoginPage } from '@/modules/auth/pages/LoginPage';

/**
 * Generate metadata for login page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.login' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

/**
 * Login route page
 * Accessible at /[locale]/auth/login
 */
export default function LoginRoute() {
  return <LoginPage />;
}
