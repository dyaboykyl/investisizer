import { useCallback, useEffect, useRef, useState } from 'react';
import { type FieldValidationConfig, type FieldValidationState, type FormValidationConfig, type ValidationContext, type ValidationResult } from './types';
import { Validator } from './validator';

export interface UseValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface UseFormValidationResult {
  validator: Validator;
  validateField: (fieldName: string, value: any) => ValidationResult;
  validateForm: (values: Record<string, any>) => ValidationResult;
  getFieldState: (fieldName: string) => FieldValidationState | null;
  markFieldTouched: (fieldName: string) => void;
  markFieldDirty: (fieldName: string) => void;
  isFormValid: () => boolean;
  getFormErrors: () => string[];
  getFormWarnings: () => string[];
  clearValidation: () => void;
  clearFieldValidation: (fieldName: string) => void;
  updateContext: (context: ValidationContext) => void;
}

/**
 * Hook for form validation using the Validator class
 */
export function useFormValidation(
  config: FormValidationConfig,
  context: ValidationContext = {},
  _options: UseValidationOptions = {}
): UseFormValidationResult {
  // Options parameter available for future extensibility
  const [validator] = useState(() => new Validator(config, context));
  const [, forceUpdate] = useState(0);

  // Force re-render when validation state changes
  const triggerUpdate = useCallback(() => {
    forceUpdate(prev => prev + 1);
  }, []);

  // Update validator context when context changes
  useEffect(() => {
    validator.updateContext(context);
  }, [validator, context]);

  const validateField = useCallback((fieldName: string, value: any): ValidationResult => {
    const result = validator.validateField(fieldName, value);
    triggerUpdate();
    return result;
  }, [validator, triggerUpdate]);

  const validateForm = useCallback((values: Record<string, any>): ValidationResult => {
    const result = validator.validateForm(values);
    triggerUpdate();
    return result;
  }, [validator, triggerUpdate]);

  const getFieldState = useCallback((fieldName: string): FieldValidationState | null => {
    return validator.getFieldState(fieldName);
  }, [validator]);

  const markFieldTouched = useCallback((fieldName: string) => {
    validator.markFieldTouched(fieldName);
    triggerUpdate();
  }, [validator, triggerUpdate]);

  const markFieldDirty = useCallback((fieldName: string) => {
    validator.markFieldDirty(fieldName);
    triggerUpdate();
  }, [validator, triggerUpdate]);

  const isFormValid = useCallback(() => {
    return validator.isFormValid();
  }, [validator]);

  const getFormErrors = useCallback(() => {
    return validator.getFormErrors();
  }, [validator]);

  const getFormWarnings = useCallback(() => {
    return validator.getFormWarnings();
  }, [validator]);

  const clearValidation = useCallback(() => {
    validator.clearValidation();
    triggerUpdate();
  }, [validator, triggerUpdate]);

  const clearFieldValidation = useCallback((fieldName: string) => {
    validator.clearFieldValidation(fieldName);
    triggerUpdate();
  }, [validator, triggerUpdate]);

  const updateContext = useCallback((newContext: ValidationContext) => {
    validator.updateContext(newContext);
    triggerUpdate();
  }, [validator, triggerUpdate]);

  return {
    validator,
    validateField,
    validateForm,
    getFieldState,
    markFieldTouched,
    markFieldDirty,
    isFormValid,
    getFormErrors,
    getFormWarnings,
    clearValidation,
    clearFieldValidation,
    updateContext
  };
}

/**
 * Hook for validating a single field
 */
export function useFieldValidation(
  fieldName: string,
  config: FieldValidationConfig,
  context: ValidationContext = {},
  options: UseValidationOptions = {}
) {
  const formConfig = { [fieldName]: config };
  const {
    validateField,
    getFieldState,
    markFieldTouched,
    markFieldDirty,
    clearFieldValidation,
    updateContext
  } = useFormValidation(formConfig, context, options);

  const validate = useCallback((value: any) => {
    return validateField(fieldName, value);
  }, [validateField, fieldName]);

  const correctValue = useCallback((value: any) => {
    // Apply correction functions from validation rules
    let correctedValue = value;
    for (const rule of config.rules) {
      if (rule.correct && rule.validate(correctedValue, context)) {
        console.log("Applying correction rule:", rule.name);
        correctedValue = rule.correct(correctedValue, context);
      }
    }
    return correctedValue;
  }, [config.rules, context]);

  const state = getFieldState(fieldName);

  const markTouched = useCallback(() => {
    markFieldTouched(fieldName);
  }, [markFieldTouched, fieldName]);

  const markDirty = useCallback(() => {
    markFieldDirty(fieldName);
  }, [markFieldDirty, fieldName]);

  const clear = useCallback(() => {
    clearFieldValidation(fieldName);
  }, [clearFieldValidation, fieldName]);

  return {
    validate,
    correctValue,
    state,
    markTouched,
    markDirty,
    clear,
    updateContext
  };
}

/**
 * Hook for real-time validation with debouncing
 */
export function useRealtimeValidation(
  value: any,
  config: FieldValidationConfig,
  context: ValidationContext = {},
  debounceMs: number = 300
): ValidationResult {
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  const validator = useRef<Validator>(new Validator({ field: config }, context));
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update context
  useEffect(() => {
    validator.current.updateContext(context);
  }, [context]);

  // Validate with debouncing
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const validationResult = validator.current.validateField('field', value);
      setResult(validationResult);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value, debounceMs]);

  return result;
}

/**
 * Hook for integrating with MobX stores
 */
export function useStoreValidation<T>(
  store: T,
  getValues: (store: T) => Record<string, any>,
  config: FormValidationConfig,
  context: ValidationContext = {}
) {
  const {
    validateForm,
    getFormErrors,
    getFormWarnings,
    isFormValid,
    updateContext
  } = useFormValidation(config, context);

  const validate = useCallback(() => {
    const values = getValues(store);
    return validateForm(values);
  }, [store, getValues, validateForm]);

  const errors = getFormErrors();
  const warnings = getFormWarnings();
  const valid = isFormValid();

  return {
    validate,
    errors,
    warnings,
    valid,
    updateContext
  };
}