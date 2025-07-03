import { InvestmentStore } from './InvestmentStore';

describe('InvestmentStore', () => {
  let store: InvestmentStore;

  beforeEach(() => {
    store = new InvestmentStore();
  });

  describe('Initial State', () => {
    it('should have correct initial input values', () => {
      expect(store.initialAmount).toBe('10000');
      expect(store.years).toBe('10');
      expect(store.rateOfReturn).toBe('7');
      expect(store.inflationRate).toBe('2.5');
      expect(store.annualContribution).toBe('5000');
    });

    it('should have correct initial UI state', () => {
      expect(store.showBalance).toBe(true);
      expect(store.showContributions).toBe(true);
      expect(store.showNetGain).toBe(true);
      expect(store.showNominal).toBe(true);
      expect(store.showReal).toBe(true);
    });

    it('should have empty results initially', () => {
      expect(store.results).toEqual([]);
      expect(store.hasResults).toBe(false);
      expect(store.finalResult).toBe(null);
    });
  });

  describe('Input Setters', () => {
    it('should update initialAmount', () => {
      store.setInitialAmount('20000');
      expect(store.initialAmount).toBe('20000');
    });

    it('should update years', () => {
      store.setYears('20');
      expect(store.years).toBe('20');
    });

    it('should update rateOfReturn', () => {
      store.setRateOfReturn('8.5');
      expect(store.rateOfReturn).toBe('8.5');
    });

    it('should update inflationRate', () => {
      store.setInflationRate('3.5');
      expect(store.inflationRate).toBe('3.5');
    });

    it('should update annualContribution', () => {
      store.setAnnualContribution('-2000');
      expect(store.annualContribution).toBe('-2000');
    });
  });

  describe('UI State Setters', () => {
    it('should update showBalance', () => {
      store.setShowBalance(false);
      expect(store.showBalance).toBe(false);
    });

    it('should update showContributions', () => {
      store.setShowContributions(false);
      expect(store.showContributions).toBe(false);
    });

    it('should update showNetGain', () => {
      store.setShowNetGain(false);
      expect(store.showNetGain).toBe(false);
    });

    it('should update showNominal', () => {
      store.setShowNominal(false);
      expect(store.showNominal).toBe(false);
    });

    it('should update showReal', () => {
      store.setShowReal(false);
      expect(store.showReal).toBe(false);
    });
  });

  describe('calculateProjection', () => {
    it('should calculate basic projection correctly', () => {
      store.setInitialAmount('1000');
      store.setYears('2');
      store.setRateOfReturn('10');
      store.setInflationRate('2');
      store.setAnnualContribution('100');

      store.calculateProjection();

      expect(store.results).toHaveLength(2);
      expect(store.hasResults).toBe(true);

      // Year 1: 1000 * 1.1 + 100 = 1200
      const year1 = store.results[0];
      expect(year1.year).toBe(1);
      expect(year1.balance).toBe(1200);
      expect(year1.annualContribution).toBe(100);
      expect(year1.yearlyGain).toBe(100); // 10% of 1000
      expect(year1.totalEarnings).toBe(100); // balance - total contributions (1200 - 1100)

      // Year 2: 1200 * 1.1 + 100 = 1420
      const year2 = store.results[1];
      expect(year2.year).toBe(2);
      expect(year2.balance).toBe(1420);
      expect(year2.annualContribution).toBe(100);
      expect(year2.yearlyGain).toBe(120); // 10% of 1200
      expect(year2.totalEarnings).toBe(220); // balance - total contributions (1420 - 1200)
    });

    it('should calculate inflation-adjusted values correctly', () => {
      store.setInitialAmount('1000');
      store.setYears('1');
      store.setRateOfReturn('10');
      store.setInflationRate('2');
      store.setAnnualContribution('100');

      store.calculateProjection();

      const result = store.results[0];
      const inflationFactor = 1.02; // 1 + 2/100
      
      expect(result.realBalance).toBe(Math.round((1200 / inflationFactor) * 100) / 100);
      expect(result.realAnnualContribution).toBe(Math.round((100 / inflationFactor) * 100) / 100);
      expect(result.realYearlyGain).toBe(Math.round((100 / inflationFactor) * 100) / 100);
      expect(result.realTotalEarnings).toBe(Math.round((100 / inflationFactor) * 100) / 100);
    });

    it('should handle negative contributions (withdrawals)', () => {
      store.setInitialAmount('10000');
      store.setYears('2');
      store.setRateOfReturn('5');
      store.setInflationRate('2');
      store.setAnnualContribution('-500');

      store.calculateProjection();

      // Year 1: 10000 * 1.05 - 500 = 10000
      const year1 = store.results[0];
      expect(year1.balance).toBe(10000);
      expect(year1.annualContribution).toBe(-500);
      expect(year1.yearlyGain).toBe(500); // 5% of 10000

      // Year 2: 10000 * 1.05 - 500 = 10000
      const year2 = store.results[1];
      expect(year2.balance).toBe(10000);
      expect(year2.yearlyGain).toBe(500); // 5% of 10000
    });

    it('should handle invalid inputs gracefully', () => {
      store.setInitialAmount('abc');
      store.setYears('xyz');
      store.setRateOfReturn('');
      store.setInflationRate('');
      store.setAnnualContribution('');

      store.calculateProjection();

      expect(store.results).toHaveLength(1); // Default to 1 year
      const result = store.results[0];
      expect(result.balance).toBe(0);
      expect(result.realBalance).toBe(0);
    });

    it('should handle zero rate of return', () => {
      store.setInitialAmount('1000');
      store.setYears('2');
      store.setRateOfReturn('0');
      store.setInflationRate('2');
      store.setAnnualContribution('100');

      store.calculateProjection();

      const year1 = store.results[0];
      expect(year1.balance).toBe(1100); // 1000 + 100
      expect(year1.yearlyGain).toBe(0);

      const year2 = store.results[1];
      expect(year2.balance).toBe(1200); // 1100 + 100
      expect(year2.yearlyGain).toBe(0);
    });
  });

  describe('Computed Values', () => {
    it('should compute hasResults correctly', () => {
      expect(store.hasResults).toBe(false);
      
      store.calculateProjection();
      expect(store.hasResults).toBe(true);
    });

    it('should compute finalResult correctly', () => {
      expect(store.finalResult).toBe(null);
      
      store.setYears('3');
      store.calculateProjection();
      
      expect(store.finalResult).toBeDefined();
      expect(store.finalResult?.year).toBe(3);
      expect(store.finalResult).toBe(store.results[2]);
    });

    it('should compute annualContributionNumber correctly', () => {
      expect(store.annualContributionNumber).toBe(5000);
      
      store.setAnnualContribution('-1000');
      expect(store.annualContributionNumber).toBe(-1000);
      
      store.setAnnualContribution('abc');
      expect(store.annualContributionNumber).toBe(0);
      
      store.setAnnualContribution('');
      expect(store.annualContributionNumber).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      store.setInitialAmount('1000000000');
      store.setYears('1');
      store.setRateOfReturn('100');
      store.setAnnualContribution('1000000');

      store.calculateProjection();

      const result = store.results[0];
      expect(result.balance).toBe(2001000000); // 1B * 2 + 1M
    });

    it('should handle negative rate of return', () => {
      store.setInitialAmount('1000');
      store.setYears('1');
      store.setRateOfReturn('-10');
      store.setAnnualContribution('0');

      store.calculateProjection();

      const result = store.results[0];
      expect(result.balance).toBe(900); // 1000 * 0.9
      expect(result.yearlyGain).toBe(-100);
    });

    it('should handle high inflation rate', () => {
      store.setInitialAmount('1000');
      store.setYears('1');
      store.setRateOfReturn('10');
      store.setInflationRate('100');
      store.setAnnualContribution('0');

      store.calculateProjection();

      const result = store.results[0];
      expect(result.balance).toBe(1100);
      expect(result.realBalance).toBe(550); // 1100 / 2
    });
  });
});