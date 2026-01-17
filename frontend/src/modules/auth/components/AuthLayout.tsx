'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

interface AuthLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * AuthLayout component for authentication pages
 * Split layout design matching original - form on left, illustration on right
 *
 * @example
 * <AuthLayout>
 *   <LoginForm />
 * </AuthLayout>
 */
export function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'ar' : 'en';

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <Link
          href={`/${otherLocale}`}
          className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {otherLocale.toUpperCase()}
        </Link>
      </div>

      <div className="max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        {/* Left Side - Form Content */}
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">{children}</div>

        {/* Right Side - Illustration */}
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/login.svg)' }}
          ></div>
        </div>
      </div>
    </div>
  );
}
