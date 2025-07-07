import { getStateTaxInfo, hasCapitalGainsTax, getStateTaxRate } from '../data/StateTaxRates';

export interface StateTaxCalculation {
  stateCode: string;
  stateName: string;
  hasCapitalGainsTax: boolean;
  taxableGain: number;
  taxRate: number;
  taxAmount: number;
  notes?: string;
  isSimplified?: boolean;
}

/**
 * State Capital Gains Tax Calculator
 * 
 * Calculates state capital gains taxes using simplified tax rates.
 * This is a simplified calculator that uses flat rates per state.
 * 
 * Important Notes:
 * - Many states have progressive tax brackets similar to federal taxes
 * - Some states have special rules for capital gains (exclusions, deductions)
 * - Local taxes may apply in some jurisdictions
 * - This calculator provides estimates only
 */
export class StateTaxCalculator {
  /**
   * Calculate state capital gains tax
   */
  static calculateStateTax(
    capitalGain: number,
    stateCode: string
  ): StateTaxCalculation {
    const stateInfo = getStateTaxInfo(stateCode);
    
    if (!stateInfo) {
      return {
        stateCode: stateCode.toUpperCase(),
        stateName: 'Unknown State',
        hasCapitalGainsTax: false,
        taxableGain: 0,
        taxRate: 0,
        taxAmount: 0,
        notes: 'State not found in tax database',
      };
    }

    // Ensure we're working with positive numbers for tax calculation
    const taxableGain = Math.max(0, capitalGain);
    
    if (!stateInfo.hasCapitalGainsTax || taxableGain === 0) {
      return {
        stateCode: stateInfo.code,
        stateName: stateInfo.name,
        hasCapitalGainsTax: stateInfo.hasCapitalGainsTax,
        taxableGain,
        taxRate: 0,
        taxAmount: 0,
        notes: stateInfo.notes,
        isSimplified: stateInfo.isSimplified,
      };
    }

    const taxAmount = taxableGain * stateInfo.rate;

    return {
      stateCode: stateInfo.code,
      stateName: stateInfo.name,
      hasCapitalGainsTax: stateInfo.hasCapitalGainsTax,
      taxableGain,
      taxRate: stateInfo.rate,
      taxAmount,
      notes: stateInfo.notes,
      isSimplified: stateInfo.isSimplified,
    };
  }

  /**
   * Calculate state tax after Section 121 exclusion
   */
  static calculateStateTaxAfterExclusion(
    totalCapitalGain: number,
    section121ExcludedAmount: number,
    stateCode: string
  ): StateTaxCalculation {
    const remainingGain = Math.max(0, totalCapitalGain - section121ExcludedAmount);
    return this.calculateStateTax(remainingGain, stateCode);
  }

  /**
   * Calculate combined federal and state tax
   */
  static calculateCombinedTax(
    capitalGain: number,
    stateCode: string,
    federalTaxAmount: number
  ): {
    federalTax: number;
    stateTax: number;
    totalTax: number;
    effectiveRate: number;
    stateCalculation: StateTaxCalculation;
  } {
    const stateCalculation = this.calculateStateTax(capitalGain, stateCode);
    const stateTax = stateCalculation.taxAmount;
    const totalTax = federalTaxAmount + stateTax;
    const effectiveRate = capitalGain > 0 ? totalTax / capitalGain : 0;

    return {
      federalTax: federalTaxAmount,
      stateTax,
      totalTax,
      effectiveRate,
      stateCalculation,
    };
  }

  /**
   * Get state tax rate for a given state
   */
  static getStateTaxRate(stateCode: string): number {
    return getStateTaxRate(stateCode);
  }

  /**
   * Check if state has capital gains tax
   */
  static hasCapitalGainsTax(stateCode: string): boolean {
    return hasCapitalGainsTax(stateCode);
  }

  /**
   * Get state information
   */
  static getStateInfo(stateCode: string) {
    return getStateTaxInfo(stateCode);
  }

  /**
   * Format tax rate as percentage
   */
  static formatTaxRate(rate: number): string {
    return `${(rate * 100).toFixed(1)}%`;
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

  /**
   * Get tax comparison for multiple states
   */
  static compareStates(
    capitalGain: number,
    stateCodes: string[]
  ): Array<StateTaxCalculation & { savings?: number }> {
    const calculations = stateCodes.map(code => this.calculateStateTax(capitalGain, code));
    
    // Find the highest tax amount for comparison
    const maxTax = Math.max(...calculations.map(calc => calc.taxAmount));
    
    return calculations.map(calc => ({
      ...calc,
      savings: maxTax - calc.taxAmount,
    }));
  }

  /**
   * Estimate tax for common relocation scenarios
   */
  static getRelocationTaxImpact(
    capitalGain: number,
    fromState: string,
    toState: string
  ): {
    fromStateCalculation: StateTaxCalculation;
    toStateCalculation: StateTaxCalculation;
    taxDifference: number;
    savings: number;
    recommendation: string;
  } {
    const fromCalc = this.calculateStateTax(capitalGain, fromState);
    const toCalc = this.calculateStateTax(capitalGain, toState);
    const taxDifference = toCalc.taxAmount - fromCalc.taxAmount;
    const savings = fromCalc.taxAmount - toCalc.taxAmount;

    let recommendation: string;
    if (Math.abs(taxDifference) < 1000) {
      recommendation = 'Tax impact is minimal between these states';
    } else if (taxDifference > 0) {
      recommendation = `Moving to ${toCalc.stateName} would increase tax by ${this.formatCurrency(Math.abs(taxDifference))}`;
    } else {
      recommendation = `Moving to ${toCalc.stateName} would save ${this.formatCurrency(Math.abs(taxDifference))} in taxes`;
    }

    return {
      fromStateCalculation: fromCalc,
      toStateCalculation: toCalc,
      taxDifference,
      savings,
      recommendation,
    };
  }

  /**
   * Get states with no capital gains tax for optimization scenarios
   */
  static getNoTaxStates(): string[] {
    return ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WY'];
  }

  /**
   * Calculate potential savings by moving to a no-tax state
   */
  static calculateNoTaxStateSavings(
    capitalGain: number,
    currentState: string
  ): {
    currentTax: number;
    potentialSavings: number;
    noTaxStates: string[];
    recommendation: string;
  } {
    const currentCalc = this.calculateStateTax(capitalGain, currentState);
    const noTaxStates = this.getNoTaxStates();
    const potentialSavings = currentCalc.taxAmount;

    let recommendation: string;
    if (potentialSavings === 0) {
      recommendation = `${currentCalc.stateName} already has no capital gains tax`;
    } else if (potentialSavings < 5000) {
      recommendation = 'Tax savings from relocation may not justify moving costs';
    } else if (potentialSavings < 25000) {
      recommendation = 'Moderate tax savings possible, consider relocation costs and other factors';
    } else {
      recommendation = 'Significant tax savings possible, relocation may be worthwhile for large gains';
    }

    return {
      currentTax: currentCalc.taxAmount,
      potentialSavings,
      noTaxStates,
      recommendation,
    };
  }
}