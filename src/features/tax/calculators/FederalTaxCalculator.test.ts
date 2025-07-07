import { FederalTaxCalculator } from './FederalTaxCalculator';

describe('FederalTaxCalculator', () => {
  describe('getCapitalGainsRate', () => {
    describe('single filers', () => {
      it('should return 0% for income below $47,025', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(30000, 'single')).toBe(0.00);
        expect(FederalTaxCalculator.getCapitalGainsRate(47024, 'single')).toBe(0.00);
      });

      it('should return 15% for income between $47,025 and $518,900', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(47025, 'single')).toBe(0.15);
        expect(FederalTaxCalculator.getCapitalGainsRate(100000, 'single')).toBe(0.15);
        expect(FederalTaxCalculator.getCapitalGainsRate(518899, 'single')).toBe(0.15);
      });

      it('should return 20% for income above $518,900', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(518900, 'single')).toBe(0.20);
        expect(FederalTaxCalculator.getCapitalGainsRate(1000000, 'single')).toBe(0.20);
      });
    });

    describe('married filing jointly', () => {
      it('should return 0% for income below $94,050', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(50000, 'married_joint')).toBe(0.00);
        expect(FederalTaxCalculator.getCapitalGainsRate(94049, 'married_joint')).toBe(0.00);
      });

      it('should return 15% for income between $94,050 and $583,750', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(94050, 'married_joint')).toBe(0.15);
        expect(FederalTaxCalculator.getCapitalGainsRate(200000, 'married_joint')).toBe(0.15);
        expect(FederalTaxCalculator.getCapitalGainsRate(583749, 'married_joint')).toBe(0.15);
      });

      it('should return 20% for income above $583,750', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(583750, 'married_joint')).toBe(0.20);
        expect(FederalTaxCalculator.getCapitalGainsRate(2000000, 'married_joint')).toBe(0.20);
      });
    });

    describe('married filing separately', () => {
      it('should return 0% for income below $47,025', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(30000, 'married_separate')).toBe(0.00);
        expect(FederalTaxCalculator.getCapitalGainsRate(47024, 'married_separate')).toBe(0.00);
      });

      it('should return 15% for income between $47,025 and $291,875', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(47025, 'married_separate')).toBe(0.15);
        expect(FederalTaxCalculator.getCapitalGainsRate(150000, 'married_separate')).toBe(0.15);
        expect(FederalTaxCalculator.getCapitalGainsRate(291874, 'married_separate')).toBe(0.15);
      });

      it('should return 20% for income above $291,875', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(291875, 'married_separate')).toBe(0.20);
        expect(FederalTaxCalculator.getCapitalGainsRate(500000, 'married_separate')).toBe(0.20);
      });
    });

    describe('head of household', () => {
      it('should return 0% for income below $63,000', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(40000, 'head_of_household')).toBe(0.00);
        expect(FederalTaxCalculator.getCapitalGainsRate(62999, 'head_of_household')).toBe(0.00);
      });

      it('should return 15% for income between $63,000 and $551,350', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(63000, 'head_of_household')).toBe(0.15);
        expect(FederalTaxCalculator.getCapitalGainsRate(200000, 'head_of_household')).toBe(0.15);
        expect(FederalTaxCalculator.getCapitalGainsRate(551349, 'head_of_household')).toBe(0.15);
      });

      it('should return 20% for income above $551,350', () => {
        expect(FederalTaxCalculator.getCapitalGainsRate(551350, 'head_of_household')).toBe(0.20);
        expect(FederalTaxCalculator.getCapitalGainsRate(800000, 'head_of_household')).toBe(0.20);
      });
    });
  });

  describe('getTaxBracket', () => {
    it('should return correct bracket information for single filer', () => {
      const bracket = FederalTaxCalculator.getTaxBracket(100000, 'single');
      expect(bracket.min).toBe(47025);
      expect(bracket.max).toBe(518900);
      expect(bracket.rate).toBe(0.15);
    });

    it('should return highest bracket for very high income', () => {
      const bracket = FederalTaxCalculator.getTaxBracket(10000000, 'single');
      expect(bracket.min).toBe(518900);
      expect(bracket.max).toBe(Infinity);
      expect(bracket.rate).toBe(0.20);
    });
  });

  describe('calculateFederalTax', () => {
    it('should calculate tax correctly for 0% bracket', () => {
      const result = FederalTaxCalculator.calculateFederalTax(50000, 30000, 'single');
      
      expect(result.taxableGain).toBe(50000);
      expect(result.taxRate).toBe(0.00);
      expect(result.taxAmount).toBe(0);
      expect(result.bracketInfo.rate).toBe(0.00);
    });

    it('should calculate tax correctly for 15% bracket', () => {
      const result = FederalTaxCalculator.calculateFederalTax(100000, 100000, 'single');
      
      expect(result.taxableGain).toBe(100000);
      expect(result.taxRate).toBe(0.15);
      expect(result.taxAmount).toBe(15000);
      expect(result.bracketInfo.rate).toBe(0.15);
    });

    it('should calculate tax correctly for 20% bracket', () => {
      const result = FederalTaxCalculator.calculateFederalTax(200000, 600000, 'single');
      
      expect(result.taxableGain).toBe(200000);
      expect(result.taxRate).toBe(0.20);
      expect(result.taxAmount).toBe(40000);
      expect(result.bracketInfo.rate).toBe(0.20);
    });

    it('should handle zero capital gain', () => {
      const result = FederalTaxCalculator.calculateFederalTax(0, 100000, 'single');
      
      expect(result.taxableGain).toBe(0);
      expect(result.taxRate).toBe(0);
      expect(result.taxAmount).toBe(0);
    });

    it('should handle negative capital gain', () => {
      const result = FederalTaxCalculator.calculateFederalTax(-50000, 100000, 'single');
      
      expect(result.taxableGain).toBe(0);
      expect(result.taxRate).toBe(0);
      expect(result.taxAmount).toBe(0);
    });

    it('should calculate correctly for married filing jointly', () => {
      const result = FederalTaxCalculator.calculateFederalTax(80000, 150000, 'married_joint');
      
      expect(result.taxableGain).toBe(80000);
      expect(result.taxRate).toBe(0.15);
      expect(result.taxAmount).toBe(12000);
    });
  });

  describe('calculateFederalTaxWithAdjustments', () => {
    it('should apply carryover losses to reduce gain', () => {
      const result = FederalTaxCalculator.calculateFederalTaxWithAdjustments(
        100000, // capital gain
        100000, // annual income
        'single',
        0, // other gains
        20000 // carryover losses
      );
      
      expect(result.taxableGain).toBe(80000); // 100000 - 20000
      expect(result.taxAmount).toBe(12000); // 80000 * 0.15
    });

    it('should add other capital gains', () => {
      const result = FederalTaxCalculator.calculateFederalTaxWithAdjustments(
        50000, // capital gain
        100000, // annual income
        'single',
        30000, // other gains
        0 // carryover losses
      );
      
      expect(result.taxableGain).toBe(80000); // 50000 + 30000
      expect(result.taxAmount).toBe(12000); // 80000 * 0.15
    });

    it('should apply both adjustments correctly', () => {
      const result = FederalTaxCalculator.calculateFederalTaxWithAdjustments(
        100000, // capital gain
        100000, // annual income
        'single',
        25000, // other gains
        15000 // carryover losses
      );
      
      expect(result.taxableGain).toBe(110000); // 100000 - 15000 + 25000
      expect(result.taxAmount).toBe(16500); // 110000 * 0.15
    });

    it('should handle case where losses exceed gains', () => {
      const result = FederalTaxCalculator.calculateFederalTaxWithAdjustments(
        50000, // capital gain
        100000, // annual income
        'single',
        10000, // other gains
        80000 // carryover losses (exceeds gains)
      );
      
      expect(result.taxableGain).toBe(0); // max(0, 50000 - 80000 + 10000)
      expect(result.taxAmount).toBe(0);
    });

    it('should handle negative carryover losses (treat as positive)', () => {
      const result = FederalTaxCalculator.calculateFederalTaxWithAdjustments(
        100000, // capital gain
        100000, // annual income
        'single',
        0, // other gains
        -20000 // negative carryover losses
      );
      
      expect(result.taxableGain).toBe(80000); // 100000 - abs(-20000)
      expect(result.taxAmount).toBe(12000);
    });
  });

  describe('getTaxBrackets', () => {
    it('should return all brackets for single filers', () => {
      const brackets = FederalTaxCalculator.getTaxBrackets('single');
      
      expect(brackets).toHaveLength(3);
      expect(brackets[0]).toEqual({ min: 0, max: 47025, rate: 0.00 });
      expect(brackets[1]).toEqual({ min: 47025, max: 518900, rate: 0.15 });
      expect(brackets[2]).toEqual({ min: 518900, max: Infinity, rate: 0.20 });
    });

    it('should return a copy of brackets (not original)', () => {
      const brackets1 = FederalTaxCalculator.getTaxBrackets('single');
      const brackets2 = FederalTaxCalculator.getTaxBrackets('single');
      
      expect(brackets1).not.toBe(brackets2); // Different objects
      expect(brackets1).toEqual(brackets2); // Same content
    });
  });

  describe('utility methods', () => {
    describe('formatTaxRate', () => {
      it('should format decimal rates as percentages', () => {
        expect(FederalTaxCalculator.formatTaxRate(0.00)).toBe('0%');
        expect(FederalTaxCalculator.formatTaxRate(0.15)).toBe('15%');
        expect(FederalTaxCalculator.formatTaxRate(0.20)).toBe('20%');
        expect(FederalTaxCalculator.formatTaxRate(0.125)).toBe('13%'); // rounds down
      });
    });

    describe('formatCurrency', () => {
      it('should format amounts as currency without cents', () => {
        expect(FederalTaxCalculator.formatCurrency(0)).toBe('$0');
        expect(FederalTaxCalculator.formatCurrency(1000)).toBe('$1,000');
        expect(FederalTaxCalculator.formatCurrency(15000)).toBe('$15,000');
        expect(FederalTaxCalculator.formatCurrency(1500000)).toBe('$1,500,000');
      });

      it('should handle decimal amounts by rounding', () => {
        expect(FederalTaxCalculator.formatCurrency(1000.49)).toBe('$1,000');
        expect(FederalTaxCalculator.formatCurrency(1000.50)).toBe('$1,001');
      });
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle exact bracket boundary values', () => {
      // Test exact boundary for single filer 15% bracket
      const result1 = FederalTaxCalculator.calculateFederalTax(10000, 47025, 'single');
      expect(result1.taxRate).toBe(0.15);

      // Test one dollar below boundary
      const result2 = FederalTaxCalculator.calculateFederalTax(10000, 47024, 'single');
      expect(result2.taxRate).toBe(0.00);
    });

    it('should handle very large numbers', () => {
      const result = FederalTaxCalculator.calculateFederalTax(
        Number.MAX_SAFE_INTEGER / 2,
        Number.MAX_SAFE_INTEGER / 2,
        'single'
      );
      
      expect(result.taxRate).toBe(0.20);
      expect(Number.isFinite(result.taxAmount)).toBe(true);
    });

    it('should maintain precision for small decimal values', () => {
      const result = FederalTaxCalculator.calculateFederalTax(0.01, 100000, 'single');
      
      expect(result.taxableGain).toBe(0.01);
      expect(result.taxAmount).toBe(0.0015); // 0.01 * 0.15
    });
  });
});