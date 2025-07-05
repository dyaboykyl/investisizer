import { Investment } from './Investment';

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
    const investment = new Investment('Test Investment', {
      initialAmount: '100000',
      annualContribution: '12000',
      rateOfReturn: '7',
      years: '5'
    });

    // Calculate without withdrawals
    investment.calculateProjection();
    const balanceWithoutWithdrawals = investment.finalResult?.balance || 0;

    // Calculate with property withdrawals ($1000/month = $12000/year)
    const withdrawals = [12000, 12000, 12000, 12000, 12000]; // $12k per year for 5 years
    investment.calculateProjection(undefined, withdrawals);
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