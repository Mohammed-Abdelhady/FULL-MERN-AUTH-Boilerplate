# Form Components Documentation

Reusable, type-safe form components built with React Hook Form, Zod validation, and Shadcn UI with centralized styling configuration.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Global Form Styling](#global-form-styling)
- [Components](#components)
  - [FormInput](#forminput)
  - [FormPassword](#formpassword)
  - [FormSelect](#formselect)
  - [FormTextarea](#formtextarea)
  - [FormCheckbox](#formcheckbox)
  - [FormRadio](#formradio)
  - [FormSwitch](#formswitch)
  - [BaseFormField](#baseformfield)
- [Hooks](#hooks)
  - [useFormWithValidation](#useformwithvalidation)
- [Utilities](#utilities)
  - [Form Error Utilities](#form-error-utilities)
- [Validation Schemas](#validation-schemas)
- [Common Patterns](#common-patterns)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)

---

## Installation

All dependencies are already installed in this project:

```bash
npm install react-hook-form@^7.71.1 zod@^3.25.76 @hookform/resolvers@^3.10.0
```

---

## Quick Start

```tsx
import { useFormWithValidation } from '@/hooks/useFormWithValidation';
import { FormInput, FormPassword } from '@/components/forms';
import { Form } from '@/components/ui/form';
import { zodEmail, zodPassword } from '@/lib/validations';
import { z } from 'zod';

const schema = z.object({
  email: zodEmail(),
  password: zodPassword({ min: 8 }),
});

type FormValues = z.infer<typeof schema>;

function MyForm() {
  const form = useFormWithValidation({
    schema,
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormInput name="email" label="Email" type="email" />
        <FormPassword name="password" label="Password" />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}
```

---

## Global Form Styling

All form styles are centralized in `/src/lib/config/form-styles.ts` using a **three-layer token-based architecture** that eliminates repetition and provides powerful customization.

### Architecture Overview

```
TOKENS (atomic design tokens)
    ↓
BASE_COMPOSITIONS (pre-composed style groups)
    ↓
FORM_STYLES (final component styles)
```

#### Layer 1: TOKENS - Atomic Design Tokens

Single source of truth for all visual properties:

```typescript
const TOKENS = {
  colors: {
    bg: 'bg-gray-100', // All input backgrounds
    bgFocus: 'focus:bg-white', // Focus background
    border: 'border-gray-200', // Border color
    // ... more color tokens
  },
  spacing: {
    width: 'w-full',
    borderRadius: 'rounded-lg',
  },
  typography: {
    fontSize: 'text-sm',
    fontWeight: 'font-medium',
  },
  input: {
    height: 'h-14',
    padding: 'px-5',
  },
  // ... component-specific tokens
};
```

#### Layer 2: BASE_COMPOSITIONS - Shared Style Groups

Pre-composed arrays of styles shared across components:

```typescript
const BASE_COMPOSITIONS = {
  formField: [
    TOKENS.spacing.width,
    TOKENS.spacing.borderRadius,
    TOKENS.typography.fontWeight,
    // ... all shared input/textarea styles
  ],
  button: [
    TOKENS.button.height,
    TOKENS.spacing.width,
    // ... all shared button styles
  ],
};
```

#### Layer 3: FORM_STYLES - Final Component Styles

Built by composing base styles with component-specific tokens:

```typescript
export const FORM_STYLES = {
  input: {
    base: [...BASE_COMPOSITIONS.formField, TOKENS.input.height, TOKENS.input.padding].join(' '),
  },
  // ... other components
};
```

### Customization Guide

#### Change All Input Backgrounds

Edit one token → affects all inputs, textareas, selects:

```typescript
// src/lib/config/form-styles.ts
const TOKENS = {
  colors: {
    bg: 'bg-blue-50', // Changed from bg-gray-100
  },
};
```

#### Change Border Radius Globally

```typescript
const TOKENS = {
  spacing: {
    borderRadius: 'rounded-xl', // Affects all form fields and buttons
  },
};
```

#### Change Input Height Only

```typescript
const TOKENS = {
  input: {
    height: 'h-16', // Only affects inputs, not buttons or textareas
  },
};
```

#### Change Primary Button Color

```typescript
const TOKENS = {
  colors: {
    buttonPrimaryBg: 'bg-purple-500',
    buttonPrimaryBgHover: 'hover:bg-purple-700',
  },
};
```

### Helper Functions

Simplified, DRY helper functions for applying styles:

```typescript
import {
  getInputClassName,
  getTextareaClassName,
  getButtonClassName,
} from '@/lib/config/form-styles';

// Apply global input styles
const inputClass = getInputClassName();

// Apply with overrides
const tallInput = getInputClassName('h-20 px-8');

// Button variants
const primary = getButtonClassName('primary');
const secondary = getButtonClassName('secondary', 'w-auto max-w-md');
```

### Per-Component Overrides

Pass `className` prop to override specific styles:

```tsx
<FormInput
  name="email"
  className="h-16 px-6 bg-blue-50"  // Overrides height, padding, background
/>

<FormTextarea
  name="bio"
  className="min-h-40 border-2 border-blue-500"  // Custom height and border
/>

<FormSelect
  name="country"
  className="h-20"  // Taller select only
/>
```

### Design System Tokens

Current design system values:

| Category       | Token              | Value                    | Applied To               |
| -------------- | ------------------ | ------------------------ | ------------------------ |
| **Layout**     | width              | `w-full`                 | All form fields          |
|                | borderRadius       | `rounded-lg`             | All form fields, buttons |
|                | input.height       | `h-14` (56px)            | Inputs, selects          |
|                | textarea.minHeight | `min-h-30` (120px)       | Textareas                |
| **Spacing**    | input.padding      | `px-5` (20px horizontal) | Inputs, selects          |
|                | textarea.padding   | `px-5 py-3`              | Textareas                |
| **Colors**     | bg                 | `bg-gray-100`            | All form fields          |
|                | bgFocus            | `focus:bg-white`         | All form fields (focus)  |
|                | border             | `border-gray-200`        | All form fields          |
|                | borderFocus        | `focus:border-gray-400`  | All form fields (focus)  |
| **Typography** | fontSize           | `text-sm`                | All form fields          |
|                | fontWeight         | `font-medium`            | All form fields          |
| **Buttons**    | Primary BG         | `bg-indigo-500`          | Primary buttons          |
|                | Primary Hover      | `hover:bg-indigo-700`    | Primary buttons (hover)  |
|                | Secondary BG       | `bg-indigo-100`          | Secondary buttons        |

### Benefits of Token-Based System

✅ **No Repetition** - Define once, use everywhere via composition
✅ **Easy Theming** - Change one token → updates all related components
✅ **Type Safety** - `as const` ensures tokens can't be accidentally modified
✅ **Clear Hierarchy** - Understand which styles affect which components
✅ **Maintainable** - Add new components by composing existing tokens
✅ **Discoverable** - All customization points clearly documented

### Naming Conventions

- **Tokens**: `camelCase` nested objects (TOKENS.colors.bg)
- **Compositions**: `camelCase` (BASE_COMPOSITIONS.formField)
- **Functions**: `camelCase` (getInputClassName, buildClassName)
- **Constants**: `UPPER_SNAKE_CASE` (FORM_STYLES, TOKENS)
- **Components**: `PascalCase` (FormInput, FormPassword)
- **Props**: `camelCase` (className, showToggle, applyGlobalStyles)

---

## Components

### FormInput

Basic text input field with label, error message, and helper text.

**Props:**

| Prop          | Type                | Default | Description                        |
| ------------- | ------------------- | ------- | ---------------------------------- |
| `name`        | `string` (required) | -       | Field name in form                 |
| `label`       | `string`            | -       | Label text                         |
| `description` | `string`            | -       | Helper text below input            |
| `type`        | `string`            | `text`  | Input type (text, email, tel, etc) |
| `placeholder` | `string`            | -       | Placeholder text                   |
| `disabled`    | `boolean`           | `false` | Disable input                      |
| ...           | Native input props  | -       | All HTML input attributes          |

**Basic Usage:**

```tsx
<FormInput name="username" label="Username" placeholder="Enter username" />
```

**With Validation:**

```tsx
const schema = z.object({
  email: zodEmail({ message: 'Invalid email address' }),
});

<FormInput
  name="email"
  label="Email Address"
  type="email"
  description="We'll never share your email"
/>;
```

---

### FormPassword

Password input with visibility toggle button.

**Props:**

| Prop          | Type                | Default | Description               |
| ------------- | ------------------- | ------- | ------------------------- |
| `name`        | `string` (required) | -       | Field name in form        |
| `label`       | `string`            | -       | Label text                |
| `description` | `string`            | -       | Helper text below input   |
| `placeholder` | `string`            | -       | Placeholder text          |
| `disabled`    | `boolean`           | `false` | Disable input             |
| ...           | Native input props  | -       | All HTML input attributes |

**Basic Usage:**

```tsx
<FormPassword name="password" label="Password" placeholder="Enter password" />
```

**With Validation:**

```tsx
const schema = z.object({
  password: zodStrongPassword({
    min: 12,
    messages: {
      min: 'Password must be at least 12 characters',
    },
  }),
});

<FormPassword
  name="password"
  label="Password"
  description="Must contain uppercase, lowercase, number, and special character"
/>;
```

---

### FormSelect

Dropdown select field with options or grouped options.

**Props:**

| Prop          | Type                  | Default | Description              |
| ------------- | --------------------- | ------- | ------------------------ |
| `name`        | `string` (required)   | -       | Field name in form       |
| `label`       | `string`              | -       | Label text               |
| `description` | `string`              | -       | Helper text below select |
| `placeholder` | `string`              | -       | Placeholder when empty   |
| `options`     | `SelectOption[]`      | -       | Array of {label, value}  |
| `groups`      | `SelectOptionGroup[]` | -       | Grouped options          |
| `disabled`    | `boolean`             | `false` | Disable select           |

**Basic Usage:**

```tsx
<FormSelect
  name="country"
  label="Country"
  placeholder="Select country"
  options={[
    { label: 'United States', value: 'us' },
    { label: 'Canada', value: 'ca' },
    { label: 'United Kingdom', value: 'uk' },
  ]}
/>
```

**With Grouped Options:**

```tsx
<FormSelect
  name="timezone"
  label="Timezone"
  groups={[
    {
      label: 'North America',
      options: [
        { label: 'Eastern Time', value: 'et' },
        { label: 'Central Time', value: 'ct' },
      ],
    },
    {
      label: 'Europe',
      options: [
        { label: 'GMT', value: 'gmt' },
        { label: 'CET', value: 'cet' },
      ],
    },
  ]}
/>
```

---

### FormTextarea

Multiline text input with optional character count.

**Props:**

| Prop            | Type                  | Default | Description                  |
| --------------- | --------------------- | ------- | ---------------------------- |
| `name`          | `string` (required)   | -       | Field name in form           |
| `label`         | `string`              | -       | Label text                   |
| `description`   | `string`              | -       | Helper text below textarea   |
| `maxLength`     | `number`              | -       | Maximum character length     |
| `showCharCount` | `boolean`             | `false` | Show character count         |
| `placeholder`   | `string`              | -       | Placeholder text             |
| `disabled`      | `boolean`             | `false` | Disable textarea             |
| ...             | Native textarea props | -       | All HTML textarea attributes |

**Basic Usage:**

```tsx
<FormTextarea name="bio" label="Bio" placeholder="Tell us about yourself" rows={4} />
```

**With Character Count:**

```tsx
<FormTextarea
  name="description"
  label="Description"
  maxLength={500}
  showCharCount
  description="Provide a detailed description"
/>
```

---

### FormCheckbox

Checkbox input supporting single checkbox or checkbox group.

**Props:**

| Prop          | Type                | Default | Description                |
| ------------- | ------------------- | ------- | -------------------------- |
| `name`        | `string` (required) | -       | Field name in form         |
| `label`       | `string`            | -       | Label text                 |
| `description` | `string`            | -       | Helper text below checkbox |
| `options`     | `CheckboxOption[]`  | -       | Array for checkbox group   |
| `disabled`    | `boolean`           | `false` | Disable checkbox           |
| `required`    | `boolean`           | `false` | Required checkbox          |

**Single Checkbox:**

```tsx
<FormCheckbox name="acceptTerms" label="I accept the terms and conditions" required />
```

**Checkbox Group:**

```tsx
<FormCheckbox
  name="interests"
  label="Interests"
  options={[
    { label: 'Technology', value: 'tech' },
    { label: 'Sports', value: 'sports' },
    { label: 'Music', value: 'music' },
  ]}
/>
```

---

### FormRadio

Radio button group with vertical or horizontal layout.

**Props:**

| Prop          | Type                     | Default    | Description                   |
| ------------- | ------------------------ | ---------- | ----------------------------- |
| `name`        | `string` (required)      | -          | Field name in form            |
| `label`       | `string`                 | -          | Label text                    |
| `description` | `string`                 | -          | Helper text below radio group |
| `options`     | `RadioOption[]`          | (required) | Array of {label, value}       |
| `disabled`    | `boolean`                | `false`    | Disable all options           |
| `orientation` | `vertical \| horizontal` | `vertical` | Layout direction              |

**Basic Usage:**

```tsx
<FormRadio
  name="role"
  label="Select Role"
  options={[
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
    { label: 'Moderator', value: 'moderator' },
  ]}
/>
```

**Horizontal Layout:**

```tsx
<FormRadio
  name="theme"
  label="Theme"
  orientation="horizontal"
  options={[
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ]}
/>
```

---

### FormSwitch

Toggle switch with inline label.

**Props:**

| Prop          | Type                | Default | Description              |
| ------------- | ------------------- | ------- | ------------------------ |
| `name`        | `string` (required) | -       | Field name in form       |
| `label`       | `string`            | -       | Label text               |
| `description` | `string`            | -       | Helper text below switch |
| `disabled`    | `boolean`           | `false` | Disable switch           |

**Basic Usage:**

```tsx
<FormSwitch
  name="notifications"
  label="Enable Notifications"
  description="Receive email notifications"
/>
```

---

### BaseFormField

Low-level wrapper component for custom form fields. All form components are built on top of this base component.

#### Minimal API - Global Styles Always Applied

BaseFormField applies global form styles (compact spacing, hidden labels) automatically. Labels are not supported - use placeholders instead.

**Props:**

| Prop          | Type                  | Default | Description                     |
| ------------- | --------------------- | ------- | ------------------------------- |
| `name`        | `string` (required)   | -       | Field name in form              |
| `description` | `string`              | -       | Helper text (shown if provided) |
| `render`      | `function` (required) | -       | Render function for control     |
| `className`   | `string`              | -       | Custom className for FormItem   |

**Basic Usage:**

```tsx
// Simple input field with placeholder
<BaseFormField
  name="email"
  render={(field) => <Input {...field} placeholder="Email" />}
/>

// With description
<BaseFormField
  name="bio"
  description="Tell us about yourself"
  render={(field) => <Textarea {...field} />}
/>
```

**Custom Layout (Manual Label Rendering):**

For special cases like FormSwitch or FormCheckbox where you need custom label positioning:

```tsx
// Render labels manually inside the render function
<BaseFormField
  name="notifications"
  className="flex items-center justify-between rounded-lg border p-4"
  render={(field) => (
    <>
      <div>
        <FormLabel>Enable Notifications</FormLabel>
        <FormDescription>Get email updates</FormDescription>
      </div>
      <Switch {...field} />
    </>
  )}
/>
```

---

## Hooks

### useFormWithValidation

Custom hook that sets up React Hook Form with Zod validation.

**Parameters:**

| Parameter       | Type                   | Default  | Description           |
| --------------- | ---------------------- | -------- | --------------------- |
| `schema`        | `ZodSchema` (required) | -        | Zod validation schema |
| `defaultValues` | `object`               | -        | Default form values   |
| `mode`          | `string`               | `onBlur` | Validation mode       |
| `criteriaMode`  | `string`               | `all`    | Error criteria mode   |

**Returns:** `UseFormReturn` from React Hook Form

**Usage:**

```tsx
const form = useFormWithValidation({
  schema: mySchema,
  defaultValues: { name: '', email: '' },
  mode: 'onBlur', // onChange, onSubmit, onTouched
});
```

---

## Utilities

### Form Error Utilities

Located in `lib/utils/form-errors.ts`.

**formatZodError(error: ZodError): Record<string, string>**

- Transforms Zod errors into readable format

**getFieldError(errors: FieldErrors, fieldName: string): string | undefined**

- Extracts error message for specific field

**hasFieldError(errors: FieldErrors, fieldName: string): boolean**

- Checks if field has error

**setServerErrors(setError: UseFormSetError, serverErrors: Record<string, string>): void**

- Maps API errors to form fields

**getAllErrorMessages(errors: FieldErrors): string[]**

- Gets all error messages as array

**Usage:**

```tsx
try {
  await api.post('/submit', data);
} catch (error) {
  if (error.response?.data?.errors) {
    setServerErrors(form.setError, error.response.data.errors);
  }
}
```

---

## Validation Schemas

All validation schemas are located in `lib/validations/` and organized by category:

- **String validators** (25): `zodEmail`, `zodPassword`, `zodUrl`, `zodSlug`, etc.
- **Number validators** (12): `zodPositiveNumber`, `zodAge`, `zodPrice`, etc.
- **Date validators** (7): `zodDate`, `zodFutureDate`, `zodDateRange`, etc.
- **Boolean validators** (2): `zodBoolean`, `zodAcceptTerms`
- **Array validators** (8): `zodArray`, `zodNonEmptyArray`, `zodUniqueArray`, etc.
- **File validators** (4): `zodFile`, `zodImage`, `zodDocument`, etc.

**Example Schema:**

```tsx
import { zodEmail, zodStrongPassword, zodName } from '@/lib/validations';
import { z } from 'zod';

const registerSchema = z
  .object({
    name: zodName({ required: true }),
    email: zodEmail(),
    password: zodStrongPassword({ min: 12 }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
```

---

## Common Patterns

### Password with Confirmation

```tsx
const schema = z.object({
  password: zodPassword({ min: 8 }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

<FormPassword name="password" label="Password" />
<FormPassword name="confirmPassword" label="Confirm Password" />
```

### Conditional Fields

```tsx
const schema = z
  .object({
    hasCompany: zodBoolean(),
    companyName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasCompany) {
        return !!data.companyName;
      }
      return true;
    },
    {
      message: 'Company name is required',
      path: ['companyName'],
    },
  );

const hasCompany = form.watch('hasCompany');

<FormCheckbox name="hasCompany" label="I have a company" />;
{
  hasCompany && <FormInput name="companyName" label="Company Name" />;
}
```

### Dynamic Field Arrays

```tsx
import { useFieldArray } from 'react-hook-form';

const schema = z.object({
  emails: z.array(
    z.object({
      value: zodEmail(),
    }),
  ),
});

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'emails',
});

{
  fields.map((field, index) => (
    <div key={field.id}>
      <FormInput name={`emails.${index}.value`} label={`Email ${index + 1}`} />
      <button onClick={() => remove(index)}>Remove</button>
    </div>
  ));
}
<button onClick={() => append({ value: '' })}>Add Email</button>;
```

### Server-side Validation

```tsx
const onSubmit = async (data: FormValues) => {
  try {
    await api.post('/submit', data);
  } catch (error) {
    if (error.response?.data?.errors) {
      setServerErrors(form.setError, error.response.data.errors);
    }
  }
};
```

---

## Accessibility

All form components include:

- ✅ Semantic HTML (`label`, `input`, `select`, etc.)
- ✅ Proper `aria-*` attributes
- ✅ Keyboard navigation support
- ✅ Screen reader announcements
- ✅ Focus management
- ✅ Error state indicators

**Best Practices:**

1. Always provide a `label` prop
2. Use `description` for helpful context
3. Ensure proper tab order
4. Test with keyboard only
5. Test with screen readers

---

## Troubleshooting

### TypeScript Errors

**Problem:** Type inference not working

**Solution:** Ensure schema is defined outside component:

```tsx
// ❌ Bad
function MyForm() {
  const schema = z.object({ ... });

// ✅ Good
const schema = z.object({ ... });
function MyForm() {
```

---

### Form Not Submitting

**Problem:** Form doesn't submit on Enter key

**Solution:** Ensure button has `type="submit"`:

```tsx
<button type="submit">Submit</button>
```

---

### Validation Not Working

**Problem:** Fields not validating on blur

**Solution:** Check validation mode:

```tsx
const form = useFormWithValidation({
  schema,
  mode: 'onBlur', // or 'onChange', 'onSubmit'
});
```

---

### Field Not Registering

**Problem:** Field value not captured

**Solution:** Ensure `name` prop matches schema:

```tsx
const schema = z.object({
  email: zodEmail(), // ✅ name="email"
});

<FormInput name="email" /> // ✅ Matches schema
<FormInput name="emailAddress" /> // ❌ Doesn't match
```

---

## Additional Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Shadcn UI Forms](https://ui.shadcn.com/docs/components/form)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
