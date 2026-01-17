import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';

/**
 * Locale-specific layout that adds i18n support
 * Wraps pages with NextIntlClientProvider and adds Header/Toaster
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <Header />
      {children}
      <Toaster position="bottom-right" />
    </NextIntlClientProvider>
  );
}
