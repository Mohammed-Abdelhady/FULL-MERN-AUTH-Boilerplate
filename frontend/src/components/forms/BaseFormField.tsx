'use client';

import * as React from 'react';
import {
  useFormContext,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FORM_STYLES } from '@/lib/config/form-styles';
import { cn } from '@/lib/utils';

export interface BaseFormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  render: (field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>) => React.ReactNode;
  className?: string;
}

export const BaseFormField = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  render,
  className,
}: BaseFormFieldProps<TFieldValues>) => {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(FORM_STYLES.container, className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{render(field)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
