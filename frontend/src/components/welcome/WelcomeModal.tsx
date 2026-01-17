'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface WelcomeModalProps {
  isOpen: boolean;
  userName: string;
  onClose?: () => void;
}

export function WelcomeModal({ isOpen, userName, onClose }: WelcomeModalProps) {
  const t = useTranslations('welcome');
  const router = useRouter();

  const handleGetStarted = () => {
    onClose?.();
    router.push('/');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGetStarted();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
        aria-describedby="welcome-description"
      >
        <div className="flex flex-col items-center text-center py-6 space-y-6">
          <div className="relative">
            <CheckCircle2 className="w-20 h-20 text-primary" strokeWidth={1.5} aria-hidden="true" />
            <div className="absolute inset-0 w-20 h-20 bg-primary/20 rounded-full blur-xl" />
          </div>

          <div className="space-y-3">
            <DialogTitle className="text-2xl xl:text-3xl font-extrabold text-foreground">
              {t('title', { name: userName })}
            </DialogTitle>

            <p className="text-base font-semibold text-muted-foreground">{t('subtitle')}</p>

            <p id="welcome-description" className="text-sm text-muted-foreground max-w-sm">
              {t('message')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGetStarted}
            className="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg px-5 py-3 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-primary/50"
            aria-label={t('cta')}
          >
            {t('cta')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
