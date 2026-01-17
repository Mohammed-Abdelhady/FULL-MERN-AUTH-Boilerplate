'use client';

import * as React from 'react';
import { type FieldPath, type FieldValues } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getTextareaClassName } from '@/lib/config/form-styles';
import { BaseFormField } from './BaseFormField';

export interface FormTextareaProps<TFieldValues extends FieldValues = FieldValues> extends Omit<
  React.ComponentProps<'textarea'>,
  'name'
> {
  name: FieldPath<TFieldValues>;
  description?: string;
  showCharCount?: boolean;
}

export const FormTextarea = <TFieldValues extends FieldValues = FieldValues>({
  name,
  description,
  maxLength,
  showCharCount = false,
  className,
  ...textareaProps
}: FormTextareaProps<TFieldValues>) => {
  return (
    <BaseFormField
      name={name}
      description={description}
      render={(field) => (
        <div className="relative">
          <Textarea
            {...textareaProps}
            {...field}
            maxLength={maxLength}
            className={cn(getTextareaClassName(), className)}
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
