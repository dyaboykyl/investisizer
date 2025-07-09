import React from 'react';
import { ValidatedInput, type ValidatedInputProps } from './ValidatedInput';
import { type FieldValidationConfig } from '@/features/shared/validation/types';
import * as rules from '@/features/shared/validation/rules';

export interface ValidatedYearInputProps extends Omit<ValidatedInputProps, 'validationConfig'> {
  minYear?: number;
  maxYear?: number;
  customValidation?: FieldValidationConfig;
}

/**
 * Year input component with built-in validation
 */
export const ValidatedYearInput: React.FC<ValidatedYearInputProps> = ({
  minYear = 1900,
  maxYear = new Date().getFullYear() + 100,
  customValidation,
  ...props
}) => {
  // Build validation rules
  const validationRules = [
    rules.numeric,
    rules.integer,
    rules.minValue(minYear),
    rules.maxValue(maxYear),
    ...(customValidation?.rules || [])
  ];

  const validationConfig: FieldValidationConfig = {
    rules: validationRules,
    required: customValidation?.required || props.required,
    debounceMs: customValidation?.debounceMs || 300
  };

  return (
    <ValidatedInput
      {...props}
      validationConfig={validationConfig}
      validateOnChange={true}
      validateOnBlur={true}
    />
  );
};