'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { FormProvider } from 'react-hook-form';
import { useFormWithValidation } from '@/hooks/useFormWithValidation';
import { FormInput, FormPassword } from '@/components/forms';
import { useLoginMutation } from '../store/authApi';
import { getErrorMessage, getRedirectPath } from '../utils/authHelpers';
import Link from 'next/link';

/**
 * Login form validation schema
 */
const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().min(1, t('errors.emailRequired')).email(t('errors.emailInvalid')),
    password: z.string().min(1, t('errors.passwordRequired')).min(6, t('errors.passwordMinLength')),
  });

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * LoginForm component with validation and API integration
 * Matches original design with icons and indigo colors, using form components
 *
 * @example
 * <LoginForm />
 */
export function LoginForm() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();

  const loginSchema = createLoginSchema(t);

  const form = useFormWithValidation({
    schema: loginSchema,
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = form;

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      }).unwrap();

      // Successful login - redirect
      const redirectPath = getRedirectPath(searchParams.get('redirect') || '/');
      router.push(redirectPath);
    } catch (err) {
      // Handle API errors
      const errorMessage = getErrorMessage(err);
      setError('root', {
        type: 'manual',
        message: errorMessage || t('errors.serverError'),
      });
    }
  };

  return (
    <div className="mt-12 flex flex-col items-center">
      {/* Title */}
      <h1 className="text-2xl xl:text-3xl font-extrabold" data-testid="login-title">
        {t('title')}
      </h1>

      <div className="w-full flex-1 mt-8 text-indigo-500">
        {/* Social Login Buttons */}
        <div className="flex flex-col items-center">
          <Link
            href="/auth/register"
            className="h-14 w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
            data-testid="signup-link"
          >
            {/* User Plus Icon */}
            <svg
              className="w-6 h-6 -ml-2 text-indigo-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span className="ml-4">{t('signUp')}</span>
          </Link>
        </div>

        {/* Divider */}
        <div className="my-12 border-b text-center">
          <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
            Or sign in with e-mail
          </div>
        </div>

        {/* Login Form */}
        <FormProvider {...form}>
          <form
            className="mx-auto max-w-xs relative"
            onSubmit={handleSubmit(onSubmit)}
            data-testid="login-form"
          >
            {/* Global Error */}
            {errors.root && (
              <div
                className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md"
                role="alert"
                data-testid="login-error"
              >
                {errors.root.message}
              </div>
            )}

            {/* Email Input */}
            <FormInput
              name="email"
              type="email"
              placeholder={t('email')}
              autoComplete="email"
              disabled={isLoading}
            />

            {/* Password Input */}
            <div className="mt-5">
              <FormPassword
                name="password"
                placeholder={t('password')}
                autoComplete="current-password"
                disabled={isLoading}
                showToggle={false}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
              data-testid="login-submit"
            >
              {/* Sign In Icon */}
              <svg className="w-6 h-6 -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span className="ml-3">{isLoading ? t('submit') + '...' : t('submit')}</span>
            </button>

            {/* Forgot Password Link */}
            <Link
              href="/auth/forgot-password"
              className="no-underline hover:underline text-indigo-500 text-md text-right absolute right-0 mt-2"
              data-testid="forgot-password-link"
            >
              {t('forgotPassword')}
            </Link>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
