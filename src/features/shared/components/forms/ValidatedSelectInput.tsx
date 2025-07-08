import React from 'react';
import { FormField } from './FormField';
import { useFieldValidation } from '@/features/shared/validation/hooks';
import { type FieldValidationConfig, type ValidationContext } from '@/features/shared/validation/types';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidatedSelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  validationConfig?: FieldValidationConfig;
  validationContext?: ValidationContext;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showValidationOnMount?: boolean;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  fieldName?: string;
}

/**
 * Enhanced select component with integrated validation
 */
export const ValidatedSelectInput: React.FC<ValidatedSelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  validationConfig,
  validationContext = {},
  validateOnChange = false,
  validateOnBlur = true,
  showValidationOnMount = false,
  helpText,
  required = false,
  disabled = false,
  placeholder = 'Select an option...',
  className = '',
  fieldName = 'field'
}) => {
  const [showValidation, setShowValidation] = React.useState(showValidationOnMount);
  
  const { validate, state, markTouched, markDirty, updateContext } = useFieldValidation(
    fieldName,
    validationConfig || { rules: [], required },
    validationContext
  );

  // Update validation context when it changes
  React.useEffect(() => {
    updateContext(validationContext);
  }, [validationContext, updateContext]);

  // Validate on mount if required
  React.useEffect(() => {
    if (showValidationOnMount && validationConfig) {
      validate(value);
      setShowValidation(true);
    }
  }, [showValidationOnMount, validationConfig, validate, value]);

  // Handle select change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    markDirty();
    
    if (validateOnChange && validationConfig) {
      validate(newValue);
      setShowValidation(true);
    }
  };

  // Handle select blur
  const handleBlur = () => {
    markTouched();
    
    if (validateOnBlur && validationConfig) {
      validate(value);
      setShowValidation(true);
    }
  };

  // Handle select focus
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

  return (
    <FormField
      label={label}
      error={errorMessage}
      helpText={warningMessage || helpText}
      required={required}
      className={className}
    >
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          className={`
            w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-primary-500 transition-all duration-200
            ${hasErrors 
              ? 'border-red-500 dark:border-red-400' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : 'cursor-pointer'}
            focus:border-primary-500 dark:bg-gray-700 dark:text-white
            appearance-none bg-white dark:bg-gray-700
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </FormField>
  );
};