'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRevokeAllOtherSessionsMutation } from '../api/sessionsApi';
import { useToast } from '@/hooks/use-toast';

export interface RevokeAllSessionsButtonProps {
  /** Number of other sessions that will be revoked */
  otherSessionsCount: number;
  /** Optional callback when sessions are revoked successfully */
  onSuccess?: (revokedCount: number) => void;
  /** Additional className for the button */
  className?: string;
}

/**
 * RevokeAllSessionsButton - Button with co-located confirmation dialog.
 *
 * Implements the co-location pattern where the button manages its own
 * dialog state internally.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <RevokeAllSessionsButton otherSessionsCount={3} />
 *
 * // With success callback
 * <RevokeAllSessionsButton
 *   otherSessionsCount={3}
 *   onSuccess={(count) => console.log(`Revoked ${count} sessions`)}
 * />
 * ```
 */
export function RevokeAllSessionsButton({
  otherSessionsCount,
  onSuccess,
  className,
}: RevokeAllSessionsButtonProps) {
  const [open, setOpen] = useState(false);
  const [revokeAllOtherSessions, { isLoading }] = useRevokeAllOtherSessionsMutation();
  const { toast } = useToast();

  const handleRevoke = async () => {
    try {
      const result = await revokeAllOtherSessions().unwrap();
      toast.success(`${result.revokedCount} session(s) have been terminated`);
      setOpen(false);
      onSuccess?.(result.revokedCount);
    } catch {
      toast.error('Failed to logout all sessions. Please try again.');
    }
  };

  // Don't render if there are no other sessions
  if (otherSessionsCount === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isLoading}
        className={className}
        data-testid="logout-all-sessions-button"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout All Other Devices
      </Button>

      {/* Co-located confirmation dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent data-testid="revoke-all-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Logout all other devices?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end all sessions except your current one. All other devices (
              {otherSessionsCount}) will need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-logout-all">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={isLoading}
              data-testid="confirm-logout-all"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                'Logout All'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default RevokeAllSessionsButton;
