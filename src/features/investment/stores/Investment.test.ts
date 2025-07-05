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

  it('should apply property withdrawals before calculating growth', () => {
    // Test case from the prompt:
    // Initial: $100,000, Rate: 10%, Property withdrawal: $20,000/year
    // Year 1 should be: ($100,000 - $20,000) × 1.10 = $88,000
    // NOT: $100,000 × 1.10 - $20,000 = $90,000
    
    const investment = new Investment('Test Investment', {
      initialAmount: '100000',
      years: '1',
      rateOfReturn: '10',
      inflationRate: '0',
      annualContribution: '0'
    });
    
    // Mock linked property withdrawals
    investment.portfolioStore = {
      startingYear: '2024',
      getLinkedPropertyWithdrawals: () => [20000] // $20,000 withdrawal in year 1
    };
    
    const year1 = investment.results[1];
    expect(year1.balance).toBe(88000); // Correct calculation
    expect(year1.annualContribution).toBe(-20000); // Shows the withdrawal
    
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

  it('should handle linked property withdrawals', () => {
    // Create a mock portfolio store to provide withdrawal context
    const mockPortfolioStore = {
      startingYear: '2024',
      getLinkedPropertyWithdrawals: jest.fn()
    };

    const investment = new Investment('Test Investment', {
      initialAmount: '100000',
      annualContribution: '12000',
      rateOfReturn: '7',
      years: '5'
    });

    // Inject portfolio store context
    investment.portfolioStore = mockPortfolioStore;

    // Test without withdrawals
    mockPortfolioStore.getLinkedPropertyWithdrawals.mockReturnValue([0, 0, 0, 0, 0]);
    const balanceWithoutWithdrawals = investment.finalResult?.balance || 0;

    // Test with property withdrawals ($12k per year for 5 years)
    const withdrawals = [12000, 12000, 12000, 12000, 12000];
    mockPortfolioStore.getLinkedPropertyWithdrawals.mockReturnValue(withdrawals);
    const balanceWithWithdrawals = investment.finalResult?.balance || 0;

    // Balance should be lower with withdrawals
    expect(balanceWithWithdrawals).toBeLessThan(balanceWithoutWithdrawals);
    
    // The difference should be significant (withdrawals reduce the growth)
    expect(balanceWithoutWithdrawals - balanceWithWithdrawals).toBeGreaterThan(50000);
    
    // Annual contribution should show net effect (contribution - withdrawal)
    const finalResult = investment.finalResult;
    expect(finalResult?.annualContribution).toBe(0); // 12000 contribution - 12000 withdrawal = 0
  });
});