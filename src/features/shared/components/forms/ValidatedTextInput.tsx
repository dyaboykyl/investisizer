import React from 'react';
import { ValidatedInput, type ValidatedInputProps } from './ValidatedInput';
import { type FieldValidationConfig } from '@/features/shared/validation/types';
import * as rules from '@/features/shared/validation/rules';

export interface ValidatedTextInputProps extends Omit<ValidatedInputProps, 'validationConfig'> {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidation?: FieldValidationConfig;
}

/**
 * Text input component with built-in validation
 */
export const ValidatedTextInput: React.FC<ValidatedTextInputProps> = ({
  minLength,
  maxLength,
  pattern,
  customValidation,
  ...props
}) => {
  // Build validation rules
  const validationRules = [
    ...(minLength !== undefined ? [rules.minLength(minLength)] : []),
    ...(maxLength !== undefined ? [rules.maxLength(maxLength)] : []),
    ...(pattern ? [rules.custom('pattern', (value: string) => {
      if (value && !new RegExp(pattern).test(value)) {
        return 'Please enter a valid format';
      }
      return null;
    })] : []),
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
      validateOnChange={false}
      validateOnBlur={true}
    />
  );
};