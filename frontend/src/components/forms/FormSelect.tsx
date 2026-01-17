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
import { cn } from '@/lib/utils';
import { getInputClassName } from '@/lib/config/form-styles';
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
  description?: string;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
  disabled?: boolean;
  className?: string;
}

export const FormSelect = <TFieldValues extends FieldValues = FieldValues>({
  name,
  description,
  placeholder,
  options,
  groups,
  disabled,
  className,
}: FormSelectProps<TFieldValues>) => {
  return (
    <BaseFormField
      name={name}
      description={description}
      render={(field) => (
        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
          <SelectTrigger className={cn(getInputClassName(), className)}>
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
