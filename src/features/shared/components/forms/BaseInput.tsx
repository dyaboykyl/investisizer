import React, { type InputHTMLAttributes } from 'react';

export interface BaseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  leftSymbol?: React.ReactNode;
  rightSymbol?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
}

/**
 * Base input component that provides consistent styling and structure.
 * Used as foundation for specialized input components.
 */
export const BaseInput: React.FC<BaseInputProps> = ({
  leftSymbol,
  rightSymbol,
  error = false,
  fullWidth = true,
  ...inputProps
}) => {
  // Determine padding based on symbols
  const leftPadding = leftSymbol ? 'pl-8' : 'pl-4';
  const rightPadding = rightSymbol ? 'pr-8' : 'pr-4';
  
  // Base classes for the input
  const baseClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${leftPadding}
    ${rightPadding}
    py-2
    border-2
    ${error 
      ? 'border-red-500 dark:border-red-400' 
      : 'border-gray-300 dark:border-gray-600'
    }
    rounded-lg
    focus:ring-2
    focus:ring-primary-500
    focus:border-primary-500
    dark:bg-gray-700
    dark:text-white
    transition-all
    duration-200
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className="relative">
      {leftSymbol && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 dark:text-gray-400">
            {leftSymbol}
          </span>
        </div>
      )}
      
      <input
        type="text"
        className={baseClasses}
        {...inputProps}
      />
      
      {rightSymbol && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-500 dark:text-gray-400">
            {rightSymbol}
          </span>
        </div>
      )}
    </div>
  );
};