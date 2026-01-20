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
    <div className="container p-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="flex gap-5 w-full">
          <div className="w-2/3">
            <LinkedAccounts />
          </div>
          <div className="w-2/3">
            <ProfileSyncStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
