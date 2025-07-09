import React, { useEffect, useState, useMemo, useId } from 'react';
import { BaseInput, type BaseInputProps } from './BaseInput';
import { FormField } from './FormField';
import { useFieldValidation } from '@/features/shared/validation/hooks';
import { type FieldValidationConfig, type ValidationContext } from '@/features/shared/validation/types';

export interface ValidatedInputProps extends Omit<BaseInputProps, 'error' | 'onChange' | 'onBlur' | 'onFocus'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
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
  onBlur,
  onFocus,
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
  const inputId = useId();
  const [showValidation, setShowValidation] = useState(showValidationOnMount);
  const [, setHasBlurred] = useState(false);
  
  // Memoize validation context to prevent unnecessary re-renders
  const memoizedValidationContext = useMemo(() => validationContext, [
    JSON.stringify(validationContext)
  ]);
  
  const { validate, correctValue, state, markTouched, markDirty, updateContext } = useFieldValidation(
    fieldName,
    validationConfig || { rules: [], required },
    memoizedValidationContext
  );

  // Update validation context when it changes
  useEffect(() => {
    updateContext(memoizedValidationContext);
  }, [updateContext, memoizedValidationContext]);

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
    
    // Always show validation on change for immediate feedback
    if (validationConfig) {
      validate(newValue);
      setShowValidation(true);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setHasBlurred(true);
    markTouched();
    
    if (validateOnBlur && validationConfig) {
      const validationResult = validate(value);
      setShowValidation(true);
      
      // Apply correction if there are validation errors
      if (validationResult.errors.length > 0) {
        const correctedValue = correctValue(value);
        if (correctedValue !== value) {
          onChange(correctedValue);
        }
      }
    }
    
    // Call the original onBlur handler if provided
    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle input focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (validateOnChange && validationConfig) {
      setShowValidation(true);
    }
    
    // Call the original onFocus handler if provided
    if (onFocus) {
      onFocus(e);
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
      htmlFor={inputId}
    >
      <BaseInput
        {...baseInputProps}
        id={inputId}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        error={hasErrors || undefined}
      />
    </FormField>
  );
};