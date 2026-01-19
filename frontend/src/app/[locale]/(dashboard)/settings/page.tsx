import { LinkedAccounts } from '@/modules/auth/components/LinkedAccounts';
import { ProfileSyncStatus } from '@/modules/auth/components/ProfileSyncStatus';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - Account Management',
  description: 'Manage your linked OAuth accounts and profile synchronization',
};

/**
 * Settings Page
 *
 * Allows users to manage their linked OAuth providers and profile sync
 */
export default function SettingsPage() {
  return (
    <div className="container max-w-4xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <LinkedAccounts />
          </div>
          <div className="space-y-6">
            <ProfileSyncStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
