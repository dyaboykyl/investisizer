import { type ValidationResult, type FieldValidationConfig, type FormValidationConfig, type ValidationContext, type FieldValidationState } from './types';

export class Validator {
  private config: FormValidationConfig;
  private context: ValidationContext;
  private fieldStates: Map<string, FieldValidationState> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: FormValidationConfig, context: ValidationContext = {}) {
    this.config = config;
    this.context = context;
  }

  /**
   * Update the validation context (useful for dynamic validation)
   */
  updateContext(context: ValidationContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Add or update a field configuration
   */
  addField(fieldName: string, config: FieldValidationConfig): void {
    this.config[fieldName] = config;
  }

  /**
   * Remove a field from validation
   */
  removeField(fieldName: string): void {
    delete this.config[fieldName];
    this.fieldStates.delete(fieldName);
    const timer = this.debounceTimers.get(fieldName);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(fieldName);
    }
  }

  /**
   * Validate a single field
   */
  validateField(fieldName: string, value: any, _options: { skipDebounce?: boolean } = {}): ValidationResult {
    const fieldConfig = this.config[fieldName];
    if (!fieldConfig) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required validation first
    if (fieldConfig.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push('This field is required');
    }

    // Run all validation rules
    for (const rule of fieldConfig.rules) {
      const result = rule.validate(value, this.context);
      if (result) {
        if (rule.priority === 'warning') {
          warnings.push(result);
        } else {
          errors.push(result);
        }
      }
    }

    const validationResult: ValidationResult = {
      isValid: errors.length === 0,
      errors: [...new Set(errors)], // Remove duplicates
      warnings: [...new Set(warnings)]
    };

    // Update field state
    this.updateFieldState(fieldName, validationResult);

    return validationResult;
  }

  /**
   * Validate a field with debouncing
   */
  validateFieldDebounced(fieldName: string, value: any, callback?: (result: ValidationResult) => void): void {
    const fieldConfig = this.config[fieldName];
    if (!fieldConfig) return;

    const debounceMs = fieldConfig.debounceMs || 300;
    
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(fieldName);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      const result = this.validateField(fieldName, value, { skipDebounce: true });
      callback?.(result);
      this.debounceTimers.delete(fieldName);
    }, debounceMs);

    this.debounceTimers.set(fieldName, timer);
  }

  /**
   * Validate all fields
   */
  validateForm(values: Record<string, any>): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const fieldName in this.config) {
      const value = values[fieldName];
      const result = this.validateField(fieldName, value);
      
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: [...new Set(allErrors)],
      warnings: [...new Set(allWarnings)]
    };
  }

  /**
   * Get the current validation state for a field
   */
  getFieldState(fieldName: string): FieldValidationState | null {
    return this.fieldStates.get(fieldName) || null;
  }

  /**
   * Get all field states
   */
  getAllFieldStates(): Map<string, FieldValidationState> {
    return new Map(this.fieldStates);
  }

  /**
   * Mark a field as touched
   */
  markFieldTouched(fieldName: string): void {
    const state = this.fieldStates.get(fieldName);
    if (state) {
      state.isTouched = true;
    }
  }

  /**
   * Mark a field as dirty
   */
  markFieldDirty(fieldName: string): void {
    const state = this.fieldStates.get(fieldName);
    if (state) {
      state.isDirty = true;
    }
  }

  /**
   * Check if the entire form is valid
   */
  isFormValid(): boolean {
    for (const [, state] of this.fieldStates) {
      if (!state.isValid) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all form errors
   */
  getFormErrors(): string[] {
    const errors: string[] = [];
    for (const [, state] of this.fieldStates) {
      errors.push(...state.errors);
    }
    return [...new Set(errors)];
  }

  /**
   * Get all form warnings
   */
  getFormWarnings(): string[] {
    const warnings: string[] = [];
    for (const [, state] of this.fieldStates) {
      warnings.push(...state.warnings);
    }
    return [...new Set(warnings)];
  }

  /**
   * Clear all validation states
   */
  clearValidation(): void {
    this.fieldStates.clear();
    // Clear all debounce timers
    for (const [, timer] of this.debounceTimers) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  /**
   * Clear validation for a specific field
   */
  clearFieldValidation(fieldName: string): void {
    this.fieldStates.delete(fieldName);
    const timer = this.debounceTimers.get(fieldName);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(fieldName);
    }
  }

  private updateFieldState(fieldName: string, result: ValidationResult): void {
    const existingState = this.fieldStates.get(fieldName);
    
    const newState: FieldValidationState = {
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      isDirty: existingState?.isDirty || false,
      isTouched: existingState?.isTouched || false
    };

    this.fieldStates.set(fieldName, newState);
  }
}