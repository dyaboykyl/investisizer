import React from 'react';
import { FormField } from './FormField';
import { useFieldValidation } from '@/features/shared/validation/hooks';
import { type FieldValidationConfig, type ValidationContext } from '@/features/shared/validation/types';

export interface ValidatedCheckboxInputProps {
  label: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  validationConfig?: FieldValidationConfig;
  validationContext?: ValidationContext;
  validateOnChange?: boolean;
  showValidationOnMount?: boolean;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  fieldName?: string;
}

/**
 * Enhanced checkbox component with integrated validation
 */
export const ValidatedCheckboxInput: React.FC<ValidatedCheckboxInputProps> = ({
  label,
  checked,
  onChange,
  validationConfig,
  validationContext = {},
  validateOnChange = false,
  showValidationOnMount = false,
  helpText,
  required = false,
  disabled = false,
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
      validate(checked);
      setShowValidation(true);
    }
  }, [showValidationOnMount, validationConfig, validate, checked]);

  // Handle checkbox change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    onChange(newChecked);
    markDirty();
    
    if (validateOnChange && validationConfig) {
      validate(newChecked);
      setShowValidation(true);
    }
  };

  // Handle checkbox blur
  const handleBlur = () => {
    markTouched();
    
    if (validationConfig) {
      validate(checked);
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
      label=""
      error={errorMessage}
      helpText={warningMessage || helpText}
      required={required}
      className={className}
    >
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`
              w-4 h-4 rounded border-2 focus:ring-2 focus:ring-primary-500 transition-colors
              ${hasErrors 
                ? 'border-red-500 text-red-600' 
                : 'border-gray-300 dark:border-gray-600 text-primary-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              bg-gray-100 dark:bg-gray-600
              focus:ring-primary-500 dark:focus:ring-primary-600
              dark:ring-offset-gray-800
            `}
          />
        </div>
        <div className="ml-3">
          <label className={`text-sm font-medium ${hasErrors ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'} ${disabled ? 'opacity-50' : ''}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      </div>
    </FormField>
  );
};