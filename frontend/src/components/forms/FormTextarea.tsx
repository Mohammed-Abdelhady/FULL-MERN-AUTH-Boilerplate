'use client';

import * as React from 'react';
import { type FieldPath, type FieldValues } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { BaseFormField } from './BaseFormField';

export interface FormTextareaProps<TFieldValues extends FieldValues = FieldValues> extends Omit<
  React.ComponentProps<'textarea'>,
  'name'
> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  showCharCount?: boolean;
}

export const FormTextarea = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  maxLength,
  showCharCount = false,
  className,
  ...textareaProps
}: FormTextareaProps<TFieldValues>) => {
  return (
    <BaseFormField
      name={name}
      label={label}
      description={description}
      render={(field) => (
        <div className="relative">
          <Textarea
            {...textareaProps}
            {...field}
            maxLength={maxLength}
            className={cn('resize-none', className)}
          />
          {showCharCount && maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {field.value?.length || 0}/{maxLength}
            </div>
          )}
        </div>
      )}
    />
  );
};
