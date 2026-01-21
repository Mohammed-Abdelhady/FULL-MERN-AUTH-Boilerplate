'use client';

import { useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useDeleteSessionMutation } from '../api/sessionsApi';
import { DeviceIcon } from './DeviceIcon';
import { parseUserAgent, getDeviceLabel } from '@/lib/parseUserAgent';
import type { Session } from '../types/session.types';
import { useToast } from '@/hooks/use-toast';

/**
 * Format time ago from date string
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

interface SessionCardProps {
  readonly session: Session;
}

/**
 * SessionCard displays session information with device details and logout action
 */
export function SessionCard({ session }: SessionCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteSession, { isLoading }] = useDeleteSessionMutation();
  const { toast } = useToast();

  const { device, browser, os } = parseUserAgent(session.userAgent);
  const deviceLabel = getDeviceLabel(session.userAgent);

  const handleLogout = async () => {
    try {
      await deleteSession(session.id).unwrap();
      toast.success('Session terminated successfully');
      setShowConfirm(false);
    } catch {
      toast.error('Failed to terminate session. Please try again.');
    }
  };

  const lastActivity = formatTimeAgo(session.lastUsedAt || session.createdAt);

  return (
    <>
      <Card data-testid={`session-card-${session.id}`} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <DeviceIcon
                deviceType={device as 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown'}
                size="lg"
              />
              <div className="space-y-1">
                <h3
                  className="font-semibold text-base leading-none"
                  data-testid="session-device-label"
                >
                  {session.deviceName || deviceLabel}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="session-browser-os">
                  {browser} • {os}
                </p>
              </div>
            </div>

            {session.isCurrent && (
              <Badge variant="secondary" data-testid="current-session-badge">
                Current Session
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP Address</span>
              <span className="font-medium" data-testid="session-ip">
                {session.ip}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Activity</span>
              <span className="font-medium" data-testid="session-last-activity">
                {lastActivity}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Logged In</span>
              <span className="font-medium" data-testid="session-created-at">
                {formatTimeAgo(session.createdAt)}
              </span>
            </div>
          </div>

          {!session.isCurrent && (
            <Button
              variant="destructive"
              size="sm"
              className="w-full mt-2"
              onClick={() => setShowConfirm(true)}
              disabled={isLoading}
              data-testid="logout-session-button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout This Device
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent data-testid="logout-session-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Logout this device?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end the session on <strong>{deviceLabel}</strong>. The device will need to
              log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-logout-button">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoading}
              data-testid="confirm-logout-button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
