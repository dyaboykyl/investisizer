import React from 'react';
import { FormField } from './FormField';

export interface CheckboxInputProps {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Checkbox input component with optional description.
 * Provides consistent styling and behavior for checkbox inputs.
 */
export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  checked,
  onChange,
  description,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <FormField
      label=""
      error={error}
      required={required}
      className={className}
    >
      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </label>
      </div>
    </FormField>
  );
};