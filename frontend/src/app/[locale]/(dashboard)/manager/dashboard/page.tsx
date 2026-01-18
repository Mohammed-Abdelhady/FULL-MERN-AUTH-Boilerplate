'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/providers/AuthGuard';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/modules/auth/store/authSlice';

/**
 * Manager dashboard page
 * Accessible at /[locale]/manager/dashboard
 * Protected by AuthGuard and role verification
 */
export default function ManagerDashboardPage() {
  const router = useRouter();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    // Redirect non-manager users to regular dashboard
    if (user && user.role !== 'manager') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Don't render if not manager
  if (!user || user.role !== 'manager') {
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome to the manager dashboard. This page is under construction.
          </p>
          <div className="p-6 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Manager features coming soon...</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
