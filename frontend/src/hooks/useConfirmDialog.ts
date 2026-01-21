import { useState, useCallback, useRef } from 'react';

/**
 * Configuration for the confirm dialog.
 */
export interface ConfirmDialogConfig {
  /** Dialog title */
  title: string;
  /** Dialog description/body text */
  description: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether the action is destructive (affects button styling) */
  destructive?: boolean;
  /** Callback when user confirms */
  onConfirm: () => Promise<void> | void;
  /** Optional callback when user cancels */
  onCancel?: () => void;
}

/**
 * State of the confirm dialog.
 */
export interface ConfirmDialogState {
  /** Whether dialog is open */
  open: boolean;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm button text */
  confirmText: string;
  /** Cancel button text */
  cancelText: string;
  /** Whether the action is destructive */
  destructive: boolean;
  /** Whether confirmation is in progress */
  isLoading: boolean;
}

/**
 * Return type for the hook.
 */
export interface UseConfirmDialogReturn {
  /** Current dialog state */
  state: ConfirmDialogState;
  /** Open dialog with configuration */
  prompt: (config: ConfirmDialogConfig) => void;
  /** Trigger the confirm action */
  confirm: () => Promise<void>;
  /** Cancel and close dialog */
  cancel: () => void;
}

const DEFAULT_STATE: ConfirmDialogState = {
  open: false,
  title: '',
  description: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  destructive: false,
  isLoading: false,
};

/**
 * useConfirmDialog - Hook for managing confirmation dialog state and flow.
 *
 * This hook encapsulates:
 * - Dialog open/close state
 * - Loading state during async confirmation
 * - Callbacks for confirm/cancel actions
 *
 * @returns Object with dialog state and control functions
 *
 * @example
 * ```tsx
 * function DeleteButton({ userId, userName }) {
 *   const { state, prompt, confirm, cancel } = useConfirmDialog();
 *   const [deleteUser] = useDeleteUserMutation();
 *
 *   const handleDelete = () => {
 *     prompt({
 *       title: 'Delete User',
 *       description: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
 *       confirmText: 'Delete',
 *       destructive: true,
 *       onConfirm: async () => {
 *         await deleteUser(userId).unwrap();
 *         toast.success('User deleted');
 *       },
 *     });
 *   };
 *
 *   return (
 *     <>
 *       <Button variant="destructive" onClick={handleDelete}>
 *         Delete
 *       </Button>
 *
 *       <AlertDialog open={state.open} onOpenChange={(open) => !open && cancel()}>
 *         <AlertDialogContent>
 *           <AlertDialogHeader>
 *             <AlertDialogTitle>{state.title}</AlertDialogTitle>
 *             <AlertDialogDescription>{state.description}</AlertDialogDescription>
 *           </AlertDialogHeader>
 *           <AlertDialogFooter>
 *             <AlertDialogCancel disabled={state.isLoading} onClick={cancel}>
 *               {state.cancelText}
 *             </AlertDialogCancel>
 *             <AlertDialogAction
 *               onClick={confirm}
 *               disabled={state.isLoading}
 *               className={state.destructive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
 *             >
 *               {state.isLoading ? 'Loading...' : state.confirmText}
 *             </AlertDialogAction>
 *           </AlertDialogFooter>
 *         </AlertDialogContent>
 *       </AlertDialog>
 *     </>
 *   );
 * }
 * ```
 */
export function useConfirmDialog(): UseConfirmDialogReturn {
  const [state, setState] = useState<ConfirmDialogState>(DEFAULT_STATE);

  // Store callbacks in refs to avoid re-renders when they change
  const onConfirmRef = useRef<(() => Promise<void> | void) | null>(null);
  const onCancelRef = useRef<(() => void) | null>(null);

  /**
   * Open the dialog with configuration.
   */
  const prompt = useCallback((config: ConfirmDialogConfig) => {
    onConfirmRef.current = config.onConfirm;
    onCancelRef.current = config.onCancel || null;

    setState({
      open: true,
      title: config.title,
      description: config.description,
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      destructive: config.destructive || false,
      isLoading: false,
    });
  }, []);

  /**
   * Execute the confirmation callback.
   */
  const confirm = useCallback(async () => {
    if (!onConfirmRef.current) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await onConfirmRef.current();
      setState(DEFAULT_STATE);
    } catch {
      // Error is expected to be handled by the callback itself
      // (e.g., via useMutationWithToast)
      setState((prev) => ({ ...prev, isLoading: false }));
    } finally {
      onConfirmRef.current = null;
      onCancelRef.current = null;
    }
  }, []);

  /**
   * Cancel and close the dialog.
   */
  const cancel = useCallback(() => {
    onCancelRef.current?.();
    onConfirmRef.current = null;
    onCancelRef.current = null;
    setState(DEFAULT_STATE);
  }, []);

  return { state, prompt, confirm, cancel };
}

export default useConfirmDialog;
