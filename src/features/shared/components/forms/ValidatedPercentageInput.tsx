import React from 'react';
import { ValidatedInput, type ValidatedInputProps } from './ValidatedInput';
import { type FieldValidationConfig } from '@/features/shared/validation/types';
import * as rules from '@/features/shared/validation/rules';

export interface ValidatedPercentageInputProps extends Omit<ValidatedInputProps, 'rightSymbol' | 'validationConfig'> {
  minValue?: number;
  maxValue?: number;
  allowNegative?: boolean;
  customValidation?: FieldValidationConfig;
  highValueWarning?: { threshold: number; message: string };
  lowValueWarning?: { threshold: number; message: string };
}

/**
 * Percentage input component with built-in validation
 */
export const ValidatedPercentageInput: React.FC<ValidatedPercentageInputProps> = ({
  minValue = 0,
  maxValue = 100,
  allowNegative = false,
  customValidation,
  highValueWarning,
  lowValueWarning,
  ...props
}) => {
  // Build validation rules
  const validationRules = [
    rules.numeric,
    ...(allowNegative ? [] : [rules.nonNegative]),
    ...(minValue !== undefined ? [rules.minValue(minValue)] : []),
    ...(maxValue !== undefined ? [rules.maxValue(maxValue)] : []),
    ...(highValueWarning ? [rules.highPercentageWarning(highValueWarning.threshold, highValueWarning.message)] : []),
    ...(lowValueWarning ? [rules.lowValueWarning(lowValueWarning.threshold, lowValueWarning.message)] : []),
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
      rightSymbol="%"
      validationConfig={validationConfig}
      validateOnChange={true}
      validateOnBlur={true}
    />
  );
};