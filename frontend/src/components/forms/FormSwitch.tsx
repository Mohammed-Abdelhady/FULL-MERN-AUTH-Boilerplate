'use client';

import * as React from 'react';
import { type FieldPath, type FieldValues } from 'react-hook-form';
import { FormDescription, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { BaseFormField } from './BaseFormField';

export interface FormSwitchProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const FormSwitch = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  disabled,
}: FormSwitchProps<TFieldValues>) => {
  return (
    <BaseFormField
      name={name}
      label={label}
      description={description}
      showLabel={false}
      showDescription={false}
      className="flex flex-row items-center justify-between rounded-lg border p-4"
      render={(field) => (
        <>
          <div className="space-y-0.5">
            {label && <FormLabel className="text-base">{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
        </>
      )}
    />
  );
};
