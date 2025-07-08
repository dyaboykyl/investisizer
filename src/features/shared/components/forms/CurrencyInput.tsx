import React from 'react';
import { FormField } from './FormField';
import { BaseInput } from './BaseInput';

export interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  allowNegative?: boolean;
  className?: string;
}

/**
 * Currency input component with $ prefix.
 * Handles numeric input with decimal support for monetary values.
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  helpText,
  error,
  required = false,
  disabled = false,
  allowNegative = false,
  className = ''
}) => {
  const pattern = allowNegative 
    ? '[\\-]?[0-9]*[.]?[0-9]*' 
    : '[0-9]*[.]?[0-9]*';

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
        inputMode="decimal"
        pattern={pattern}
        leftSymbol="$"
        error={!!error}
      />
    </FormField>
  );
};