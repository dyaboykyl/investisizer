import { Investment } from '@/features/investment/stores/Investment';

describe('Investment', () => {
  it('should create an investment with default values', () => {
    const investment = new Investment();

    expect(investment.name).toBe('New Investment');
    expect(investment.type).toBe('investment');
    expect(investment.enabled).toBe(true);
    expect(investment.inputs.initialAmount).toBe('10000');
    expect(investment.inputs.years).toBe('10');
    expect(investment.inputs.rateOfReturn).toBe('7');
    expect(investment.inputs.inflationRate).toBe('2.5');
    expect(investment.inputs.annualContribution).toBe('5000');
  });

  it('should create an investment with custom values', () => {
    const investment = new Investment('My Portfolio', {
      initialAmount: '50000',
      years: '20',
      rateOfReturn: '8',
      inflationRate: '3',
      annualContribution: '10000'
    });

    expect(investment.name).toBe('My Portfolio');
    expect(investment.inputs.initialAmount).toBe('50000');
    expect(investment.inputs.years).toBe('20');
    expect(investment.inputs.rateOfReturn).toBe('8');
    expect(investment.inputs.inflationRate).toBe('3');
    expect(investment.inputs.annualContribution).toBe('10000');
  });

  it('should calculate investment projections correctly', () => {
    const investment = new Investment('Test Investment', {
      initialAmount: '10000',
      years: '3',
      rateOfReturn: '10',
      inflationRate: '2',
      annualContribution: '1000'
    });

    expect(investment.hasResults).toBe(true);
    expect(investment.results.length).toBe(4); // Year 0 + 3 years

    const year0 = investment.results[0];
    expect(year0.year).toBe(0);
    expect(year0.balance).toBe(10000);
    expect(year0.annualContribution).toBe(0);

    const year1 = investment.results[1];
    expect(year1.year).toBe(1);
    expect(year1.balance).toBe(12000); // 10000 * 1.1 + 1000 = 11000 + 1000 (contribution added after growth)
    expect(year1.annualContribution).toBe(1000);

    const finalResult = investment.finalResult;
    expect(finalResult?.year).toBe(3);
    expect(finalResult?.balance).toBeGreaterThan(10000);
  });

  it('should handle inflation-adjusted contributions', () => {
    const investment = new Investment('Test Investment', {
      initialAmount: '10000',
      years: '2',
      rateOfReturn: '5',
      inflationRate: '3',
      annualContribution: '1000'
    });

    // Test without inflation adjustment
    investment.setInflationAdjustedContributions(false);
    const withoutAdjustment = investment.results[1].realAnnualContribution;

    // Test with inflation adjustment
    investment.setInflationAdjustedContributions(true);
    const withAdjustment = investment.results[1].realAnnualContribution;

    expect(withAdjustment).toBeGreaterThan(withoutAdjustment);
  });

  it('should update inputs and recalculate', () => {
    const investment = new Investment();
    const initialFinalBalance = investment.finalResult?.balance || 0;

    investment.updateInput('rateOfReturn', '15');
    const newFinalBalance = investment.finalResult?.balance || 0;

    expect(newFinalBalance).toBeGreaterThan(initialFinalBalance);
    expect(investment.inputs.rateOfReturn).toBe('15');
  });

  it('should serialize and deserialize correctly', () => {
    const original = new Investment('Test Investment', {
      initialAmount: '25000',
      years: '15',
      rateOfReturn: '6',
      inflationRate: '2.5',
      annualContribution: '3000'
    });
    original.setInflationAdjustedContributions(true);
    original.setShowBalance(false);

    const json = original.toJSON();
    const restored = Investment.fromJSON(json);

    expect(restored.name).toBe(original.name);
    expect(restored.type).toBe(original.type);
    expect(restored.enabled).toBe(original.enabled);
    expect(restored.inputs).toEqual(original.inputs);
    expect(restored.inflationAdjustedContributions).toBe(original.inflationAdjustedContributions);
    expect(restored.showBalance).toBe(original.showBalance);
  });

  it('should handle negative contributions (withdrawals)', () => {
    const investment = new Investment('Test Investment', {
      initialAmount: '50000',
      years: '5',
      rateOfReturn: '7',
      inflationRate: '2',
      annualContribution: '-2000' // Withdrawal
    });

    expect(investment.hasResults).toBe(true);
    
    const finalResult = investment.finalResult;
    expect(finalResult?.balance).toBeGreaterThan(40000); // Should grow despite withdrawals due to 7% return
    expect(finalResult?.balance).toBeLessThan(70000); // But less than if no withdrawals
    expect(finalResult?.annualContribution).toBe(-2000);
  });

  it('should apply property cash flows before calculating growth', () => {
    // Test case from the prompt:
    // Initial: $100,000, Rate: 10%, Property cash flow: $20,000/year
    // Year 1 should be: ($100,000 - $20,000) × 1.10 = $88,000
    // NOT: $100,000 × 1.10 - $20,000 = $90,000
    
    const investment = new Investment('Test Investment', {
      initialAmount: '100000',
      years: '1',
      rateOfReturn: '10',
      inflationRate: '0',
      annualContribution: '0'
    });
    
    // Mock linked property cash flows
    investment.portfolioStore = {
      startingYear: '2024',
      getLinkedPropertyCashFlows: () => [-20000] // -$20,000 cash flow in year 1 (withdrawal)
    };
    
    const year1 = investment.results[1];
    expect(year1.balance).toBe(88000); // Correct calculation
    expect(year1.annualContribution).toBe(0); // Direct contribution only
    expect(year1.propertyCashFlow).toBe(-20000); // Property cash flow shown separately
    
    // Verify this is NOT the old incorrect calculation
    expect(year1.balance).not.toBe(90000); // Would be wrong
  });

  it('should calculate annual investment gains correctly (excluding contributions)', () => {
    // Test that annual investment gains show only the growth from returns
    const investment = new Investment('Test Investment', {
      initialAmount: '100000',
      years: '2',
      rateOfReturn: '10',
      inflationRate: '0',
      annualContribution: '5000'
    });
    
    const year1 = investment.results[1];
    const year2 = investment.results[2];
    
    // Year 1: $100,000 * 1.10 + $5,000 = $115,000
    // Annual investment gain should be: $100,000 * 0.10 = $10,000 (growth only)
    // Yearly gain should be: $115,000 - $100,000 = $15,000 (growth + contribution)
    expect(year1.balance).toBe(115000);
    expect(year1.yearlyGain).toBe(15000); // Total change including contribution
    expect(year1.annualInvestmentGain).toBe(10000); // Growth only
    expect(year1.annualContribution).toBe(5000); // Contribution
    
    // Year 2: $115,000 * 1.10 + $5,000 = $131,500
    // Annual investment gain should be: $115,000 * 0.10 = $11,500 (growth only)
    expect(year2.balance).toBe(131500);
    expect(year2.yearlyGain).toBe(16500); // Total change including contribution
    expect(year2.annualInvestmentGain).toBe(11500); // Growth only
    expect(year2.annualContribution).toBe(5000); // Contribution
  });

  it('should calculate earnings correctly', () => {
    const investment = new Investment('Test Investment', {
      initialAmount: '10000',
      years: '1',
      rateOfReturn: '10',
      inflationRate: '0',
      annualContribution: '1000'
    });

    const finalResult = investment.finalResult;
    expect(finalResult?.totalEarnings).toBe(1000); // 10% on initial amount = 1000
  });

  it('should handle linked property cash flows', () => {
    // Create a mock portfolio store to provide cash flow context
    const mockPortfolioStore = {
      startingYear: '2024',
      getLinkedPropertyCashFlows: jest.fn()
    };

    const investment = new Investment('Test Investment', {
      initialAmount: '100000',
      annualContribution: '12000',
      rateOfReturn: '7',
      years: '5'
    });

    // Inject portfolio store context
    investment.portfolioStore = mockPortfolioStore;

    // Test without cash flows
    mockPortfolioStore.getLinkedPropertyCashFlows.mockReturnValue([0, 0, 0, 0, 0]);
    const balanceWithoutCashFlows = investment.finalResult?.balance || 0;

    // Test with property cash flows ($12k per year for 5 years - negative = withdrawal)
    const cashFlows = [-12000, -12000, -12000, -12000, -12000];
    mockPortfolioStore.getLinkedPropertyCashFlows.mockReturnValue(cashFlows);
    const balanceWithCashFlows = investment.finalResult?.balance || 0;

    // Balance should be lower with cash flows
    expect(balanceWithCashFlows).toBeLessThan(balanceWithoutCashFlows);
    
    // The difference should be significant (cash flows reduce the growth)
    expect(balanceWithoutCashFlows - balanceWithCashFlows).toBeGreaterThan(50000);
    
    // Annual contribution should show only direct contribution, property cash flow shown separately
    const finalResult = investment.finalResult;
    expect(finalResult?.annualContribution).toBe(12000); // Direct contribution only
    expect(finalResult?.propertyCashFlow).toBe(-12000); // Property cash flow shown separately
  });

  describe('summaryData computed property', () => {
    it('should not return null for zero initial amount', () => {
      const investment = new Investment('Test Investment', {
        initialAmount: '0',
        years: '5',
        annualContribution: '1000'
      });
      
      // Even with zero initial amount, should have results if there are contributions
      expect(investment.finalResult).not.toBeNull();
      expect(investment.summaryData).not.toBeNull();
      expect(investment.summaryData!.initialAmount).toBe(0);
    });

    it('should calculate summary data correctly for basic investment', () => {
      const investment = new Investment('Test Investment', {
        initialAmount: '10000',
        years: '3',
        rateOfReturn: '10',
        inflationRate: '2',
        annualContribution: '1000'
      });

      const summary = investment.summaryData;
      expect(summary).not.toBeNull();
      expect(summary!.initialAmount).toBe(10000);
      expect(summary!.totalManualContributed).toBe(3000); // 3 years * 1000
      expect(summary!.totalManualWithdrawn).toBe(0);
      expect(summary!.totalPropertyCashFlow).toBe(0);
      expect(summary!.netContributions).toBe(3000);
      expect(summary!.linkedProperties).toEqual([]);
    });

    it('should handle negative contributions (withdrawals)', () => {
      const investment = new Investment('Test Investment', {
        initialAmount: '50000',
        years: '2',
        rateOfReturn: '7',
        inflationRate: '0',
        annualContribution: '-5000' // Withdrawal
      });

      const summary = investment.summaryData;
      expect(summary).not.toBeNull();
      expect(summary!.totalManualContributed).toBe(0);
      expect(summary!.totalManualWithdrawn).toBe(10000); // 2 years * 5000
      expect(summary!.netContributions).toBe(-10000);
      expect(summary!.totalReturn).toBeGreaterThan(0); // Should have positive returns despite withdrawals
    });

    it('should handle inflation-adjusted contributions', () => {
      const investment = new Investment('Test Investment', {
        initialAmount: '10000',
        years: '3',
        rateOfReturn: '5',
        inflationRate: '3',
        annualContribution: '1000'
      });

      investment.setInflationAdjustedContributions(false);
      const summaryWithoutAdjustment = investment.summaryData;
      
      investment.setInflationAdjustedContributions(true);
      const summaryWithAdjustment = investment.summaryData;

      expect(summaryWithAdjustment!.totalManualContributed).toBeGreaterThan(
        summaryWithoutAdjustment!.totalManualContributed
      );
    });

    it('should calculate total return percentage correctly', () => {
      const investment = new Investment('Test Investment', {
        initialAmount: '10000',
        years: '1',
        rateOfReturn: '10',
        inflationRate: '0',
        annualContribution: '0'
      });

      const summary = investment.summaryData;
      expect(summary!.totalReturn).toBeCloseTo(10, 1); // Should be close to 10%
    });

    it('should handle mixed contributions and withdrawals', () => {
      const investment = new Investment('Test Investment', {
        initialAmount: '20000',
        years: '2',
        rateOfReturn: '5',
        inflationRate: '0',
        annualContribution: '2000' // Contributions
      });

      // Mock some property cash flows (withdrawals)
      investment.portfolioStore = {
        startingYear: '2024',
        properties: [{
          enabled: true,
          inputs: { linkedInvestmentId: investment.id, monthlyPayment: '500' },
          calculatedPrincipalInterestPayment: 500
        }]
      } as any;

      const summary = investment.summaryData;
      expect(summary!.totalManualContributed).toBe(4000); // 2 years * 2000
      expect(summary!.totalPropertyCashFlow).toBe(12000); // 2 years * 12 months * 500
      expect(summary!.totalWithdrawn).toBe(12000);
      expect(summary!.netContributions).toBe(-8000); // 4000 - 12000
    });

    it('should calculate final net gains correctly', () => {
      const investment = new Investment('Test Investment', {
        initialAmount: '15000',
        years: '2',
        rateOfReturn: '8',
        inflationRate: '2',
        annualContribution: '1000'
      });

      const summary = investment.summaryData;
      const finalResult = investment.finalResult!;
      
      expect(summary!.finalNetGain).toBe(finalResult.balance - 15000);
      expect(summary!.realFinalNetGain).toBe(finalResult.realBalance - 15000);
      expect(summary!.finalNetGain).toBeGreaterThan(summary!.realFinalNetGain); // Nominal should be higher
    });

    it('should provide summary data even when initial amount is zero', () => {
      const investment = new Investment('Zero Initial Investment', {
        initialAmount: '0', // Zero initial amount
        years: '5',
        rateOfReturn: '7',
        inflationRate: '2',
        annualContribution: '5000' // Funded through contributions
      });

      const summary = investment.summaryData;
      
      // Summary should not be null even with zero initial amount
      expect(summary).not.toBeNull();
      expect(summary!.initialAmount).toBe(0);
      expect(summary!.totalManualContributed).toBe(25000); // 5 years * 5000
      expect(summary!.netContributions).toBe(25000);
      
      // Should have grown through contributions and returns
      const finalResult = investment.finalResult!;
      expect(finalResult.balance).toBeGreaterThan(25000);
      expect(summary!.totalEarnings).toBeGreaterThan(0);
    });

    it('should provide summary data when funded through contributions only (zero initial)', () => {
      const investment = new Investment('Contribution-Only Investment', {
        initialAmount: '0', // Zero initial amount
        years: '3',
        rateOfReturn: '6',
        inflationRate: '2',
        annualContribution: '10000' // $10k per year
      });

      const summary = investment.summaryData;
      
      // Summary should not be null even with zero initial amount
      expect(summary).not.toBeNull();
      expect(summary!.initialAmount).toBe(0);
      expect(summary!.totalManualContributed).toBe(30000); // 3 years * 10000
      expect(summary!.totalPropertyCashFlow).toBe(0); // No property cash flows
      expect(summary!.netContributions).toBe(30000); // Just manual contributions
      
      // Should have grown through contributions and returns
      const finalResult = investment.finalResult!;
      expect(finalResult.balance).toBeGreaterThan(30000); // Growth from returns
      expect(summary!.totalEarnings).toBeGreaterThan(0);
      
      // Final net gain should include both contributions and earnings when initial amount is zero
      expect(summary!.finalNetGain).toBe(summary!.totalEarnings + summary!.netContributions);
    });

    it('should have consistent real balance growth with real yearly gains', () => {
      const investment = new Investment('Real Balance Test', {
        initialAmount: '1000000',
        years: '3',
        rateOfReturn: '7',
        inflationRate: '3',
        annualContribution: '-50000' // Withdrawals
      });

      const results = investment.results;
      
      // Check that real balance changes are consistent with real yearly gains
      for (let i = 1; i < results.length; i++) {
        const currentResult = results[i];
        const previousResult = results[i - 1];
        
        // Real balance change should equal real yearly gain
        const realBalanceChange = currentResult.realBalance - previousResult.realBalance;
        const realYearlyGain = currentResult.realYearlyGain;
        
        // They should be approximately equal (allowing for rounding)
        expect(Math.abs(realBalanceChange - realYearlyGain)).toBeLessThan(1);
      }
      
      // Real balance should show meaningful growth despite inflation
      const initialRealBalance = results[0].realBalance;
      const finalRealBalance = results[results.length - 1].realBalance;
      expect(finalRealBalance).not.toBeCloseTo(initialRealBalance, -2); // Should differ by more than $100
    });

    it('should have matching real net gain and real investment gain when contributions are zero', () => {
      const investment = new Investment('Zero Contribution Test', {
        initialAmount: '100000',
        years: '3',
        rateOfReturn: '7',
        inflationRate: '3',
        annualContribution: '0' // No contributions
      });

      const results = investment.results;
      
      // When contributions are 0, real yearly gain should equal real investment gain
      for (let i = 1; i < results.length; i++) {
        const currentResult = results[i];
        
        // With zero contributions, these should match
        expect(Math.abs(currentResult.realYearlyGain - currentResult.realAnnualInvestmentGain)).toBeLessThan(0.01);
        
        // Nominal should also match
        expect(Math.abs(currentResult.yearlyGain - currentResult.annualInvestmentGain)).toBeLessThan(0.01);
      }
    });
  });
});