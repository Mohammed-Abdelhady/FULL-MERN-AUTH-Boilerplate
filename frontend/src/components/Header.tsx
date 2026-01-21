'use client';

import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LogoutButton } from '@/modules/auth/components/LogoutButton';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/modules/auth/store/authSlice';
import { UserCog } from 'lucide-react';
import Link from 'next/link';
import { PermissionGuard, PERMISSION_PERMISSIONS } from '@/modules/permissions';

export function Header() {
  const user = useAppSelector(selectUser);

  return (
    <header className="fixed top-0 right-0 z-50 flex items-center gap-2 p-4">
      {/* User info - only show when authenticated */}
      {user && (
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <span className="text-sm font-medium text-foreground">{user.name}</span>
          <span className="text-xs text-muted-foreground">({user.role})</span>
        </div>
      )}

      <LanguageSwitcher />
      <ThemeSwitcher />
      <LogoutButton />
    </header>
  );
}
