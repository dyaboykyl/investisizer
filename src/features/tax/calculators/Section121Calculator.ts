import type { FilingStatus } from '../types';

export interface Section121Exclusion {
  isEligible: boolean;
  maxExclusion: number;
  appliedExclusion: number;
  remainingGain: number;
  reason?: string;
}

export interface Section121Requirements {
  isPrimaryResidence: boolean;
  yearsOwned: number;
  yearsLived: number;
  hasUsedExclusionInLastTwoYears: boolean;
}

/**
 * Section 121 Primary Residence Exclusion Calculator
 * 
 * Under Section 121 of the Internal Revenue Code, taxpayers can exclude
 * up to $250,000 (single) or $500,000 (married filing jointly) of capital
 * gains from the sale of their primary residence, subject to ownership
 * and use requirements.
 */
export class Section121Calculator {
  // Exclusion amounts by filing status (2024)
  private static readonly EXCLUSION_AMOUNTS: Record<FilingStatus, number> = {
    single: 250000,
    married_joint: 500000,
    married_separate: 250000,
    head_of_household: 250000,
  };

  // Ownership and use requirements
  private static readonly OWNERSHIP_REQUIREMENT_YEARS = 2;
  private static readonly USE_REQUIREMENT_YEARS = 2;
  private static readonly EXCLUSION_WAITING_PERIOD_YEARS = 2;

  /**
   * Calculate Section 121 exclusion for primary residence sale
   */
  static calculateExclusion(
    capitalGain: number,
    filingStatus: FilingStatus,
    requirements: Section121Requirements
  ): Section121Exclusion {
    // Check if property qualifies as primary residence
    if (!requirements.isPrimaryResidence) {
      return {
        isEligible: false,
        maxExclusion: 0,
        appliedExclusion: 0,
        remainingGain: capitalGain,
        reason: 'Property is not a primary residence',
      };
    }

    // Check ownership requirement (owned for at least 2 of last 5 years)
    if (requirements.yearsOwned < this.OWNERSHIP_REQUIREMENT_YEARS) {
      return {
        isEligible: false,
        maxExclusion: 0,
        appliedExclusion: 0,
        remainingGain: capitalGain,
        reason: `Ownership requirement not met. Must own for at least ${this.OWNERSHIP_REQUIREMENT_YEARS} years (owned: ${requirements.yearsOwned} years)`,
      };
    }

    // Check use requirement (lived in as primary residence for at least 2 of last 5 years)
    if (requirements.yearsLived < this.USE_REQUIREMENT_YEARS) {
      return {
        isEligible: false,
        maxExclusion: 0,
        appliedExclusion: 0,
        remainingGain: capitalGain,
        reason: `Use requirement not met. Must live in home for at least ${this.USE_REQUIREMENT_YEARS} years (lived: ${requirements.yearsLived} years)`,
      };
    }

    // Check if exclusion was used in the last 2 years
    if (requirements.hasUsedExclusionInLastTwoYears) {
      return {
        isEligible: false,
        maxExclusion: 0,
        appliedExclusion: 0,
        remainingGain: capitalGain,
        reason: `Exclusion already used within the last ${this.EXCLUSION_WAITING_PERIOD_YEARS} years`,
      };
    }

    // Calculate exclusion
    const maxExclusion = this.EXCLUSION_AMOUNTS[filingStatus];
    const appliedExclusion = Math.min(Math.max(0, capitalGain), maxExclusion);
    const remainingGain = capitalGain - appliedExclusion;

    return {
      isEligible: true,
      maxExclusion,
      appliedExclusion,
      remainingGain,
    };
  }

  /**
   * Get maximum exclusion amount for filing status
   */
  static getMaxExclusion(filingStatus: FilingStatus): number {
    return this.EXCLUSION_AMOUNTS[filingStatus];
  }

  /**
   * Check if basic requirements are met
   */
  static checkBasicEligibility(requirements: Section121Requirements): boolean {
    return (
      requirements.isPrimaryResidence &&
      requirements.yearsOwned >= this.OWNERSHIP_REQUIREMENT_YEARS &&
      requirements.yearsLived >= this.USE_REQUIREMENT_YEARS &&
      !requirements.hasUsedExclusionInLastTwoYears
    );
  }

  /**
   * Get detailed eligibility information
   */
  static getEligibilityDetails(requirements: Section121Requirements): {
    checks: Array<{
      requirement: string;
      met: boolean;
      details: string;
    }>;
    overallEligible: boolean;
  } {
    const checks = [
      {
        requirement: 'Primary Residence',
        met: requirements.isPrimaryResidence,
        details: requirements.isPrimaryResidence 
          ? 'Property is designated as primary residence' 
          : 'Property must be your primary residence',
      },
      {
        requirement: 'Ownership Requirement',
        met: requirements.yearsOwned >= this.OWNERSHIP_REQUIREMENT_YEARS,
        details: `Must own for at least ${this.OWNERSHIP_REQUIREMENT_YEARS} years (currently: ${requirements.yearsOwned} years)`,
      },
      {
        requirement: 'Use Requirement',
        met: requirements.yearsLived >= this.USE_REQUIREMENT_YEARS,
        details: `Must live in home for at least ${this.USE_REQUIREMENT_YEARS} years (currently: ${requirements.yearsLived} years)`,
      },
      {
        requirement: 'Previous Use Restriction',
        met: !requirements.hasUsedExclusionInLastTwoYears,
        details: requirements.hasUsedExclusionInLastTwoYears
          ? `Cannot use exclusion if used within last ${this.EXCLUSION_WAITING_PERIOD_YEARS} years`
          : 'No recent use of exclusion',
      },
    ];

    const overallEligible = checks.every(check => check.met);

    return { checks, overallEligible };
  }

  /**
   * Calculate partial exclusion for cases where requirements are partially met
   * (e.g., military service, health, or work-related moves)
   */
  static calculatePartialExclusion(
    capitalGain: number,
    filingStatus: FilingStatus,
    requirements: Section121Requirements,
    qualifyingCircumstances: {
      hasQualifyingCircumstances: boolean;
      monthsOwned?: number;
      monthsLived?: number;
      reasonCode?: 'military' | 'health' | 'work' | 'other';
    }
  ): Section121Exclusion {
    if (!qualifyingCircumstances.hasQualifyingCircumstances) {
      return this.calculateExclusion(capitalGain, filingStatus, requirements);
    }

    if (!requirements.isPrimaryResidence) {
      return {
        isEligible: false,
        maxExclusion: 0,
        appliedExclusion: 0,
        remainingGain: capitalGain,
        reason: 'Property is not a primary residence',
      };
    }

    // Calculate partial exclusion based on time requirements met
    const requiredMonths = this.OWNERSHIP_REQUIREMENT_YEARS * 12;
    const monthsOwned = qualifyingCircumstances.monthsOwned || (requirements.yearsOwned * 12);
    const monthsLived = qualifyingCircumstances.monthsLived || (requirements.yearsLived * 12);
    
    // Use the lesser of ownership or use time for partial exclusion calculation
    const qualifyingMonths = Math.min(monthsOwned, monthsLived);
    const partialRatio = Math.min(1, qualifyingMonths / requiredMonths);
    
    const fullExclusion = this.EXCLUSION_AMOUNTS[filingStatus];
    const maxExclusion = Math.floor(fullExclusion * partialRatio);
    const appliedExclusion = Math.min(Math.max(0, capitalGain), maxExclusion);
    const remainingGain = capitalGain - appliedExclusion;

    return {
      isEligible: true,
      maxExclusion,
      appliedExclusion,
      remainingGain,
      reason: `Partial exclusion due to qualifying circumstances (${qualifyingCircumstances.reasonCode}). ${(partialRatio * 100).toFixed(1)}% of full exclusion applied.`,
    };
  }

  /**
   * Format exclusion amount as currency
   */
  static formatExclusion(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Get requirements summary for UI display
   */
  static getRequirementsSummary(): {
    ownership: string;
    use: string;
    waitingPeriod: string;
    exclusionAmounts: Record<FilingStatus, string>;
  } {
    return {
      ownership: `Must own the home for at least ${this.OWNERSHIP_REQUIREMENT_YEARS} years`,
      use: `Must live in the home as your primary residence for at least ${this.USE_REQUIREMENT_YEARS} years`,
      waitingPeriod: `Cannot use exclusion if used within the last ${this.EXCLUSION_WAITING_PERIOD_YEARS} years`,
      exclusionAmounts: Object.entries(this.EXCLUSION_AMOUNTS).reduce((acc, [status, amount]) => {
        acc[status as FilingStatus] = this.formatExclusion(amount);
        return acc;
      }, {} as Record<FilingStatus, string>),
    };
  }
}