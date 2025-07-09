// @ts-ignore
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ValidatedInput } from './ValidatedInput';
import { ValidatedCurrencyInput } from './ValidatedCurrencyInput';
import { ValidatedPercentageInput } from './ValidatedPercentageInput';
import { ValidatedYearInput } from './ValidatedYearInput';
import * as rules from '@/features/shared/validation/rules';
import { type FieldValidationConfig } from '@/features/shared/validation/types';

describe('ValidatedInput Value Correction', () => {
  describe('Basic ValidatedInput with correction', () => {
    it('should correct negative value to 0 on blur', async () => {
      const onChange = jest.fn();
      const validationConfig: FieldValidationConfig = {
        rules: [rules.numeric, rules.minValue(0)]
      };

      render(
        <ValidatedInput
          label="Test Input"
          value="-5"
          onChange={onChange}
          validationConfig={validationConfig}
          validateOnBlur={true}
        />
      );

      const input = screen.getByDisplayValue('-5');
      
      // Blur should trigger correction
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('0');
      });
    });

    it('should correct value above maximum on blur', async () => {
      const onChange = jest.fn();
      const validationConfig: FieldValidationConfig = {
        rules: [rules.numeric, rules.maxValue(100)]
      };

      render(
        <ValidatedInput
          label="Test Input"
          value="150"
          onChange={onChange}
          validationConfig={validationConfig}
          validateOnBlur={true}
        />
      );

      const input = screen.getByDisplayValue('150');
      
      // Blur should trigger correction
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('100');
      });
    });

    it('should correct non-integer values to integers', async () => {
      const onChange = jest.fn();
      const validationConfig: FieldValidationConfig = {
        rules: [rules.numeric, rules.integer]
      };

      render(
        <ValidatedInput
          label="Test Input"
          value="3.7"
          onChange={onChange}
          validationConfig={validationConfig}
          validateOnBlur={true}
        />
      );

      const input = screen.getByDisplayValue('3.7');
      
      // Blur should trigger correction (round to nearest integer)
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('4');
      });
    });

    it('should not trigger correction for valid values', async () => {
      const onChange = jest.fn();
      const validationConfig: FieldValidationConfig = {
        rules: [rules.numeric, rules.minValue(0), rules.maxValue(100)]
      };

      render(
        <ValidatedInput
          label="Test Input"
          value="50"
          onChange={onChange}
          validationConfig={validationConfig}
          validateOnBlur={true}
        />
      );

      const input = screen.getByDisplayValue('50');
      
      // Blur should not trigger correction for valid value
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('ValidatedCurrencyInput correction', () => {
    it('should correct negative currency values to 0', async () => {
      const onChange = jest.fn();

      render(
        <ValidatedCurrencyInput
          label="Amount"
          value="-100"
          onChange={onChange}
          minValue={0}
          maxValue={10000}
        />
      );

      const input = screen.getByDisplayValue('-100');
      
      // Blur should correct to 0
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('0');
      });
    });

    it('should correct values above maximum', async () => {
      const onChange = jest.fn();

      render(
        <ValidatedCurrencyInput
          label="Amount"
          value="15000"
          onChange={onChange}
          minValue={0}
          maxValue={10000}
        />
      );

      const input = screen.getByDisplayValue('15000');
      
      // Blur should correct to maximum
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('10000');
      });
    });
  });

  describe('ValidatedPercentageInput correction', () => {
    it('should correct negative percentage to 0', async () => {
      const onChange = jest.fn();

      render(
        <ValidatedPercentageInput
          label="Percentage"
          value="-5"
          onChange={onChange}
          minValue={0}
          maxValue={100}
        />
      );

      const input = screen.getByDisplayValue('-5');
      
      // Blur should correct to 0
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('0');
      });
    });

    it('should correct percentage above 100', async () => {
      const onChange = jest.fn();

      render(
        <ValidatedPercentageInput
          label="Percentage"
          value="150"
          onChange={onChange}
          minValue={0}
          maxValue={100}
        />
      );

      const input = screen.getByDisplayValue('150');
      
      // Blur should correct to 100
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('100');
      });
    });
  });

  describe('ValidatedYearInput correction', () => {
    it('should correct year below minimum', async () => {
      const onChange = jest.fn();

      render(
        <ValidatedYearInput
          label="Year"
          value="1800"
          onChange={onChange}
          minYear={1900}
          maxYear={2100}
        />
      );

      const input = screen.getByDisplayValue('1800');
      
      // Blur should correct to minimum year
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('1900');
      });
    });

    it('should correct year above maximum', async () => {
      const onChange = jest.fn();

      render(
        <ValidatedYearInput
          label="Year"
          value="2200"
          onChange={onChange}
          minYear={1900}
          maxYear={2100}
        />
      );

      const input = screen.getByDisplayValue('2200');
      
      // Blur should correct to maximum year
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('2100');
      });
    });

    it('should correct decimal year to integer', async () => {
      const onChange = jest.fn();

      render(
        <ValidatedYearInput
          label="Year"
          value="2023.7"
          onChange={onChange}
          minYear={1900}
          maxYear={2100}
        />
      );

      const input = screen.getByDisplayValue('2023.7');
      
      // Blur should correct to rounded integer
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('2024');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string values', async () => {
      const onChange = jest.fn();
      const validationConfig: FieldValidationConfig = {
        rules: [rules.numeric, rules.minValue(0)]
      };

      render(
        <ValidatedInput
          label="Test Input"
          value=""
          onChange={onChange}
          validationConfig={validationConfig}
          validateOnBlur={true}
        />
      );

      const input = screen.getByDisplayValue('');
      
      // Blur should not trigger correction for empty string
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).not.toHaveBeenCalled();
      });
    });

    it('should handle non-numeric values', async () => {
      const onChange = jest.fn();
      const validationConfig: FieldValidationConfig = {
        rules: [rules.numeric, rules.minValue(0)]
      };

      render(
        <ValidatedInput
          label="Test Input"
          value="abc"
          onChange={onChange}
          validationConfig={validationConfig}
          validateOnBlur={true}
        />
      );

      const input = screen.getByDisplayValue('abc');
      
      // Blur should not trigger correction for non-numeric values
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });
});