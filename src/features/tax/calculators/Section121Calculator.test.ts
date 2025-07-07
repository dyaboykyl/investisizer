import { Section121Calculator } from './Section121Calculator';
import type { FilingStatus } from '../types';

describe('Section121Calculator', () => {
  describe('basic exclusion calculation', () => {
    it('should calculate full exclusion for qualifying single filer', () => {
      const capitalGain = 200000;
      const filingStatus: FilingStatus = 'single';
      const requirements = {
        isPrimaryResidence: true,
        yearsOwned: 3,
        yearsLived: 3,
        hasUsedExclusionInLastTwoYears: false,
      };

      const result = Section121Calculator.calculateExclusion(capitalGain, filingStatus, requirements);

      expect(result.isEligible).toBe(true);
      expect(result.maxExclusion).toBe(250000);
      expect(result.appliedExclusion).toBe(200000); // Full gain excluded
      expect(result.remainingGain).toBe(0);
      expect(result.reason).toBeUndefined();
    });

    it('should calculate partial exclusion for high-gain single filer', () => {
      const capitalGain = 300000;
      const filingStatus: FilingStatus = 'single';
      const requirements = {
        isPrimaryResidence: true,
        yearsOwned: 5,
        yearsLived: 4,
        hasUsedExclusionInLastTwoYears: false,
      };

      const result = Section121Calculator.calculateExclusion(capitalGain, filingStatus, requirements);

      expect(result.isEligible).toBe(true);
      expect(result.maxExclusion).toBe(250000);
      expect(result.appliedExclusion).toBe(250000); // Max exclusion applied
      expect(result.remainingGain).toBe(50000); // $50k still taxable
      expect(result.reason).toBeUndefined();
    });

    it('should calculate full exclusion for qualifying married joint filer', () => {
      const capitalGain = 450000;
      const filingStatus: FilingStatus = 'married_joint';
      const requirements = {
        isPrimaryResidence: true,
        yearsOwned: 4,
        yearsLived: 3,
        hasUsedExclusionInLastTwoYears: false,
      };

      const result = Section121Calculator.calculateExclusion(capitalGain, filingStatus, requirements);

      expect(result.isEligible).toBe(true);
      expect(result.maxExclusion).toBe(500000);
      expect(result.appliedExclusion).toBe(450000); // Full gain excluded
      expect(result.remainingGain).toBe(0);
    });

    it('should calculate partial exclusion for high-gain married joint filer', () => {
      const capitalGain = 600000;
      const filingStatus: FilingStatus = 'married_joint';
      const requirements = {
        isPrimaryResidence: true,
        yearsOwned: 10,
        yearsLived: 8,
        hasUsedExclusionInLastTwoYears: false,
      };

      const result = Section121Calculator.calculateExclusion(capitalGain, filingStatus, requirements);

      expect(result.isEligible).toBe(true);
      expect(result.maxExclusion).toBe(500000);
      expect(result.appliedExclusion).toBe(500000); // Max exclusion applied
      expect(result.remainingGain).toBe(100000); // $100k still taxable
    });
  });

  describe('exclusion amounts by filing status', () => {
    it('should return correct maximum exclusions', () => {
      expect(Section121Calculator.getMaxExclusion('single')).toBe(250000);
      expect(Section121Calculator.getMaxExclusion('married_joint')).toBe(500000);
      expect(Section121Calculator.getMaxExclusion('married_separate')).toBe(250000);
      expect(Section121Calculator.getMaxExclusion('head_of_household')).toBe(250000);
    });
  });

  describe('eligibility requirements', () => {
    const baseRequirements = {
      isPrimaryResidence: true,
      yearsOwned: 3,
      yearsLived: 3,
      hasUsedExclusionInLastTwoYears: false,
    };

    it('should reject non-primary residence', () => {
      const requirements = {
        ...baseRequirements,
        isPrimaryResidence: false,
      };

      const result = Section121Calculator.calculateExclusion(100000, 'single', requirements);

      expect(result.isEligible).toBe(false);
      expect(result.appliedExclusion).toBe(0);
      expect(result.remainingGain).toBe(100000);
      expect(result.reason).toBe('Property is not a primary residence');
    });

    it('should reject insufficient ownership time', () => {
      const requirements = {
        ...baseRequirements,
        yearsOwned: 1.5, // Less than 2 years
      };

      const result = Section121Calculator.calculateExclusion(100000, 'single', requirements);

      expect(result.isEligible).toBe(false);
      expect(result.appliedExclusion).toBe(0);
      expect(result.remainingGain).toBe(100000);
      expect(result.reason).toContain('Ownership requirement not met');
      expect(result.reason).toContain('owned: 1.5 years');
    });

    it('should reject insufficient use time', () => {
      const requirements = {
        ...baseRequirements,
        yearsLived: 1.8, // Less than 2 years
      };

      const result = Section121Calculator.calculateExclusion(100000, 'single', requirements);

      expect(result.isEligible).toBe(false);
      expect(result.appliedExclusion).toBe(0);
      expect(result.remainingGain).toBe(100000);
      expect(result.reason).toContain('Use requirement not met');
      expect(result.reason).toContain('lived: 1.8 years');
    });

    it('should reject recent exclusion usage', () => {
      const requirements = {
        ...baseRequirements,
        hasUsedExclusionInLastTwoYears: true,
      };

      const result = Section121Calculator.calculateExclusion(100000, 'single', requirements);

      expect(result.isEligible).toBe(false);
      expect(result.appliedExclusion).toBe(0);
      expect(result.remainingGain).toBe(100000);
      expect(result.reason).toContain('Exclusion already used within the last 2 years');
    });

    it('should handle exactly meeting requirements', () => {
      const requirements = {
        isPrimaryResidence: true,
        yearsOwned: 2.0, // Exactly 2 years
        yearsLived: 2.0, // Exactly 2 years
        hasUsedExclusionInLastTwoYears: false,
      };

      const result = Section121Calculator.calculateExclusion(100000, 'single', requirements);

      expect(result.isEligible).toBe(true);
      expect(result.appliedExclusion).toBe(100000);
      expect(result.remainingGain).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero capital gain', () => {
      const requirements = {
        isPrimaryResidence: true,
        yearsOwned: 3,
        yearsLived: 3,
        hasUsedExclusionInLastTwoYears: false,
      };

      const result = Section121Calculator.calculateExclusion(0, 'single', requirements);

      expect(result.isEligible).toBe(true);
      expect(result.appliedExclusion).toBe(0);
      expect(result.remainingGain).toBe(0);
    });

    it('should handle negative capital gain (loss)', () => {
      const requirements = {
        isPrimaryResidence: true,
        yearsOwned: 3,
        yearsLived: 3,
        hasUsedExclusionInLastTwoYears: false,
      };

      const result = Section121Calculator.calculateExclusion(-50000, 'single', requirements);

      expect(result.isEligible).toBe(true);
      expect(result.appliedExclusion).toBe(0); // Can't exclude a loss
      expect(result.remainingGain).toBe(-50000); // Loss remains
    });

    it('should handle very large capital gain', () => {
      const requirements = {
        isPrimaryResidence: true,
        yearsOwned: 10,
        yearsLived: 10,
        hasUsedExclusionInLastTwoYears: false,
      };

      const result = Section121Calculator.calculateExclusion(1000000, 'married_joint', requirements);

      expect(result.isEligible).toBe(true);
      expect(result.maxExclusion).toBe(500000);
      expect(result.appliedExclusion).toBe(500000);
      expect(result.remainingGain).toBe(500000);
    });
  });

  describe('partial exclusion for qualifying circumstances', () => {
    const baseRequirements = {
      isPrimaryResidence: true,
      yearsOwned: 1,
      yearsLived: 1,
      hasUsedExclusionInLastTwoYears: false,
    };

    it('should calculate partial exclusion for military circumstances', () => {
      const qualifyingCircumstances = {
        hasQualifyingCircumstances: true,
        monthsOwned: 12,
        monthsLived: 12,
        reasonCode: 'military' as const,
      };

      const result = Section121Calculator.calculatePartialExclusion(
        200000,
        'single',
        baseRequirements,
        qualifyingCircumstances
      );

      expect(result.isEligible).toBe(true);
      // 12 months / 24 months required = 50% of $250k = $125k
      expect(result.maxExclusion).toBe(125000);
      expect(result.appliedExclusion).toBe(125000);
      expect(result.remainingGain).toBe(75000);
      expect(result.reason).toContain('Partial exclusion due to qualifying circumstances (military)');
      expect(result.reason).toContain('50.0% of full exclusion applied');
    });

    it('should calculate partial exclusion for health circumstances', () => {
      const qualifyingCircumstances = {
        hasQualifyingCircumstances: true,
        monthsOwned: 18,
        monthsLived: 15, // Use the lesser of the two
        reasonCode: 'health' as const,
      };

      const result = Section121Calculator.calculatePartialExclusion(
        100000,
        'single',
        baseRequirements,
        qualifyingCircumstances
      );

      expect(result.isEligible).toBe(true);
      // 15 months / 24 months required = 62.5% of $250k = $156,250
      expect(result.maxExclusion).toBe(156250);
      expect(result.appliedExclusion).toBe(100000); // Full gain excluded
      expect(result.remainingGain).toBe(0);
      expect(result.reason).toContain('health');
      expect(result.reason).toContain('62.5% of full exclusion applied');
    });

    it('should not allow partial exclusion for non-primary residence', () => {
      const requirements = {
        ...baseRequirements,
        isPrimaryResidence: false,
      };

      const qualifyingCircumstances = {
        hasQualifyingCircumstances: true,
        monthsOwned: 12,
        monthsLived: 12,
        reasonCode: 'work' as const,
      };

      const result = Section121Calculator.calculatePartialExclusion(
        100000,
        'single',
        requirements,
        qualifyingCircumstances
      );

      expect(result.isEligible).toBe(false);
      expect(result.appliedExclusion).toBe(0);
      expect(result.remainingGain).toBe(100000);
      expect(result.reason).toBe('Property is not a primary residence');
    });

    it('should cap partial exclusion at 100%', () => {
      const qualifyingCircumstances = {
        hasQualifyingCircumstances: true,
        monthsOwned: 30, // More than 24 months
        monthsLived: 25,
        reasonCode: 'other' as const,
      };

      const result = Section121Calculator.calculatePartialExclusion(
        200000,
        'single',
        baseRequirements,
        qualifyingCircumstances
      );

      expect(result.isEligible).toBe(true);
      expect(result.maxExclusion).toBe(250000); // Full exclusion, not more
      expect(result.appliedExclusion).toBe(200000);
      expect(result.remainingGain).toBe(0);
    });
  });

  describe('eligibility checking utilities', () => {
    it('should check basic eligibility correctly', () => {
      const eligible = {
        isPrimaryResidence: true,
        yearsOwned: 3,
        yearsLived: 3,
        hasUsedExclusionInLastTwoYears: false,
      };

      const ineligible = {
        isPrimaryResidence: false,
        yearsOwned: 1,
        yearsLived: 1,
        hasUsedExclusionInLastTwoYears: true,
      };

      expect(Section121Calculator.checkBasicEligibility(eligible)).toBe(true);
      expect(Section121Calculator.checkBasicEligibility(ineligible)).toBe(false);
    });

    it('should provide detailed eligibility information', () => {
      const requirements = {
        isPrimaryResidence: true,
        yearsOwned: 1.5,
        yearsLived: 2.5,
        hasUsedExclusionInLastTwoYears: true,
      };

      const details = Section121Calculator.getEligibilityDetails(requirements);

      expect(details.overallEligible).toBe(false);
      expect(details.checks).toHaveLength(4);
      
      // Check individual requirements
      expect(details.checks[0].requirement).toBe('Primary Residence');
      expect(details.checks[0].met).toBe(true);
      
      expect(details.checks[1].requirement).toBe('Ownership Requirement');
      expect(details.checks[1].met).toBe(false);
      expect(details.checks[1].details).toContain('1.5 years');
      
      expect(details.checks[2].requirement).toBe('Use Requirement');
      expect(details.checks[2].met).toBe(true);
      
      expect(details.checks[3].requirement).toBe('Previous Use Restriction');
      expect(details.checks[3].met).toBe(false);
    });
  });

  describe('utility functions', () => {
    it('should format exclusion amounts correctly', () => {
      expect(Section121Calculator.formatExclusion(250000)).toBe('$250,000');
      expect(Section121Calculator.formatExclusion(500000)).toBe('$500,000');
      expect(Section121Calculator.formatExclusion(125000)).toBe('$125,000');
    });

    it('should provide requirements summary', () => {
      const summary = Section121Calculator.getRequirementsSummary();

      expect(summary.ownership).toContain('2 years');
      expect(summary.use).toContain('2 years');
      expect(summary.waitingPeriod).toContain('2 years');
      expect(summary.exclusionAmounts.single).toBe('$250,000');
      expect(summary.exclusionAmounts.married_joint).toBe('$500,000');
      expect(summary.exclusionAmounts.married_separate).toBe('$250,000');
      expect(summary.exclusionAmounts.head_of_household).toBe('$250,000');
    });
  });
});