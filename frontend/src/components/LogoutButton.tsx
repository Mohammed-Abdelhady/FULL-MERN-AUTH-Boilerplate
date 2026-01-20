'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogoutMutation } from '@/modules/auth/store/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction, selectIsAuthenticated } from '@/modules/auth/store/authSlice';
import { toast } from '@/lib/toast';

/**
 * LogoutButton component for navigation
 * Displays logout button when user is authenticated
 * Handles logout with API call and state cleanup
 */
export function LogoutButton() {
  const t = useTranslations('auth.activate');
  const tToast = useTranslations('toast');
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = useCallback(async () => {
    try {
      await logout().unwrap();
      dispatch(logoutAction());
      toast.success(tToast('success.logoutSuccess'));
      // Force full page refresh to clear all cached data
      window.location.href = '/auth/login';
    } catch {
      // Clear state anyway even if API fails
      dispatch(logoutAction());
      toast.warning(tToast('warning.logoutError'));
      // Force full page refresh to clear all cached data
      window.location.href = '/auth/login';
    }
  }, [logout, dispatch, tToast]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-2"
      data-testid="logout-button"
      aria-label={t('logout')}
      aria-busy={isLoggingOut}
    >
      <LogOut className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:inline">{isLoggingOut ? t('loggingOut') : t('logout')}</span>
    </Button>
  );
}
