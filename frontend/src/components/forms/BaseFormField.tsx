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

export interface BaseFormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  render: (field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>) => React.ReactNode;
  showLabel?: boolean;
  showDescription?: boolean;
  className?: string;
}

export const BaseFormField = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  render,
  showLabel = true,
  showDescription = true,
  className,
}: BaseFormFieldProps<TFieldValues>) => {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {showLabel && label && <FormLabel>{label}</FormLabel>}
          <FormControl>{render(field)}</FormControl>
          {showDescription && description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
