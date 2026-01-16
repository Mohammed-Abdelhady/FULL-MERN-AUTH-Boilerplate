# Form Components Documentation

Reusable form components built with React Hook Form, Zod validation, and Shadcn UI.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
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

Low-level wrapper component for custom form fields.

**Props:**

| Prop              | Type                  | Default | Description                   |
| ----------------- | --------------------- | ------- | ----------------------------- |
| `name`            | `string` (required)   | -       | Field name in form            |
| `label`           | `string`              | -       | Label text                    |
| `description`     | `string`              | -       | Helper text                   |
| `render`          | `function` (required) | -       | Render function for control   |
| `showLabel`       | `boolean`             | `true`  | Show label                    |
| `showDescription` | `boolean`             | `true`  | Show description              |
| `className`       | `string`              | -       | Custom className for FormItem |

**Usage:**

```tsx
<BaseFormField
  name="customField"
  label="Custom Field"
  render={(field) => <CustomInput {...field} />}
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
