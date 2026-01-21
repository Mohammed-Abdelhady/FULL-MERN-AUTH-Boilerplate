'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormPassword } from '@/components/forms';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useChangePasswordMutation } from '../store';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/lib/validations/changePassword';

/**
 * ChangePasswordCard Component
 *
 * Allows users to change their password from the Settings page.
 * Features:
 * - Current password verification
 * - New password validation (8+ chars, uppercase, lowercase, number)
 * - Confirm password matching
 * - Form reset on success
 * - Invalidates other sessions on success
 */
export function ChangePasswordCard() {
  const t = useTranslations('settings.password');
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();

      toast.success(t('success'));
      form.reset();
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error && error.data
          ? String((error.data as { message?: string }).message)
          : 'Failed to change password';
      toast.error(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            data-testid="change-password-form"
          >
            <FormPassword<ChangePasswordFormData>
              name="currentPassword"
              label={t('currentPassword')}
              placeholder="********"
              disabled={isLoading}
              data-testid="current-password-input"
            />

            <FormPassword<ChangePasswordFormData>
              name="newPassword"
              label={t('newPassword')}
              placeholder="********"
              disabled={isLoading}
              data-testid="new-password-input"
            />

            <FormPassword<ChangePasswordFormData>
              name="confirmPassword"
              label={t('confirmPassword')}
              placeholder="********"
              disabled={isLoading}
              data-testid="confirm-password-input"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              data-testid="change-password-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('submit')}...
                </>
              ) : (
                t('submit')
              )}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
