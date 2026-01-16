'use client';

import * as React from 'react';
import { type FieldPath, type FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { BaseFormField } from './BaseFormField';

export interface FormInputProps<TFieldValues extends FieldValues = FieldValues> extends Omit<
  React.ComponentProps<'input'>,
  'name'
> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
}

export const FormInput = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  ...inputProps
}: FormInputProps<TFieldValues>) => {
  return (
    <BaseFormField
      name={name}
      label={label}
      description={description}
      render={(field) => <Input {...inputProps} {...field} />}
    />
  );
};
