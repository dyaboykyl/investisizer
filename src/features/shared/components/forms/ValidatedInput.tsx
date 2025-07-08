import React, { useEffect, useState } from 'react';
import { BaseInput, type BaseInputProps } from './BaseInput';
import { FormField } from './FormField';
import { useFieldValidation } from '@/features/shared/validation/hooks';
import { type FieldValidationConfig, type ValidationContext } from '@/features/shared/validation/types';

export interface ValidatedInputProps extends Omit<BaseInputProps, 'error' | 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validationConfig?: FieldValidationConfig;
  validationContext?: ValidationContext;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showValidationOnMount?: boolean;
  helpText?: string;
  required?: boolean;
  className?: string;
  fieldName?: string;
}

/**
 * Enhanced input component with integrated validation
 */
export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  value,
  onChange,
  validationConfig,
  validationContext = {},
  validateOnChange = false,
  validateOnBlur = true,
  showValidationOnMount = false,
  helpText,
  required = false,
  className = '',
  fieldName = 'field',
  ...baseInputProps
}) => {
  const [showValidation, setShowValidation] = useState(showValidationOnMount);
  const [, setHasBlurred] = useState(false);
  
  const { validate, state, markTouched, markDirty, updateContext } = useFieldValidation(
    fieldName,
    validationConfig || { rules: [], required },
    validationContext
  );

  // Update validation context when it changes
  useEffect(() => {
    updateContext(validationContext);
  }, [validationContext, updateContext]);

  // Validate on mount if required
  useEffect(() => {
    if (showValidationOnMount && validationConfig) {
      validate(value);
      setShowValidation(true);
    }
  }, [showValidationOnMount, validationConfig, validate, value]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    markDirty();
    
    if (validateOnChange && validationConfig) {
      validate(newValue);
      setShowValidation(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setHasBlurred(true);
    markTouched();
    
    if (validateOnBlur && validationConfig) {
      validate(value);
      setShowValidation(true);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (validateOnChange && validationConfig) {
      setShowValidation(true);
    }
  };

  // Determine if we should show validation messages
  const shouldShowValidation = showValidation && validationConfig && state;
  const hasErrors = shouldShowValidation && state.errors.length > 0;
  const hasWarnings = shouldShowValidation && state.warnings.length > 0;

  // Combine error and warning messages
  const errorMessage = hasErrors ? state.errors[0] : undefined;
  const warningMessage = hasWarnings && !hasErrors ? state.warnings[0] : undefined;
  // const displayMessage = errorMessage || warningMessage;

  return (
    <FormField
      label={label}
      error={errorMessage}
      helpText={warningMessage || helpText}
      required={required}
      className={className}
    >
      <BaseInput
        {...baseInputProps}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        error={hasErrors || undefined}
      />
    </FormField>
  );
};