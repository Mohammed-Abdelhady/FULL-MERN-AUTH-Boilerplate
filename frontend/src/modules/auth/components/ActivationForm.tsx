'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { FormProvider } from 'react-hook-form';
import { useFormWithValidation } from '@/hooks/useFormWithValidation';
import { FormInput } from '@/components/forms';
import { useActivateMutation } from '../store/authApi';
import { zodEmail } from '@/lib/validations';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { toast } from '@/lib/toast';
import { useAppDispatch } from '@/store/hooks';
import { setUser, setToken } from '@/store/slices/authSlice';
import { WelcomeModal } from '@/components/welcome/WelcomeModal';

/**
 * Activation form validation schema
 */
const createActivationSchema = (t: (key: string) => string) =>
  z.object({
    email: zodEmail({
      required: true,
      messages: {
        required: t('errors.emailRequired'),
        invalid: t('errors.emailInvalid'),
      },
    }),
    code: z
      .string({ required_error: t('errors.codeRequired') })
      .trim()
      .length(6, t('errors.codeLength'))
      .regex(/^\d{6}$/, t('errors.codeInvalid')),
  });

type ActivationFormData = z.infer<ReturnType<typeof createActivationSchema>>;

/**
 * ActivationForm component for email verification
 * Auto-fills email from URL parameters and handles 6-digit code input
 *
 * @example
 * <ActivationForm />
 */
export function ActivationForm() {
  const t = useTranslations('auth.activate');
  const tToast = useTranslations('toast');
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [activate, { isLoading }] = useActivateMutation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');

  // Get email from URL params
  const emailFromUrl = searchParams.get('email') || '';

  // Memoize schema creation when translation function changes
  const activationSchema = useMemo(() => createActivationSchema(t), [t]);

  // Initialize form with validation and default email value
  const form = useFormWithValidation({
    schema: activationSchema,
    mode: 'onBlur',
    defaultValues: {
      email: emailFromUrl,
      code: '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = form;

  // Redirect to register if no email in URL
  useEffect(() => {
    if (!emailFromUrl) {
      router.push('/auth/register');
    } else {
      setValue('email', emailFromUrl);
    }
  }, [emailFromUrl, router, setValue]);

  // Memoize submit handler to prevent recreating on every render
  const onSubmit = useCallback(
    async (data: ActivationFormData) => {
      try {
        const result = await activate({
          email: data.email,
          code: data.code,
        }).unwrap();

        // Successful activation - auto-login user
        dispatch(setToken(result.token));
        dispatch(setUser(result.user));

        toast.success(tToast('success.activationSuccess'));

        // Show welcome modal with user name
        setUserName(result.user.name);
        setShowWelcome(true);
      } catch (err: unknown) {
        // Handle API errors
        const error = err as { data?: { message?: string; code?: string } };
        let errorMessage = t('errors.serverError');

        if (error.data?.code === 'INVALID_CODE' || error.data?.message?.includes('Invalid')) {
          errorMessage = t('errors.codeInvalid');
        } else if (
          error.data?.code === 'CODE_EXPIRED' ||
          error.data?.message?.includes('expired')
        ) {
          errorMessage = t('errors.codeExpired');
          // Redirect to register after short delay
          setTimeout(() => router.push('/auth/register'), 2000);
        } else if (error.data?.message) {
          errorMessage = error.data.message;
        }

        setError('root', {
          type: 'manual',
          message: errorMessage,
        });
        toast.error(errorMessage);

        // Clear code field for retry
        setValue('code', '');
      }
    },
    [activate, dispatch, router, setError, setValue, t, tToast],
  );

  // Handle code input to only allow numeric characters
  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
      setValue('code', value);
    },
    [setValue],
  );

  return (
    <section className="mt-12 flex flex-col items-center" aria-labelledby="activate-heading">
      {/* Title */}
      <h1
        id="activate-heading"
        className="text-2xl xl:text-3xl font-extrabold text-foreground"
        data-testid="activate-title"
      >
        {t('title')}
      </h1>

      {/* Description */}
      <p className="text-base text-muted-foreground mt-4 text-center max-w-md">
        {t('description')}
      </p>

      <div className="w-full flex-1 mt-8">
        {/* Activation Form */}
        <FormProvider {...form}>
          <form
            className="mx-auto max-w-xs"
            onSubmit={handleSubmit(onSubmit)}
            data-testid="activate-form"
            noValidate
            aria-labelledby="activate-heading"
            aria-describedby={errors.root?.message ? 'activate-error' : undefined}
          >
            {/* Global Error Alert - Live Region */}
            {errors.root?.message && (
              <div
                id="activate-error"
                className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                data-testid="activate-error"
              >
                {errors.root.message}
              </div>
            )}

            {/* Email Input (readonly, pre-filled) */}
            <FormInput
              name="email"
              type="email"
              placeholder={t('email')}
              autoComplete="email"
              disabled={isLoading}
              readOnly
              className="bg-muted"
              aria-label={t('email')}
              aria-required="true"
              aria-readonly="true"
            />

            {/* Code Input */}
            <FormInput
              name="code"
              type="text"
              inputMode="numeric"
              placeholder={t('code')}
              autoComplete="one-time-code"
              disabled={isLoading}
              maxLength={6}
              className="mt-5 text-center text-2xl tracking-widest"
              autoFocus
              onChange={handleCodeChange}
              aria-label={t('code')}
              aria-required="true"
              aria-invalid={!!errors.code}
              aria-describedby={errors.code ? 'code-error' : undefined}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-14 mt-5 tracking-wide font-semibold w-full py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center"
              data-testid="activate-submit"
              aria-label={isLoading ? `${t('submit')}...` : t('submit')}
              aria-busy={isLoading}
            >
              <ShieldCheck className="w-6 h-6 -ms-2" aria-hidden="true" />
              <span className="ms-3">{isLoading ? `${t('submit')}...` : t('submit')}</span>
            </Button>

            {/* Resend Code Text (Future Enhancement) */}
            <p className="text-sm text-muted-foreground text-center mt-6">{t('didntReceive')}</p>
          </form>
        </FormProvider>
      </div>

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        userName={userName}
        onClose={() => setShowWelcome(false)}
      />
    </section>
  );
}
