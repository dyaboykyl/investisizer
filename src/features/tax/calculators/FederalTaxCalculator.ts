import type { FilingStatus } from '../stores/TaxProfileStore';

export interface CapitalGainsTaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface FederalTaxCalculation {
  taxableGain: number;
  taxRate: number;
  taxAmount: number;
  bracketInfo: {
    min: number;
    max: number;
    rate: number;
  };
}

export class FederalTaxCalculator {
  private static readonly TAX_BRACKETS_2024: Record<FilingStatus, CapitalGainsTaxBracket[]> = {
    single: [
      { min: 0, max: 47025, rate: 0.00 },
      { min: 47025, max: 518900, rate: 0.15 },
      { min: 518900, max: Infinity, rate: 0.20 },
    ],
    married_joint: [
      { min: 0, max: 94050, rate: 0.00 },
      { min: 94050, max: 583750, rate: 0.15 },
      { min: 583750, max: Infinity, rate: 0.20 },
    ],
    married_separate: [
      { min: 0, max: 47025, rate: 0.00 },
      { min: 47025, max: 291875, rate: 0.15 },
      { min: 291875, max: Infinity, rate: 0.20 },
    ],
    head_of_household: [
      { min: 0, max: 63000, rate: 0.00 },
      { min: 63000, max: 551350, rate: 0.15 },
      { min: 551350, max: Infinity, rate: 0.20 },
    ],
  };

  /**
   * Determine the federal capital gains tax rate based on annual income and filing status
   */
  static getCapitalGainsRate(annualIncome: number, filingStatus: FilingStatus): number {
    const brackets = this.TAX_BRACKETS_2024[filingStatus];
    
    for (const bracket of brackets) {
      if (annualIncome >= bracket.min && annualIncome < bracket.max) {
        return bracket.rate;
      }
    }
    
    // Should never reach here with proper bracket setup, but return highest rate as fallback
    return brackets[brackets.length - 1].rate;
  }

  /**
   * Get the tax bracket information for a given income and filing status
   */
  static getTaxBracket(annualIncome: number, filingStatus: FilingStatus): CapitalGainsTaxBracket {
    const brackets = this.TAX_BRACKETS_2024[filingStatus];
    
    for (const bracket of brackets) {
      if (annualIncome >= bracket.min && annualIncome < bracket.max) {
        return bracket;
      }
    }
    
    // Return highest bracket as fallback
    return brackets[brackets.length - 1];
  }

  /**
   * Calculate federal capital gains tax
   */
  static calculateFederalTax(
    capitalGain: number,
    annualIncome: number,
    filingStatus: FilingStatus
  ): FederalTaxCalculation {
    // Ensure we're working with positive numbers
    const taxableGain = Math.max(0, capitalGain);
    
    if (taxableGain === 0) {
      return {
        taxableGain: 0,
        taxRate: 0,
        taxAmount: 0,
        bracketInfo: { min: 0, max: 0, rate: 0 },
      };
    }

    const taxRate = this.getCapitalGainsRate(annualIncome, filingStatus);
    const bracket = this.getTaxBracket(annualIncome, filingStatus);
    const taxAmount = taxableGain * taxRate;

    return {
      taxableGain,
      taxRate,
      taxAmount,
      bracketInfo: {
        min: bracket.min,
        max: bracket.max === Infinity ? Number.MAX_SAFE_INTEGER : bracket.max,
        rate: bracket.rate,
      },
    };
  }

  /**
   * Calculate federal tax with adjustments for other gains/losses
   */
  static calculateFederalTaxWithAdjustments(
    capitalGain: number,
    annualIncome: number,
    filingStatus: FilingStatus,
    otherCapitalGains: number = 0,
    carryoverLosses: number = 0
  ): FederalTaxCalculation {
    // Apply carryover losses first (reduces gain)
    let adjustedGain = capitalGain - Math.abs(carryoverLosses);
    
    // Add other capital gains
    adjustedGain += otherCapitalGains;
    
    // Calculate tax on the adjusted gain
    return this.calculateFederalTax(adjustedGain, annualIncome, filingStatus);
  }

  /**
   * Get all available tax brackets for a filing status
   */
  static getTaxBrackets(filingStatus: FilingStatus): CapitalGainsTaxBracket[] {
    return [...this.TAX_BRACKETS_2024[filingStatus]];
  }

  /**
   * Format tax rate as percentage string
   */
  static formatTaxRate(rate: number): string {
    return `${(rate * 100).toFixed(0)}%`;
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}