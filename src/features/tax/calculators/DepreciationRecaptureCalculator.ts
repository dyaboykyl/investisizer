/**
 * Depreciation Recapture Tax Calculator
 * 
 * Handles calculation of depreciation recapture taxes under Section 1250 for real estate.
 * Depreciation recapture is taxed at a maximum rate of 25% for real property.
 * 
 * Key concepts:
 * - Depreciation taken reduces the property's basis
 * - When sold, depreciation is "recaptured" and taxed at ordinary income rates (up to 25% max)
 * - Only applies to depreciation actually taken (or allowed to be taken)
 * - Section 121 exclusion does NOT apply to depreciation recapture
 */

export interface DepreciationRecaptureInputs {
  /** Total depreciation taken over ownership period */
  totalDepreciationTaken: number;
  /** Annual income for tax bracket determination */
  annualIncome: number;
  /** Filing status for tax calculations */
  filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
}

export interface DepreciationRecaptureResult {
  /** Amount of depreciation subject to recapture */
  recaptureAmount: number;
  /** Tax rate applied to recapture (capped at 25%) */
  recaptureRate: number;
  /** Tax owed on depreciation recapture */
  recaptureTax: number;
  /** Whether recapture applies */
  hasRecapture: boolean;
  /** Explanation of calculation */
  notes: string;
}

export class DepreciationRecaptureCalculator {
  /**
   * Calculate depreciation recapture tax
   */
  static calculateRecapture(inputs: DepreciationRecaptureInputs): DepreciationRecaptureResult {
    const { totalDepreciationTaken, annualIncome, filingStatus } = inputs;

    // No recapture if no depreciation was taken
    if (totalDepreciationTaken <= 0) {
      return {
        recaptureAmount: 0,
        recaptureRate: 0,
        recaptureTax: 0,
        hasRecapture: false,
        notes: 'No depreciation recapture - no depreciation taken'
      };
    }

    // Determine ordinary income tax rate for comparison
    const ordinaryRate = this.getOrdinaryIncomeRate(annualIncome, filingStatus);
    
    // Depreciation recapture is taxed at ordinary income rates, capped at 25%
    const recaptureRate = Math.min(ordinaryRate, 0.25);
    
    const recaptureTax = totalDepreciationTaken * recaptureRate;

    return {
      recaptureAmount: totalDepreciationTaken,
      recaptureRate,
      recaptureTax,
      hasRecapture: true,
      notes: `Depreciation recapture taxed at ${(recaptureRate * 100).toFixed(1)}% (ordinary income rate capped at 25%)`
    };
  }

  /**
   * Calculate annual depreciation for a residential rental property
   * Residential rental properties depreciate over 27.5 years
   */
  static calculateAnnualDepreciation(
    propertyValue: number,
    landValue: number = 0,
    isResidential: boolean = true
  ): number {
    const depreciableBasis = propertyValue - landValue;
    const depreciationPeriod = isResidential ? 27.5 : 39; // 27.5 years for residential, 39 for commercial
    
    return depreciableBasis / depreciationPeriod;
  }

  /**
   * Calculate total depreciation over ownership period
   */
  static calculateTotalDepreciation(
    propertyValue: number,
    landValue: number = 0,
    yearsOwned: number,
    isResidential: boolean = true
  ): number {
    const annualDepreciation = this.calculateAnnualDepreciation(propertyValue, landValue, isResidential);
    return annualDepreciation * yearsOwned;
  }

  /**
   * Get ordinary income tax rate for depreciation recapture calculation
   * Simplified brackets for 2024
   */
  private static getOrdinaryIncomeRate(income: number, filingStatus: string): number {
    // 2024 tax brackets (simplified)
    const brackets = {
      single: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 }
      ],
      married_joint: [
        { min: 0, max: 23200, rate: 0.10 },
        { min: 23200, max: 94300, rate: 0.12 },
        { min: 94300, max: 201050, rate: 0.22 },
        { min: 201050, max: 383900, rate: 0.24 },
        { min: 383900, max: 487450, rate: 0.32 },
        { min: 487450, max: 731200, rate: 0.35 },
        { min: 731200, max: Infinity, rate: 0.37 }
      ],
      married_separate: [
        { min: 0, max: 11600, rate: 0.10 },
        { min: 11600, max: 47150, rate: 0.12 },
        { min: 47150, max: 100525, rate: 0.22 },
        { min: 100525, max: 191950, rate: 0.24 },
        { min: 191950, max: 243725, rate: 0.32 },
        { min: 243725, max: 365600, rate: 0.35 },
        { min: 365600, max: Infinity, rate: 0.37 }
      ],
      head_of_household: [
        { min: 0, max: 16550, rate: 0.10 },
        { min: 16550, max: 63100, rate: 0.12 },
        { min: 63100, max: 100500, rate: 0.22 },
        { min: 100500, max: 191950, rate: 0.24 },
        { min: 191950, max: 243700, rate: 0.32 },
        { min: 243700, max: 609350, rate: 0.35 },
        { min: 609350, max: Infinity, rate: 0.37 }
      ]
    };

    const applicableBrackets = brackets[filingStatus as keyof typeof brackets] || brackets.single;
    
    // Find the marginal tax rate
    for (const bracket of applicableBrackets) {
      if (income >= bracket.min && income < bracket.max) {
        return bracket.rate;
      }
    }
    
    // Default to highest bracket
    return 0.37;
  }

  /**
   * Estimate land value as percentage of total property value
   * This is a simplified approach - in practice, land value should be determined by appraisal
   */
  static estimateLandValue(propertyValue: number, landPercentage: number = 0.20): number {
    return propertyValue * landPercentage;
  }
}