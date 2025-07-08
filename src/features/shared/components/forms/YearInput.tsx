import React from 'react';
import { FormField } from './FormField';
import { BaseInput } from './BaseInput';

export interface YearInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  allowDecimals?: boolean;
  className?: string;
  showUnit?: boolean; // Allow hiding "years" suffix
}

/**
 * Year input component with optional "years" suffix.
 * Handles numeric input for year values.
 */
export const YearInput: React.FC<YearInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  helpText,
  error,
  required = false,
  disabled = false,
  allowDecimals = false,
  className = '',
  showUnit = true
}) => {
  const pattern = allowDecimals 
    ? '[0-9]*[.]?[0-9]*' 
    : '[0-9]*';
  
  const inputMode = allowDecimals ? 'decimal' : 'numeric';

  return (
    <FormField
      label={label}
      error={error}
      helpText={helpText}
      required={required}
      className={className}
    >
      <BaseInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        inputMode={inputMode}
        pattern={pattern}
        rightSymbol={showUnit ? "years" : undefined}
        error={!!error}
      />
    </FormField>
  );
};