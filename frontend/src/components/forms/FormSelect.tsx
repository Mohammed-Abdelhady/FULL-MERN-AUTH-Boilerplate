'use client';

import * as React from 'react';
import { type FieldPath, type FieldValues } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BaseFormField } from './BaseFormField';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface FormSelectProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  description?: string;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
  disabled?: boolean;
}

export const FormSelect = <TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  placeholder,
  options,
  groups,
  disabled,
}: FormSelectProps<TFieldValues>) => {
  return (
    <BaseFormField
      name={name}
      label={label}
      description={description}
      render={(field) => (
        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {groups
              ? groups.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))
              : options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>
      )}
    />
  );
};
