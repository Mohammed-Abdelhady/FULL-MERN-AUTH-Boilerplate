'use client';

import { usePathname, useRouter } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    // Extract the current path without the locale prefix
    const segments = pathname.split('/');
    segments[1] = newLocale; // Replace locale segment
    const newPath = segments.join('/');

    router.push(newPath);
    router.refresh();
  };

  const currentLocale = pathname.split('/')[1] || routing.defaultLocale;

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded ${
          currentLocale === 'en'
            ? 'bg-indigo-500 text-white'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`px-3 py-1 rounded ${
          currentLocale === 'ar'
            ? 'bg-indigo-500 text-white'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`}
        aria-label="Switch to Arabic"
      >
        العربية
      </button>
    </div>
  );
}
