export interface ValidationRule<T = any> {
  name: string;
  validate: (value: T, context?: any) => string | null;
  priority?: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FieldValidationConfig<T = any> {
  rules: ValidationRule<T>[];
  required?: boolean;
  debounceMs?: number;
}

export interface FormValidationConfig {
  [fieldName: string]: FieldValidationConfig;
}

export interface ValidationContext {
  [key: string]: any;
}

export interface FieldValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isDirty: boolean;
  isTouched: boolean;
}