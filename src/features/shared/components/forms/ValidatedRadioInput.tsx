import React from 'react';
import { FormField } from './FormField';
import { useFieldValidation } from '@/features/shared/validation/hooks';
import { type FieldValidationConfig, type ValidationContext } from '@/features/shared/validation/types';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ValidatedRadioInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  validationConfig?: FieldValidationConfig;
  validationContext?: ValidationContext;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showValidationOnMount?: boolean;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  fieldName?: string;
  orientation?: 'vertical' | 'horizontal';
  renderOption?: (option: RadioOption, selected: boolean) => React.ReactNode;
}

/**
 * Radio button group component with integrated validation
 */
export const ValidatedRadioInput: React.FC<ValidatedRadioInputProps> = ({
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
  className = '',
  fieldName = 'field',
  orientation = 'vertical',
  renderOption
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

  // Handle radio change
  const handleChange = (newValue: string) => {
    onChange(newValue);
    markDirty();
    
    if (validateOnChange && validationConfig) {
      validate(newValue);
      setShowValidation(true);
    }
  };

  // Handle radio blur
  const handleBlur = () => {
    markTouched();
    
    if (validateOnBlur && validationConfig) {
      validate(value);
      setShowValidation(true);
    }
  };

  // Handle radio focus
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
      <div className={`space-y-3 ${orientation === 'horizontal' ? 'flex flex-wrap gap-6' : ''}`}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;
          
          return (
            <div key={option.value} className={orientation === 'horizontal' ? 'flex-shrink-0' : ''}>
              {renderOption ? (
                renderOption(option, isSelected)
              ) : (
                <label className={`flex items-start space-x-3 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    type="radio"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => handleChange(option.value)}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    disabled={isDisabled}
                    className={`
                      mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 focus:ring-primary-500 
                      dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 
                      dark:bg-gray-700 dark:border-gray-600 transition-all duration-200
                      ${hasErrors ? 'border-red-500 dark:border-red-400' : ''}
                      ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                    {option.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                </label>
              )}
            </div>
          );
        })}
      </div>
    </FormField>
  );
};