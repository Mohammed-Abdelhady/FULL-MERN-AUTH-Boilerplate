# Frontend Architecture Reference Examples

This directory contains reference implementations demonstrating the architectural patterns established for this project. Use these examples as templates when implementing similar functionality.

## Quick Reference

| Pattern                      | Example File            | When to Use                    |
| ---------------------------- | ----------------------- | ------------------------------ |
| Co-located Button + Dialog   | `ReferenceButton.tsx`   | Any button that opens a dialog |
| Form with Custom Hook        | `ReferenceForm.tsx`     | Forms with validation logic    |
| Mutation with Error Handling | `ReferenceMutation.tsx` | Any RTK Query mutation         |

---

## Pattern 1: Co-located Button with Dialog

**File**: `ReferenceButton.tsx`

**Problem it solves**: Parent components shouldn't manage dialog state for child components.

**Anti-pattern** (don't do this):

```tsx
// Parent manages state - BAD
function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>Create</Button>
      <CreateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
```

**Correct pattern**:

```tsx
// Self-contained component - GOOD
function CreateButton({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create</Button>
      <CreateDialog open={open} onOpenChange={setOpen} onSuccess={onSuccess} />
    </>
  );
}

// Usage - clean and simple
function Page() {
  return <CreateButton onSuccess={handleRefresh} />;
}
```

**Key benefits**:

- Single import for full functionality
- No props drilling
- Component is portable and testable
- Parent code is cleaner

**Lazy loading** (for heavy dialogs):

```tsx
const HeavyDialog = lazy(() => import('./HeavyDialog'));

function CreateButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create</Button>
      {open && (
        <Suspense fallback={<div />}>
          <HeavyDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      )}
    </>
  );
}
```

---

## Pattern 2: Form with Custom Hook

**File**: `ReferenceForm.tsx`

**Problem it solves**: Forms with validation logic become large and hard to maintain.

**Key pattern**: Extract form state and validation to a custom hook:

```tsx
// Hook handles ALL logic
export function useCreateUserForm() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name required';
    if (!form.email.includes('@')) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return false;
    // API call...
    return true;
  }, [form, validate]);

  return { form, setForm, errors, validate, handleSubmit };
}

// Component focuses on RENDERING
function CreateUserForm() {
  const { form, setForm, errors, handleSubmit } = useCreateUserForm();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      {errors.name && <span>{errors.name}</span>}
      {/* ... */}
    </form>
  );
}
```

**Key benefits**:

- Component stays under 200 lines
- Logic is testable in isolation
- Hook can be reused for similar forms
- Clear separation of concerns

---

## Pattern 3: Mutation with Consistent Error Handling

**File**: `ReferenceMutation.tsx`

**Problem it solves**: Error handling and toast notifications are duplicated across mutations.

**Key pattern**: Wrap RTK Query mutations with centralized error handling:

```tsx
// Utility hook (in src/hooks/useMutationWithToast.ts)
export function useMutationWithToast(mutation, options) {
  const [mutate, result] = mutation();

  const wrappedMutate = async (variables) => {
    try {
      const data = await mutate(variables).unwrap();
      toast.success(options.successMessage);
      return data;
    } catch (error) {
      toast.error(parseApiError(error));
      return null;
    }
  };

  return [wrappedMutate, result];
}

// Usage
function DeleteButton({ userId }) {
  const [deleteUser, { isLoading }] = useMutationWithToast(useDeleteUserMutation, {
    successMessage: 'User deleted',
  });

  return (
    <Button onClick={() => deleteUser(userId)} disabled={isLoading}>
      Delete
    </Button>
  );
}
```

**Error parsing** (centralized in `src/lib/forms/errorParsing.ts`):

```tsx
export function parseApiError(error) {
  if (error?.data?.message) return error.data.message;
  if (error?.status === 401) return 'Please sign in';
  if (error?.status === 403) return 'Permission denied';
  // ... other cases
  return 'An error occurred';
}
```

**Key benefits**:

- Consistent UX across the app
- No manual toast handling in components
- Centralized error message formatting
- Easy to customize per-use-case

---

## Pattern 4: Confirmation Dialog Hook

**Problem it solves**: Confirmation dialogs require repetitive state management.

**Key pattern**: Encapsulate confirmation flow in a hook:

```tsx
function useConfirmDialog() {
  const [state, setState] = useState({ open: false, title: '', isLoading: false });
  const callbackRef = useRef(null);

  const prompt = useCallback((options) => {
    callbackRef.current = options.onConfirm;
    setState({ open: true, title: options.title, isLoading: false });
  }, []);

  const confirm = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    await callbackRef.current?.();
    setState({ open: false, title: '', isLoading: false });
  }, []);

  return { state, prompt, confirm, cancel: () => setState({ ...state, open: false }) };
}

// Usage
function DeleteButton({ userId }) {
  const { state, prompt, confirm, cancel } = useConfirmDialog();
  const [deleteUser] = useDeleteUserMutation();

  const handleClick = () => {
    prompt({
      title: 'Delete user?',
      onConfirm: () => deleteUser(userId),
    });
  };

  return (
    <>
      <Button onClick={handleClick}>Delete</Button>
      <AlertDialog open={state.open}>
        <AlertDialogContent>
          <AlertDialogTitle>{state.title}</AlertDialogTitle>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm} disabled={state.isLoading}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

---

## Implementation Checklist

When implementing a new feature, follow this checklist:

### For Dialogs/Modals:

- [ ] Is the dialog co-located with its trigger button?
- [ ] Is dialog state managed internally (not by parent)?
- [ ] Is the dialog lazy-loaded if it's heavy (>10KB)?
- [ ] Are callbacks optional (onSuccess, onCancel)?

### For Forms:

- [ ] Is form logic extracted to a custom hook?
- [ ] Is validation logic in the hook, not the component?
- [ ] Is the component under 200 lines?
- [ ] Are field errors displayed inline?

### For Mutations:

- [ ] Is error handling using parseApiError?
- [ ] Are success/error toasts shown consistently?
- [ ] Is the mutation wrapped with useMutationWithToast?
- [ ] Is loading state properly handled?

### For Components:

- [ ] Is the component under 200 lines?
- [ ] Is it in the correct location (modules vs components)?
- [ ] Does it have proper TypeScript types?
- [ ] Does it have data-testid attributes?

---

## File Locations

Based on the architectural standards, place files as follows:

**Feature-specific code** → `src/modules/<feature>/`

```
modules/permissions/
├── api/           # RTK Query endpoints
├── components/    # Feature UI components
├── hooks/         # Feature hooks (useUserActions, etc.)
├── utils/         # Feature utilities
└── index.ts       # Public exports
```

**Shared code** → `src/components/`, `src/hooks/`, `src/lib/`

```
src/
├── components/    # Reusable UI (used in 2+ features)
├── hooks/         # Cross-cutting hooks (useDebounce, etc.)
└── lib/           # Generic utilities (formatters, validators)
```

---

## Related Documentation

- **CLAUDE.md**: Complete Frontend Architecture Standards section
- **OpenSpec Proposal**: `openspec/changes/optimize-frontend-architecture/`
  - `proposal.md`: High-level overview and rationale
  - `design.md`: Detailed architectural decisions
  - `tasks.md`: Implementation roadmap
