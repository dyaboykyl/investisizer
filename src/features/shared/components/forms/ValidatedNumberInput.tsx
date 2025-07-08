import React from 'react';
import { ValidatedInput, type ValidatedInputProps } from './ValidatedInput';
import { type FieldValidationConfig } from '@/features/shared/validation/types';
import * as rules from '@/features/shared/validation/rules';

export interface ValidatedNumberInputProps extends Omit<ValidatedInputProps, 'validationConfig'> {
  minValue?: number;
  maxValue?: number;
  allowNegative?: boolean;
  allowDecimals?: boolean;
  integerOnly?: boolean;
  customValidation?: FieldValidationConfig;
}

/**
 * Number input component with built-in validation
 */
export const ValidatedNumberInput: React.FC<ValidatedNumberInputProps> = ({
  minValue,
  maxValue,
  allowNegative = false,
  allowDecimals = true,
  integerOnly = false,
  customValidation,
  ...props
}) => {
  // Build validation rules
  const validationRules = [
    rules.numeric,
    ...(allowNegative ? [] : [rules.nonNegative]),
    ...(integerOnly || !allowDecimals ? [rules.integer] : []),
    ...(minValue !== undefined ? [rules.minValue(minValue)] : []),
    ...(maxValue !== undefined ? [rules.maxValue(maxValue)] : []),
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
    />
  );
};