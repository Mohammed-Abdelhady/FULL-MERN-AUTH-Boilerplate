'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { FormProvider } from 'react-hook-form';
import { useFormWithValidation } from '@/hooks/useFormWithValidation';
import { FormInput, FormPassword } from '@/components/forms';
import { useLoginMutation } from '../store/authApi';
import { translateAuthError, getRedirectPath } from '../utils/authHelpers';
import { zodEmail } from '@/lib/validations';
import Link from 'next/link';
import { UserPlus, LogIn } from 'lucide-react';
import { IconLinkButton } from '@/components/ui/icon-link-button';
import { Button } from '@/components/ui/button';
import { useCallback, useMemo } from 'react';

/**
 * Login form validation schema using centralized validators
 * Note: Login doesn't use zodPassword because it doesn't enforce
 * strong password rules (uppercase, lowercase, number) for existing users
 */
const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: zodEmail({
      required: true,
      messages: {
        required: t('errors.emailRequired'),
        invalid: t('errors.emailInvalid'),
      },
    }),
    password: z
      .string({ required_error: t('errors.passwordRequired') })
      .min(1, t('errors.passwordRequired'))
      .min(6, t('errors.passwordMinLength')),
  });

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

/**
 * LoginForm component with validation and API integration
 * Optimized for performance with memoization and minimal re-renders
 *
 * @example
 * <LoginForm />
 */
export function LoginForm() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, { isLoading }] = useLoginMutation();

  // Memoize schema creation when translation function changes
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

  // Initialize form with validation
  const form = useFormWithValidation({
    schema: loginSchema,
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { errors },
    setError,
  } = form;

  // Memoize submit handler to prevent recreating on every render
  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        await login({
          email: data.email,
          password: data.password,
        }).unwrap();

        // Successful login - redirect
        const redirectPath = getRedirectPath(searchParams.get('redirect') ?? '/');
        router.push(redirectPath);
      } catch (err) {
        // Handle API errors with translation
        const errorMessage = translateAuthError(err, t);
        setError('root', {
          type: 'manual',
          message: errorMessage,
        });
      }
    },
    [login, searchParams, router, setError, t],
  );

  return (
    <section className="mt-12 flex flex-col items-center" aria-labelledby="login-heading">
      {/* Title */}
      <h1
        id="login-heading"
        className="text-2xl xl:text-3xl font-extrabold text-foreground"
        data-testid="login-title"
      >
        {t('title')}
      </h1>

      <div className="w-full flex-1 mt-8">
        {/* Sign Up Link */}
        <div className="flex flex-col items-center">
          <IconLinkButton
            href="/auth/register"
            icon={UserPlus}
            variant="secondary"
            testId="signup-link"
            aria-label={t('signUp')}
          >
            {t('signUp')}
          </IconLinkButton>
        </div>

        {/* Divider */}
        <div className="my-12 border-b border-border text-center" aria-hidden="true">
          <div className="leading-none px-2 inline-block text-sm text-muted-foreground tracking-wide font-medium bg-card transform translate-y-1/2">
            {t('divider')}
          </div>
        </div>

        {/* Login Form */}
        <FormProvider {...form}>
          <form
            className="mx-auto max-w-xs relative"
            onSubmit={handleSubmit(onSubmit)}
            data-testid="login-form"
            noValidate
            aria-labelledby="login-heading"
            aria-describedby={errors.root?.message ? 'login-error' : undefined}
          >
            {/* Global Error Alert - Live Region */}
            {errors.root?.message && (
              <div
                id="login-error"
                className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
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
              aria-label={t('email')}
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />

            {/* Password Input */}
            <FormPassword
              name="password"
              placeholder={t('password')}
              autoComplete="current-password"
              disabled={isLoading}
              showToggle={false}
              className="mt-5"
              aria-label={t('password')}
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-14 mt-5 tracking-wide font-semibold w-full py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center"
              data-testid="login-submit"
              aria-label={isLoading ? `${t('submit')}...` : t('submit')}
              aria-busy={isLoading}
            >
              <LogIn className="w-6 h-6 -ms-2" aria-hidden="true" />
              <span className="ms-3">{isLoading ? `${t('submit')}...` : t('submit')}</span>
            </Button>

            {/* Forgot Password Link */}
            <Link
              href="/auth/forgot-password"
              className="no-underline hover:underline text-primary text-md text-right absolute right-0 mt-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              data-testid="forgot-password-link"
              aria-label={t('forgotPassword')}
            >
              {t('forgotPassword')}
            </Link>
          </form>
        </FormProvider>
      </div>
    </section>
  );
}
