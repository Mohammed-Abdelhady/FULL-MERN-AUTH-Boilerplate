'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormInput } from '@/components/forms';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useGetCurrentUserQuery, useUpdateProfileMutation } from '../store';
import { zodName } from '@/lib/validations/string';

// Validation schema for profile update
const updateProfileSchema = z.object({
  name: zodName({ required: true, min: 2, max: 100 }),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * UpdateProfileCard Component
 *
 * Allows users to update their profile information from the Settings page.
 * Features:
 * - Pre-populated name field
 * - Email displayed as read-only
 * - Form validation (2-100 characters for name)
 * - Success toast + user data refresh on success
 */
export function UpdateProfileCard() {
  const t = useTranslations('settings.profile');
  const { data: user } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user?.name) {
      form.reset({ name: user.name });
    }
  }, [user?.name, form]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    // Check if name hasn't changed
    if (data.name === user?.name) {
      toast.info('No changes to save');
      return;
    }

    try {
      await updateProfile({ name: data.name }).unwrap();
      toast.success(t('success'));
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'data' in error && error.data
          ? String((error.data as { message?: string }).message)
          : 'Failed to update profile';
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
            data-testid="update-profile-form"
          >
            <FormInput<UpdateProfileFormData>
              name="name"
              label={t('name')}
              placeholder="John Doe"
              disabled={isLoading}
              data-testid="profile-name-input"
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('email')}</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-muted"
                data-testid="profile-email-input"
              />
              <p className="text-xs text-muted-foreground">{t('emailHint')}</p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              data-testid="update-profile-submit"
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
