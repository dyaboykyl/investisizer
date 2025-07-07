/**
 * Tax-related type definitions
 */

export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';

export interface TaxCalculationResult {
  taxableGain: number;
  taxRate: number;
  taxAmount: number;
  bracketInfo: {
    min: number;
    max: number;
    rate: number;
  };
}