import { StateTaxCalculator } from './StateTaxCalculator';
import { getStateTaxInfo } from '../data/StateTaxRates';

describe('StateTaxCalculator', () => {
  describe('basic state tax calculation', () => {
    it('should calculate tax for California (high tax state)', () => {
      const capitalGain = 100000;
      const result = StateTaxCalculator.calculateStateTax(capitalGain, 'CA');

      expect(result.stateCode).toBe('CA');
      expect(result.stateName).toBe('California');
      expect(result.hasCapitalGainsTax).toBe(true);
      expect(result.taxableGain).toBe(100000);
      expect(result.taxRate).toBe(0.133); // 13.3%
      expect(result.taxAmount).toBe(13300); // $100k * 13.3%
      expect(result.isSimplified).toBe(true);
      expect(result.notes).toContain('Mental Health Tax');
    });

    it('should calculate tax for New York', () => {
      const capitalGain = 200000;
      const result = StateTaxCalculator.calculateStateTax(capitalGain, 'NY');

      expect(result.stateCode).toBe('NY');
      expect(result.stateName).toBe('New York');
      expect(result.hasCapitalGainsTax).toBe(true);
      expect(result.taxableGain).toBe(200000);
      expect(result.taxRate).toBe(0.109); // 10.9%
      expect(result.taxAmount).toBe(21800); // $200k * 10.9%
    });

    it('should return zero tax for Texas (no tax state)', () => {
      const capitalGain = 150000;
      const result = StateTaxCalculator.calculateStateTax(capitalGain, 'TX');

      expect(result.stateCode).toBe('TX');
      expect(result.stateName).toBe('Texas');
      expect(result.hasCapitalGainsTax).toBe(false);
      expect(result.taxableGain).toBe(150000);
      expect(result.taxRate).toBe(0);
      expect(result.taxAmount).toBe(0);
      expect(result.notes).toBe('No state income tax');
    });

    it('should return zero tax for Florida (no tax state)', () => {
      const capitalGain = 75000;
      const result = StateTaxCalculator.calculateStateTax(capitalGain, 'FL');

      expect(result.stateCode).toBe('FL');
      expect(result.stateName).toBe('Florida');
      expect(result.hasCapitalGainsTax).toBe(false);
      expect(result.taxRate).toBe(0);
      expect(result.taxAmount).toBe(0);
    });

    it('should handle Washington state special capital gains tax', () => {
      const capitalGain = 300000;
      const result = StateTaxCalculator.calculateStateTax(capitalGain, 'WA');

      expect(result.stateCode).toBe('WA');
      expect(result.stateName).toBe('Washington');
      expect(result.hasCapitalGainsTax).toBe(true);
      expect(result.taxRate).toBe(0.07); // 7%
      expect(result.taxAmount).toBeCloseTo(21000, 0); // $300k * 7%
      expect(result.notes).toContain('$250,000');
    });
  });

  describe('edge cases', () => {
    it('should handle zero capital gain', () => {
      const result = StateTaxCalculator.calculateStateTax(0, 'CA');

      expect(result.taxableGain).toBe(0);
      expect(result.taxAmount).toBe(0);
    });

    it('should handle negative capital gain (loss)', () => {
      const result = StateTaxCalculator.calculateStateTax(-50000, 'CA');

      expect(result.taxableGain).toBe(0); // Should not tax losses
      expect(result.taxAmount).toBe(0);
    });

    it('should handle unknown state', () => {
      const result = StateTaxCalculator.calculateStateTax(100000, 'XX');

      expect(result.stateCode).toBe('XX');
      expect(result.stateName).toBe('Unknown State');
      expect(result.hasCapitalGainsTax).toBe(false);
      expect(result.taxAmount).toBe(0);
      expect(result.notes).toBe('State not found in tax database');
    });

    it('should handle case insensitive state codes', () => {
      const result = StateTaxCalculator.calculateStateTax(100000, 'ca');

      expect(result.stateCode).toBe('CA');
      expect(result.stateName).toBe('California');
      expect(result.taxAmount).toBe(13300);
    });
  });

  describe('state tax after Section 121 exclusion', () => {
    it('should calculate tax on remaining gain after exclusion', () => {
      const totalGain = 350000;
      const exclusion = 250000; // Section 121 exclusion
      const result = StateTaxCalculator.calculateStateTaxAfterExclusion(
        totalGain,
        exclusion,
        'CA'
      );

      expect(result.taxableGain).toBe(100000); // $350k - $250k
      expect(result.taxAmount).toBe(13300); // $100k * 13.3%
    });

    it('should return zero tax when exclusion covers full gain', () => {
      const totalGain = 200000;
      const exclusion = 250000; // More than the gain
      const result = StateTaxCalculator.calculateStateTaxAfterExclusion(
        totalGain,
        exclusion,
        'CA'
      );

      expect(result.taxableGain).toBe(0);
      expect(result.taxAmount).toBe(0);
    });
  });

  describe('combined federal and state tax calculation', () => {
    it('should calculate combined tax correctly', () => {
      const capitalGain = 200000;
      const federalTax = 30000; // 15% on $200k
      const result = StateTaxCalculator.calculateCombinedTax(
        capitalGain,
        'CA',
        federalTax
      );

      expect(result.federalTax).toBe(30000);
      expect(result.stateTax).toBe(26600); // $200k * 13.3%
      expect(result.totalTax).toBe(56600); // $30k + $26.6k
      expect(result.effectiveRate).toBeCloseTo(0.283, 3); // 28.3%
      expect(result.stateCalculation.stateCode).toBe('CA');
    });

    it('should handle zero capital gain', () => {
      const result = StateTaxCalculator.calculateCombinedTax(0, 'CA', 0);

      expect(result.federalTax).toBe(0);
      expect(result.stateTax).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.effectiveRate).toBe(0);
    });
  });

  describe('utility functions', () => {
    it('should get state tax rate correctly', () => {
      expect(StateTaxCalculator.getStateTaxRate('CA')).toBe(0.133);
      expect(StateTaxCalculator.getStateTaxRate('TX')).toBe(0);
      expect(StateTaxCalculator.getStateTaxRate('NY')).toBe(0.109);
    });

    it('should check if state has capital gains tax', () => {
      expect(StateTaxCalculator.hasCapitalGainsTax('CA')).toBe(true);
      expect(StateTaxCalculator.hasCapitalGainsTax('TX')).toBe(false);
      expect(StateTaxCalculator.hasCapitalGainsTax('FL')).toBe(false);
    });

    it('should get state info correctly', () => {
      const info = StateTaxCalculator.getStateInfo('CA');
      expect(info).not.toBeNull();
      expect(info?.code).toBe('CA');
      expect(info?.name).toBe('California');
      expect(info?.rate).toBe(0.133);
    });

    it('should format tax rate correctly', () => {
      expect(StateTaxCalculator.formatTaxRate(0.133)).toBe('13.3%');
      expect(StateTaxCalculator.formatTaxRate(0.07)).toBe('7.0%');
      expect(StateTaxCalculator.formatTaxRate(0)).toBe('0.0%');
    });

    it('should format currency correctly', () => {
      expect(StateTaxCalculator.formatCurrency(13300)).toBe('$13,300');
      expect(StateTaxCalculator.formatCurrency(0)).toBe('$0');
      expect(StateTaxCalculator.formatCurrency(1234567)).toBe('$1,234,567');
    });
  });

  describe('state comparison functionality', () => {
    it('should compare taxes across multiple states', () => {
      const capitalGain = 100000;
      const states = ['CA', 'TX', 'NY', 'FL'];
      const comparison = StateTaxCalculator.compareStates(capitalGain, states);

      expect(comparison).toHaveLength(4);
      
      // Find California and Texas in results
      const caResult = comparison.find(c => c.stateCode === 'CA');
      const txResult = comparison.find(c => c.stateCode === 'TX');
      
      expect(caResult?.taxAmount).toBe(13300);
      expect(txResult?.taxAmount).toBe(0);
      
      // Check savings calculation (should be relative to highest tax)
      expect(txResult?.savings).toBeGreaterThan(0);
    });
  });

  describe('relocation tax impact analysis', () => {
    it('should calculate tax impact of moving from high tax to no tax state', () => {
      const capitalGain = 500000;
      const result = StateTaxCalculator.getRelocationTaxImpact(
        capitalGain,
        'CA', // From California (high tax)
        'TX'  // To Texas (no tax)
      );

      expect(result.fromStateCalculation.stateCode).toBe('CA');
      expect(result.toStateCalculation.stateCode).toBe('TX');
      expect(result.fromStateCalculation.taxAmount).toBe(66500); // $500k * 13.3%
      expect(result.toStateCalculation.taxAmount).toBe(0);
      expect(result.taxDifference).toBe(-66500); // Negative = savings
      expect(result.savings).toBe(66500);
      expect(result.recommendation).toContain('save');
    });

    it('should calculate tax impact of moving between similar tax states', () => {
      const capitalGain = 100000;
      const result = StateTaxCalculator.getRelocationTaxImpact(
        capitalGain,
        'PA', // Pennsylvania (~3%)
        'IN'  // Indiana (~3.2%)
      );

      expect(Math.abs(result.taxDifference)).toBeLessThan(1000);
      expect(result.recommendation).toContain('minimal');
    });

    it('should calculate tax impact of moving from no tax to high tax state', () => {
      const capitalGain = 200000;
      const result = StateTaxCalculator.getRelocationTaxImpact(
        capitalGain,
        'FL', // Florida (no tax)
        'CA'  // California (high tax)
      );

      expect(result.taxDifference).toBeGreaterThan(0); // Positive = increase
      expect(result.savings).toBeLessThan(0); // Negative = cost
      expect(result.recommendation).toContain('increase');
    });
  });

  describe('no tax state optimization', () => {
    it('should identify no tax states correctly', () => {
      const noTaxStates = StateTaxCalculator.getNoTaxStates();
      
      expect(noTaxStates).toContain('TX');
      expect(noTaxStates).toContain('FL');
      expect(noTaxStates).toContain('NV');
      expect(noTaxStates).not.toContain('CA');
      expect(noTaxStates).not.toContain('NY');
    });

    it('should calculate savings potential for high tax state resident', () => {
      const capitalGain = 1000000;
      const result = StateTaxCalculator.calculateNoTaxStateSavings(
        capitalGain,
        'CA'
      );

      expect(result.currentTax).toBe(133000); // $1M * 13.3%
      expect(result.potentialSavings).toBe(133000);
      expect(result.noTaxStates.length).toBeGreaterThan(0);
      expect(result.recommendation).toContain('Significant');
    });

    it('should provide appropriate recommendation for moderate savings', () => {
      const capitalGain = 50000;
      const result = StateTaxCalculator.calculateNoTaxStateSavings(
        capitalGain,
        'PA' // Lower tax state
      );

      expect(result.currentTax).toBeLessThan(5000);
      expect(result.recommendation).toContain('not justify');
    });

    it('should handle resident of no tax state', () => {
      const capitalGain = 100000;
      const result = StateTaxCalculator.calculateNoTaxStateSavings(
        capitalGain,
        'TX'
      );

      expect(result.currentTax).toBe(0);
      expect(result.potentialSavings).toBe(0);
      expect(result.recommendation).toContain('already has no');
    });
  });

  describe('integration with state tax data', () => {
    it('should work with all states in the database', () => {
      const testStates = ['CA', 'NY', 'TX', 'FL', 'WA', 'OR', 'CO', 'MA', 'CT'];
      const capitalGain = 100000;

      testStates.forEach(state => {
        const result = StateTaxCalculator.calculateStateTax(capitalGain, state);
        const stateInfo = getStateTaxInfo(state);
        
        expect(result.stateCode).toBe(state);
        expect(result.stateName).toBe(stateInfo?.name);
        expect(result.hasCapitalGainsTax).toBe(stateInfo?.hasCapitalGainsTax);
        expect(result.taxRate).toBe(stateInfo?.rate || 0);
        
        if (stateInfo?.hasCapitalGainsTax) {
          expect(result.taxAmount).toBeGreaterThan(0);
        } else {
          expect(result.taxAmount).toBe(0);
        }
      });
    });
  });
});