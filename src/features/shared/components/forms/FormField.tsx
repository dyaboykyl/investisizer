import React from 'react';

export interface FormFieldProps {
  label: string;
  error?: string;
  helpText?: string;
  className?: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}

/**
 * Base form field wrapper that provides consistent layout for form inputs.
 * Handles label, error messages, and help text display.
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helpText,
  className = '',
  required = false,
  children,
  htmlFor
}) => {
  return (
    <div className={`group ${className}`}>
      <label 
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {helpText}
        </p>
      )}
    </div>
  );
};