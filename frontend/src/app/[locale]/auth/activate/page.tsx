import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ActivationPage } from '@/modules/auth/pages/ActivationPage';

/**
 * Generate metadata for activation page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.activate' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

/**
 * Email activation route page
 * Accessible at /[locale]/auth/activate
 */
export default function ActivateRoute() {
  return <ActivationPage />;
}
