'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { type FieldPath, type FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BaseFormField } from './BaseFormField';

export interface FormPasswordProps<TFieldValues extends FieldValues = FieldValues> extends Omit<
  React.ComponentProps<'input'>,
  'name' | 'type'
> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
}

export const FormPassword = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  className,
  ...inputProps
}: FormPasswordProps<TFieldValues>) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <BaseFormField
      name={name}
      label={label}
      description={description}
      render={(field) => (
        <div className="relative">
          <Input
            {...inputProps}
            {...field}
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-10', className)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      )}
    />
  );
};
