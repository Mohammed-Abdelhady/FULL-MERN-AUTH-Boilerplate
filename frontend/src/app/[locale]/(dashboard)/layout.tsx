'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/providers/AuthGuard';
import { DashboardNav } from '@/components/navigation/DashboardNav';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

/**
 * Dashboard layout with sidebar navigation.
 * Wraps all dashboard pages with authentication and navigation.
 * Responsive with mobile hamburger menu.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar Navigation - Hidden on mobile */}
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-background md:block">
          <div className="flex h-full flex-col">
            {/* Logo/Brand */}
            <div className="flex h-16 items-center border-b border-border px-6">
              <h1 className="text-xl font-bold text-foreground">Auth App</h1>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <DashboardNav />
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4">
              <p className="text-xs text-muted-foreground">© 2024 Auth App</p>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center border-b border-border bg-background px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            data-testid="mobile-menu-button"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="ml-4 text-xl font-bold text-foreground">Auth App</h1>
        </div>

        {/* Mobile Sidebar - Slide-out drawer */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={closeMobileMenu}
              data-testid="mobile-menu-backdrop"
            />

            {/* Sidebar Drawer */}
            <aside
              className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-background md:hidden"
              data-testid="mobile-sidebar"
            >
              <div className="flex h-full flex-col">
                {/* Header with Close Button */}
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                  <h1 className="text-xl font-bold text-foreground">Auth App</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeMobileMenu}
                    aria-label="Close menu"
                    data-testid="mobile-menu-close"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4">
                  <DashboardNav onNavigate={closeMobileMenu} />
                </div>

                {/* Footer */}
                <div className="border-t border-border p-4">
                  <p className="text-xs text-muted-foreground">© 2024 Auth App</p>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 pt-16 md:ml-64 md:pt-0">{children}</main>
      </div>
    </AuthGuard>
  );
}
