import { type ValidationRule } from './types';

// Common validation rules
export const required: ValidationRule<string> = {
  name: 'required',
  validate: (value: string) => {
    if (!value || value.trim() === '') {
      return 'This field is required';
    }
    return null;
  },
  priority: 'error'
};

export const minLength = (min: number): ValidationRule<string> => ({
  name: 'minLength',
  validate: (value: string) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },
  priority: 'error'
});

export const maxLength = (max: number): ValidationRule<string> => ({
  name: 'maxLength',
  validate: (value: string) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },
  priority: 'error'
});

export const email: ValidationRule<string> = {
  name: 'email',
  validate: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },
  priority: 'error'
};

// Numeric validation rules
export const numeric: ValidationRule<string> = {
  name: 'numeric',
  validate: (value: string) => {
    if (value && isNaN(Number(value))) {
      return 'Must be a valid number';
    }
    return null;
  },
  correct: (value: string) => {
    if (value && isNaN(Number(value))) {
      // Remove non-numeric characters except for dots, minus signs, and commas
      const corrected = value.replace(/[^0-9.-]/g, '');
      // If the result is empty or just a minus sign, don't correct (leave as is)
      if (corrected === '' || corrected === '-') {
        return value;
      }
      return corrected;
    }
    return value;
  },
  priority: 'error'
};

export const minValue = (min: number): ValidationRule<string> => ({
  name: 'minValue',
  validate: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num) && num < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },
  correct: (_value: string) => {
    return min.toString();
  },
  priority: 'error'
});

export const maxValue = (max: number): ValidationRule<string> => ({
  name: 'maxValue',
  validate: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num) && num > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  },
  correct: (_value: string) => {
    return max.toString();
  },
  priority: 'error'
});

export const positive: ValidationRule<string> = {
  name: 'positive',
  validate: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num) && num <= 0) {
      return 'Must be a positive number';
    }
    return null;
  },
  correct: (_value: string) => {
    return "1";
  },
  priority: 'error'
};

export const nonNegative: ValidationRule<string> = {
  name: 'nonNegative',
  validate: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num) && num < 0) {
      return 'Cannot be negative';
    }
    return null;
  },
  correct: (_value: string) => {
    return "0"
  },
  priority: 'error'
};

export const integer: ValidationRule<string> = {
  name: 'integer',
  validate: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num) && !Number.isInteger(num)) {
      return 'Must be a whole number';
    }
    return null;
  },
  correct: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num) && !Number.isInteger(num)) {
      return Math.round(num).toString();
    }
    return value;
  },
  priority: 'error'
};

// Financial validation rules
export const currency: ValidationRule<string> = {
  name: 'currency',
  validate: (value: string) => {
    if (value && !/^\d*\.?\d{0,2}$/.test(value)) {
      return 'Must be a valid currency amount (max 2 decimal places)';
    }
    return null;
  },
  priority: 'error'
};

export const percentage: ValidationRule<string> = {
  name: 'percentage',
  validate: (value: string) => {
    const num = Number(value);
    if (value && (!isNaN(num) && (num < 0 || num > 100))) {
      return 'Must be between 0 and 100';
    }
    return null;
  },
  correct: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num)) {
      if (num < 0) return '0';
      if (num > 100) return '100';
    }
    return value;
  },
  priority: 'error'
};

export const year: ValidationRule<string> = {
  name: 'year',
  validate: (value: string) => {
    const num = Number(value);
    const currentYear = new Date().getFullYear();
    if (value && !isNaN(num) && (num < 1900 || num > currentYear + 100)) {
      return `Must be between 1900 and ${currentYear + 100}`;
    }
    return null;
  },
  priority: 'error'
};

// Range validation rules
export const range = (min: number, max: number): ValidationRule<string> => ({
  name: 'range',
  validate: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num) && (num < min || num > max)) {
      return `Must be between ${min} and ${max}`;
    }
    return null;
  },
  correct: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num)) {
      if (num < min) return min.toString();
      if (num > max) return max.toString();
    }
    return value;
  },
  priority: 'error'
});

// Custom validation with context
export const custom = <T>(
  name: string,
  validator: (value: T, context?: any) => string | null,
  priority: 'error' | 'warning' = 'error'
): ValidationRule<T> => ({
  name,
  validate: validator,
  priority
});

// Warning rules (for common financial scenarios)
export const highPercentageWarning = (threshold: number, message: string): ValidationRule<string> => ({
  name: 'highPercentageWarning',
  validate: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num) && num > threshold) {
      return message;
    }
    return null;
  },
  priority: 'warning'
});

export const lowValueWarning = (threshold: number, message: string): ValidationRule<string> => ({
  name: 'lowValueWarning',
  validate: (value: string) => {
    const num = Number(value);
    if (value && !isNaN(num) && num < threshold) {
      return message;
    }
    return null;
  },
  priority: 'warning'
});

export const conditionalRequired = (condition: (context: any) => boolean, message?: string): ValidationRule<string> => ({
  name: 'conditionalRequired',
  validate: (value: string, context?: any) => {
    if (condition(context) && (!value || value.trim() === '')) {
      return message || 'This field is required';
    }
    return null;
  },
  priority: 'error'
});