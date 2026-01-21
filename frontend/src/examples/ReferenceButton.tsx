'use client';

/**
 * ReferenceButton.tsx - Co-located Button with Dialog Pattern
 *
 * This reference implementation demonstrates:
 * 1. Self-contained component that manages its own dialog state
 * 2. Lazy loading of dialog for code splitting
 * 3. Optional callbacks for parent communication
 * 4. Proper TypeScript typing
 *
 * @example
 * // Basic usage
 * <ReferenceButton onSuccess={() => console.log('Success!')} />
 *
 * // No callbacks needed - component is self-contained
 * <ReferenceButton />
 */

import { useState, lazy, Suspense, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReferenceButtonProps {
  /**
   * Optional callback when action completes successfully.
   * Parent can use this to refresh data or show notifications.
   */
  onSuccess?: () => void;

  /**
   * Optional callback when dialog is cancelled.
   */
  onCancel?: () => void;

  /**
   * Custom button text
   * @default "Create Item"
   */
  buttonText?: string;

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ReferenceButton - A self-contained button that manages its own dialog.
 *
 * **Key Pattern**: Dialog state is managed internally, not by parent.
 * This eliminates props drilling and makes the component portable.
 *
 * **Architecture Benefits**:
 * - Single import for full functionality
 * - Parent doesn't need useState for dialog
 * - Easy to test as a unit
 * - Can be moved anywhere without breaking
 */
export function ReferenceButton({
  onSuccess,
  onCancel,
  buttonText = 'Create Item',
  disabled = false,
}: ReferenceButtonProps) {
  // ---------------------------------------------------------------------------
  // Internal State - Dialog manages its own open state
  // ---------------------------------------------------------------------------
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handle dialog close.
   * Resets form state and optionally calls onCancel.
   */
  const handleClose = useCallback(() => {
    setOpen(false);
    setName('');
    onCancel?.();
  }, [onCancel]);

  /**
   * Handle form submission.
   * Shows how to handle async operations with loading states.
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        toast.error('Name is required');
        return;
      }

      setIsSubmitting(true);

      try {
        // Simulate async operation (replace with actual mutation)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.success(`Created "${name}" successfully`);
        setOpen(false);
        setName('');
        onSuccess?.();
      } catch (error) {
        toast.error('Failed to create item');
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, onSuccess],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setOpen(true)}
        disabled={disabled}
        data-testid="reference-button-trigger"
      >
        <Plus className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>

      {/* Co-located Dialog - State managed internally */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Item</DialogTitle>
              <DialogDescription>
                This demonstrates the co-located dialog pattern where the button manages its own
                dialog state.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name"
                  disabled={isSubmitting}
                  data-testid="reference-input-name"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="reference-submit-button">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Alternative: With Lazy-Loaded Dialog (for heavy dialogs)
// ---------------------------------------------------------------------------

/**
 * For complex dialogs, lazy load the dialog content to reduce initial bundle size.
 * This is the recommended pattern for production.
 *
 * @example
 * const HeavyDialog = lazy(() => import('./HeavyDialog').then(m => ({ default: m.HeavyDialog })));
 *
 * function LazyButton() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <Button onClick={() => setOpen(true)}>Open</Button>
 *       {open && (
 *         <Suspense fallback={<div />}>
 *           <HeavyDialog open={open} onOpenChange={setOpen} />
 *         </Suspense>
 *       )}
 *     </>
 *   );
 * }
 */

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export default ReferenceButton;
