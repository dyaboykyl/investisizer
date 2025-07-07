import { Investment } from '@/features/investment/stores/Investment';

describe('Investment - Real vs Nominal Calculations (Domain Knowledge Testing)', () => {
  describe('mathematical correctness of real growth calculations', () => {
    it('should calculate real growth rate correctly according to Fisher equation', () => {
      // Test the fundamental relationship: Real Rate = (1 + Nominal Rate) / (1 + Inflation Rate) - 1
      const investment = new Investment('Real Rate Test', {
        initialAmount: '100000',
        rateOfReturn: '7',      // 7% nominal
        inflationRate: '2.5',   // 2.5% inflation
        annualContribution: '0' // No contributions to isolate growth calculation
      });
      investment.portfolioStore = { years: '1' };

      const year1 = investment.results[1];
      
      // Expected real growth: (1.07 / 1.025) - 1 = 4.39%
      const expectedRealGrowthRate = (1.07 / 1.025) - 1;
      const expectedRealBalance = 100000 * (1 + expectedRealGrowthRate);
      const expectedNominalBalance = 100000 * 1.07;
      
      // Verify nominal calculation is correct
      expect(year1.balance).toBeCloseTo(expectedNominalBalance, 2);
      
      // Verify real calculation follows Fisher equation
      expect(year1.realBalance).toBeCloseTo(expectedRealBalance, 2);
      
      // Most importantly: real and nominal should NOT be equal with inflation > 0
      expect(year1.realBalance).not.toBeCloseTo(year1.balance, 2);
      expect(year1.realBalance).toBeLessThan(year1.balance);
    });

    it('should show real equals nominal when inflation is zero', () => {
      const investment = new Investment('Zero Inflation Test', {
        initialAmount: '100000',
        rateOfReturn: '7',
        inflationRate: '0',     // Zero inflation
        annualContribution: '0'
      });
      investment.portfolioStore = { years: '1' };

      const year1 = investment.results[1];
      
      // With zero inflation, real should equal nominal
      expect(year1.realBalance).toBeCloseTo(year1.balance, 2);
      expect(year1.realAnnualInvestmentGain).toBeCloseTo(year1.annualInvestmentGain, 2);
    });

    it('should demonstrate compounding real vs nominal divergence over multiple years', () => {
      const investment = new Investment('Multi-Year Test', {
        initialAmount: '100000',
        rateOfReturn: '7',
        inflationRate: '3',
        annualContribution: '0'
      });
      investment.portfolioStore = { years: '5' };

      const results = investment.results;
      
      // Calculate expected values manually
      const nominalRate = 0.07;
      const inflationRate = 0.03;
      const realRate = (1 + nominalRate) / (1 + inflationRate) - 1;
      
      for (let year = 1; year <= 5; year++) {
        const result = results[year];
        const expectedNominal = 100000 * Math.pow(1 + nominalRate, year);
        const expectedReal = 100000 * Math.pow(1 + realRate, year);
        
        // Verify calculations
        expect(result.balance).toBeCloseTo(expectedNominal, 2);
        expect(result.realBalance).toBeCloseTo(expectedReal, 2);
        
        // Gap should increase over time
        const gap = result.balance - result.realBalance;
        expect(gap).toBeGreaterThan(0);
        
        if (year > 1) {
          const previousGap = results[year - 1].balance - results[year - 1].realBalance;
          expect(gap).toBeGreaterThan(previousGap);
        }
      }
    });

    it('should handle high inflation scenarios correctly', () => {
      const investment = new Investment('High Inflation Test', {
        initialAmount: '100000',
        rateOfReturn: '7',
        inflationRate: '6',     // High inflation: 6%
        annualContribution: '0'
      });
      investment.portfolioStore = { years: '3' };

      const results = investment.results;
      
      // Real rate should be (1.07 / 1.06) - 1 ≈ 0.94%
      const expectedRealRate = (1.07 / 1.06) - 1;
      
      for (let year = 1; year <= 3; year++) {
        const result = results[year];
        const expectedReal = 100000 * Math.pow(1 + expectedRealRate, year);
        
        expect(result.realBalance).toBeCloseTo(expectedReal, 1);
        
        // With high inflation, real growth should be very small
        expect(result.realBalance).toBeLessThan(result.balance * 0.95); // Real should be < 95% of nominal
      }
    });

    it('should handle negative real returns when inflation exceeds nominal returns', () => {
      const investment = new Investment('Negative Real Return Test', {
        initialAmount: '100000',
        rateOfReturn: '3',      // 3% nominal return
        inflationRate: '5',     // 5% inflation
        annualContribution: '0'
      });
      investment.portfolioStore = { years: '2' };

      const results = investment.results;
      
      // Real rate should be (1.03 / 1.05) - 1 ≈ -1.90%
      const expectedRealRate = (1.03 / 1.05) - 1;
      expect(expectedRealRate).toBeLessThan(0); // Should be negative
      
      for (let year = 1; year <= 2; year++) {
        const result = results[year];
        const expectedReal = 100000 * Math.pow(1 + expectedRealRate, year);
        
        expect(result.realBalance).toBeCloseTo(expectedReal, 1);
        expect(result.realBalance).toBeLessThan(100000); // Real balance should decline
        expect(result.balance).toBeGreaterThan(100000);  // Nominal balance should grow
      }
    });
  });

  describe('real vs nominal gains calculations', () => {
    it('should calculate annual investment gains correctly in real terms', () => {
      const investment = new Investment('Annual Gains Test', {
        initialAmount: '100000',
        rateOfReturn: '8',
        inflationRate: '2',
        annualContribution: '0'
      });
      investment.portfolioStore = { years: '2' };

      const year1 = investment.results[1];
      const year2 = investment.results[2];
      
      // Year 1: Nominal gain should be 8% of 100k = $8,000
      expect(year1.annualInvestmentGain).toBeCloseTo(8000, 2);
      
      // Real gain should be based on real rate: (1.08/1.02 - 1) ≈ 5.88%
      const realRate = (1.08 / 1.02) - 1;
      const expectedRealGain = 100000 * realRate;
      expect(year1.realAnnualInvestmentGain).toBeCloseTo(expectedRealGain, 1);
      
      // Real gain should be less than nominal gain
      expect(year1.realAnnualInvestmentGain).toBeLessThan(year1.annualInvestmentGain);
      
      // Year 2: Gains should be calculated on the new balance
      const year1Balance = year1.balance;
      const year1RealBalance = year1.realBalance;
      
      expect(year2.annualInvestmentGain).toBeCloseTo(year1Balance * 0.08, 1);
      expect(year2.realAnnualInvestmentGain).toBeCloseTo(year1RealBalance * realRate, 1);
    });

    it('should maintain consistency between balance changes and yearly gains', () => {
      const investment = new Investment('Consistency Test', {
        initialAmount: '50000',
        rateOfReturn: '6',
        inflationRate: '2.5',
        annualContribution: '10000'
      });
      investment.portfolioStore = { years: '3' };

      const results = investment.results;
      
      for (let year = 1; year <= 3; year++) {
        const current = results[year];
        const previous = results[year - 1];
        
        // Balance change should equal yearly gain
        const nominalChange = current.balance - previous.balance;
        expect(nominalChange).toBeCloseTo(current.yearlyGain, 2);
        
        // Real balance change should equal real yearly gain
        const realChange = current.realBalance - previous.realBalance;
        expect(realChange).toBeCloseTo(current.realYearlyGain, 1);
        
        // Yearly gain should equal investment gain + contribution
        const expectedYearlyGain = current.annualInvestmentGain + current.annualContribution;
        expect(current.yearlyGain).toBeCloseTo(expectedYearlyGain, 2);
        
        // Same for real
        const expectedRealYearlyGain = current.realAnnualInvestmentGain + current.realAnnualContribution;
        expect(current.realYearlyGain).toBeCloseTo(expectedRealYearlyGain, 1);
      }
    });
  });

  describe('edge cases that reveal calculation bugs', () => {
    it('should handle very small inflation rates correctly', () => {
      const investment = new Investment('Small Inflation Test', {
        initialAmount: '100000',
        rateOfReturn: '7',
        inflationRate: '0.1',   // 0.1% inflation
        annualContribution: '0'
      });
      investment.portfolioStore = { years: '1' };

      const year1 = investment.results[1];
      
      // Real rate ≈ (1.07 / 1.001) - 1 ≈ 6.90%
      const expectedRealRate = (1.07 / 1.001) - 1;
      const expectedReal = 100000 * (1 + expectedRealRate);
      
      expect(year1.realBalance).toBeCloseTo(expectedReal, 1);
      expect(year1.realBalance).toBeLessThan(year1.balance);
      expect(year1.balance - year1.realBalance).toBeLessThan(1000); // Small gap
    });

    it('should prevent real gains from being significantly lower than expected (original bug scenario)', () => {
      // This test reproduces the original bug scenario where real gains were too low
      // Scenario: 7% nominal return, 2.5% inflation should give meaningful real gains
      const investment = new Investment('Real Gains Bug Test', {
        initialAmount: '1140000',
        rateOfReturn: '7',      // 7% nominal return
        inflationRate: '2.5',  // 2.5% inflation
        annualContribution: '0'
      });
      investment.portfolioStore = { years: '5' };

      const results = investment.results;
      
      // Calculate expected real growth rate using Fisher equation
      const nominalRate = 0.07;
      const inflationRate = 0.025;
      const expectedRealRate = (1 + nominalRate) / (1 + inflationRate) - 1;
      // Expected real rate ≈ 4.39%
      
      expect(expectedRealRate).toBeCloseTo(0.0439, 3);
      
      // Test each year to ensure real gains are meaningful
      for (let year = 1; year <= 5; year++) {
        const result = results[year];
        const previousResult = results[year - 1];
        
        // Real annual investment gain should be meaningful, not tiny
        const realGain = result.realAnnualInvestmentGain;
        const nominalGain = result.annualInvestmentGain;
        
        // Real gain should be approximately 4.39% of the previous real balance
        const expectedRealGain = previousResult.realBalance * expectedRealRate;
        
        // Real gain should be close to expected (within 1% tolerance)
        expect(realGain).toBeCloseTo(expectedRealGain, 0);
        
        // Real gain should NOT be dramatically lower than nominal gain
        // However, the ratio will decrease over time due to cumulative inflation effects
        // In year 1, the ratio should be close to real_rate/nominal_rate
        // In later years, it will be lower due to the real balance being smaller
        const theoreticalRatio = expectedRealRate / nominalRate; // ≈ 0.627
        const actualRatio = realGain / nominalGain;
        
        if (year === 1) {
          // Year 1 should be very close to the theoretical ratio
          expect(actualRatio).toBeCloseTo(theoreticalRatio, 4);
        } else {
          // Later years will have lower ratios due to cumulative inflation
          // But should still be reasonable (not dramatically lower)
          expect(actualRatio).toBeGreaterThan(0.55); // Should be > 55% even in later years
          expect(actualRatio).toBeLessThan(theoreticalRatio); // Should be less than theoretical
        }
        
        // Verify the bug is NOT present: real gain should not be tiny
        expect(realGain).toBeGreaterThan(previousResult.realBalance * 0.04); // At least 4% real growth
      }
      
      // Final check: after 5 years, real balance should have grown meaningfully
      const finalReal = results[5].realBalance;
      const expectedFinalReal = 1140000 * Math.pow(1 + expectedRealRate, 5);
      
      expect(finalReal).toBeCloseTo(expectedFinalReal, -2); // Within $100
      expect(finalReal).toBeGreaterThan(1140000 * 1.20); // Should grow by at least 20% in real terms
    });

    it('should handle very high inflation rates correctly', () => {
      const investment = new Investment('Very High Inflation Test', {
        initialAmount: '100000',
        rateOfReturn: '7',
        inflationRate: '20',    // 20% inflation!
        annualContribution: '0'
      });
      investment.portfolioStore = { years: '1' };

      const year1 = investment.results[1];
      
      // Real rate = (1.07 / 1.20) - 1 ≈ -10.83% (negative!)
      const expectedRealRate = (1.07 / 1.20) - 1;
      const expectedReal = 100000 * (1 + expectedRealRate);
      
      expect(expectedRealRate).toBeLessThan(0);
      expect(year1.realBalance).toBeCloseTo(expectedReal, 1);
      expect(year1.realBalance).toBeLessThan(100000); // Real value declines
      expect(year1.balance).toBe(107000); // Nominal grows to 107k
    });

    it('should never show identical real and nominal values when inflation > 0', () => {
      // This is the key test that should catch the current bug!
      const investment = new Investment('Identity Bug Test', {
        initialAmount: '1140000',
        rateOfReturn: '7',
        inflationRate: '2.5',
        annualContribution: '0'
      });
      investment.portfolioStore = { years: '5' };

      const results = investment.results;
      
      for (let year = 1; year <= 5; year++) {
        const result = results[year];
        
        // The fundamental assertion: real ≠ nominal when inflation > 0
        expect(result.realBalance).not.toEqual(result.balance);
        expect(result.realAnnualInvestmentGain).not.toEqual(result.annualInvestmentGain);
        expect(result.realYearlyGain).not.toEqual(result.yearlyGain);
        
        // Real should always be less than nominal with positive inflation
        expect(result.realBalance).toBeLessThan(result.balance);
        expect(result.realAnnualInvestmentGain).toBeLessThan(result.annualInvestmentGain);
      }
    });
  });
});