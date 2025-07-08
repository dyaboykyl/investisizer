import { Validator } from './validator';
import { type FormValidationConfig } from './types';
import * as rules from './rules';

describe('Validator', () => {
  let validator: Validator;
  let config: FormValidationConfig;

  beforeEach(() => {
    config = {
      name: {
        rules: [rules.required, rules.minLength(2)],
        required: true
      },
      email: {
        rules: [rules.required, rules.email],
        required: true
      },
      age: {
        rules: [rules.numeric, rules.minValue(18), rules.maxValue(100)],
        required: false
      },
      price: {
        rules: [
          rules.numeric,
          rules.positive,
          rules.currency,
          rules.highPercentageWarning(1000, 'Price above $1000 is high')
        ],
        required: true
      }
    };
    validator = new Validator(config);
  });

  describe('Field Validation', () => {
    it('should validate required fields', () => {
      const result = validator.validateField('name', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('should validate field rules', () => {
      const result = validator.validateField('name', 'A');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be at least 2 characters');
    });

    it('should validate email format', () => {
      const result = validator.validateField('email', 'invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Please enter a valid email address');
    });

    it('should validate numeric fields', () => {
      const result = validator.validateField('age', 'not-a-number');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be a valid number');
    });

    it('should validate ranges', () => {
      const result = validator.validateField('age', '150');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Must be no more than 100');
    });

    it('should generate warnings', () => {
      const result = validator.validateField('price', '1500');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Price above $1000 is high');
    });

    it('should validate valid input', () => {
      const result = validator.validateField('name', 'John Doe');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle non-existent fields', () => {
      const result = validator.validateField('nonExistent', 'value');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Form Validation', () => {
    it('should validate entire form', () => {
      const values = {
        name: 'John',
        email: 'john@example.com',
        age: '25',
        price: '500'
      };

      const result = validator.validateForm(values);
      expect(result.isValid).toBe(true);
    });

    it('should collect all errors', () => {
      const values = {
        name: '',
        email: 'invalid',
        age: '200',
        price: '-100'
      };

      const result = validator.validateForm(values);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should collect warnings', () => {
      const values = {
        name: 'John',
        email: 'john@example.com',
        age: '25',
        price: '1500'
      };

      const result = validator.validateForm(values);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Price above $1000 is high');
    });
  });

  describe('Field State Management', () => {
    it('should track field state', () => {
      validator.validateField('name', 'John');
      const state = validator.getFieldState('name');
      
      expect(state).not.toBeNull();
      expect(state!.isValid).toBe(true);
      expect(state!.isDirty).toBe(false);
      expect(state!.isTouched).toBe(false);
    });

    it('should mark field as touched', () => {
      validator.validateField('name', 'John');
      validator.markFieldTouched('name');
      
      const state = validator.getFieldState('name');
      expect(state!.isTouched).toBe(true);
    });

    it('should mark field as dirty', () => {
      validator.validateField('name', 'John');
      validator.markFieldDirty('name');
      
      const state = validator.getFieldState('name');
      expect(state!.isDirty).toBe(true);
    });
  });

  describe('Context Validation', () => {
    it('should use validation context', () => {
      const contextConfig: FormValidationConfig = {
        salePrice: {
          rules: [
            rules.conditionalRequired(
              (context) => context.saleEnabled,
              'Sale price is required when sale is enabled'
            ),
            rules.numeric,
            rules.positive
          ]
        }
      };

      const validator = new Validator(contextConfig, { saleEnabled: true });
      
      const result = validator.validateField('salePrice', '');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Sale price is required when sale is enabled');
    });

    it('should update context dynamically', () => {
      const contextConfig: FormValidationConfig = {
        salePrice: {
          rules: [
            rules.conditionalRequired(
              (context) => context.saleEnabled,
              'Sale price is required when sale is enabled'
            )
          ]
        }
      };

      const validator = new Validator(contextConfig, { saleEnabled: false });
      
      // Initially should be valid (sale not enabled)
      let result = validator.validateField('salePrice', '');
      expect(result.isValid).toBe(true);
      
      // Update context to enable sale
      validator.updateContext({ saleEnabled: true });
      
      // Now should be invalid
      result = validator.validateField('salePrice', '');
      expect(result.isValid).toBe(false);
    });
  });

  describe('Debouncing', () => {
    it('should debounce field validation', (done) => {
      const callback = jest.fn();
      
      validator.validateFieldDebounced('name', 'John', callback);
      validator.validateFieldDebounced('name', 'John Doe', callback);
      
      // Should not call callback immediately
      expect(callback).not.toHaveBeenCalled();
      
      // Should call callback after debounce period
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        done();
      }, 350);
    });
  });

  describe('Cleanup', () => {
    it('should clear all validation', () => {
      validator.validateField('name', 'John');
      validator.validateField('email', 'john@example.com');
      
      expect(validator.getAllFieldStates().size).toBe(2);
      
      validator.clearValidation();
      expect(validator.getAllFieldStates().size).toBe(0);
    });

    it('should clear specific field validation', () => {
      validator.validateField('name', 'John');
      validator.validateField('email', 'john@example.com');
      
      expect(validator.getFieldState('name')).not.toBeNull();
      
      validator.clearFieldValidation('name');
      expect(validator.getFieldState('name')).toBeNull();
      expect(validator.getFieldState('email')).not.toBeNull();
    });
  });

  describe('Form Status', () => {
    it('should check if form is valid', () => {
      validator.validateField('name', 'John');
      validator.validateField('email', 'john@example.com');
      
      expect(validator.isFormValid()).toBe(true);
      
      validator.validateField('age', '200');
      expect(validator.isFormValid()).toBe(false);
    });

    it('should get form errors', () => {
      validator.validateField('name', '');
      validator.validateField('email', 'invalid');
      
      const errors = validator.getFormErrors();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('This field is required');
    });

    it('should get form warnings', () => {
      validator.validateField('price', '1500');
      
      const warnings = validator.getFormWarnings();
      expect(warnings).toContain('Price above $1000 is high');
    });
  });
});