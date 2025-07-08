import React from 'react';
import { ValidatedInput, type ValidatedInputProps } from './ValidatedInput';
import { type FieldValidationConfig } from '@/features/shared/validation/types';
import * as rules from '@/features/shared/validation/rules';

export interface ValidatedCurrencyInputProps extends Omit<ValidatedInputProps, 'leftSymbol' | 'validationConfig'> {
  minValue?: number;
  maxValue?: number;
  allowNegative?: boolean;
  customValidation?: FieldValidationConfig;
}

/**
 * Currency input component with built-in validation
 */
export const ValidatedCurrencyInput: React.FC<ValidatedCurrencyInputProps> = ({
  minValue = 0,
  maxValue = 100000000,
  allowNegative = false,
  customValidation,
  ...props
}) => {
  // Build validation config
  const validationRules = [
    rules.numeric,
    rules.currency,
    ...(allowNegative ? [] : [rules.nonNegative]),
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
      leftSymbol="$"
      validationConfig={validationConfig}
      validateOnChange={true}
    />
  );
};