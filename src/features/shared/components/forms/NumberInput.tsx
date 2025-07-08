import React from 'react';
import { FormField } from './FormField';
import { BaseInput } from './BaseInput';

export interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  allowNegative?: boolean;
  allowDecimals?: boolean;
  leftSymbol?: React.ReactNode;
  rightSymbol?: React.ReactNode;
  className?: string;
}

/**
 * Generic number input component with optional symbols.
 * Provides flexibility for various numeric input scenarios.
 */
export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  helpText,
  error,
  required = false,
  disabled = false,
  allowNegative = false,
  allowDecimals = true,
  leftSymbol,
  rightSymbol,
  className = ''
}) => {
  const pattern = allowNegative 
    ? (allowDecimals ? '[\\-]?[0-9]*[.]?[0-9]*' : '[\\-]?[0-9]*')
    : (allowDecimals ? '[0-9]*[.]?[0-9]*' : '[0-9]*');
  
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
        leftSymbol={leftSymbol}
        rightSymbol={rightSymbol}
        error={!!error}
      />
    </FormField>
  );
};