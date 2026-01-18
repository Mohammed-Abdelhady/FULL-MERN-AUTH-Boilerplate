'use client';

import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LogoutButton } from './LogoutButton';

export function Header() {
  return (
    <header className="fixed top-0 right-0 z-50 flex items-center gap-2 p-4">
      <LanguageSwitcher />
      <ThemeSwitcher />
      <LogoutButton />
    </header>
  );
}
