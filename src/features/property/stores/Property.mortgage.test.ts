import { Property } from '@/features/property/stores/Property';

describe('Property - Mortgage Edge Cases', () => {
  describe('custom payment after mortgage payoff', () => {
    it('should continue custom payments after mortgage is paid off', () => {
      const property = new Property('Paid Off Property', {
        purchasePrice: '200000',
        downPaymentPercentage: '20',
        interestRate: '5',
        loanTerm: '15',
        yearsBought: '16', // Mortgage already paid off
        years: '5',
        monthlyPayment: '2500' // Custom payment including other fees
      });

      const results = property.results;
      
      // Year 0 should show custom payment even though mortgage is paid off
      expect(results[0].mortgageBalance).toBe(0);
      expect(results[0].monthlyPayment).toBe(2500);
      expect(results[0].principalInterestPayment).toBe(0);
      expect(results[0].otherFeesPayment).toBe(2500);
      
      // Subsequent years should also continue custom payment
      expect(results[1].monthlyPayment).toBe(2500);
      expect(results[1].principalInterestPayment).toBe(0);
      expect(results[1].otherFeesPayment).toBe(2500);
    });

    it('should stop payments after mortgage payoff when using calculated P+I', () => {
      const property = new Property('Paid Off Property', {
        purchasePrice: '200000',
        downPaymentPercentage: '20',
        interestRate: '5',
        loanTerm: '15',
        yearsBought: '16', // Mortgage already paid off
        years: '5',
        monthlyPayment: '' // No custom payment
      });

      const results = property.results;
      
      // Should have no payments since mortgage is paid off
      expect(results[0].mortgageBalance).toBe(0);
      expect(results[0].monthlyPayment).toBe(0);
      expect(results[0].principalInterestPayment).toBe(0);
      expect(results[0].otherFeesPayment).toBe(0);
    });

    it('should handle mortgage payoff during projection period with custom payment', () => {
      const property = new Property('Will Pay Off Property', {
        purchasePrice: '200000',
        downPaymentPercentage: '20',
        interestRate: '5',
        loanTerm: '15',
        yearsBought: '13', // 2 years left on mortgage
        years: '5',
        monthlyPayment: '2000' // Custom payment
      });

      const results = property.results;
      
      // Should have mortgage balance in early years
      expect(results[0].mortgageBalance).toBeGreaterThan(0);
      expect(results[1].mortgageBalance).toBeGreaterThan(0);
      
      // After payoff, should continue custom payment
      const payoffYear = results.find(r => r.mortgageBalance === 0 && r.year > 0);
      expect(payoffYear).toBeDefined();
      if (payoffYear) {
        expect(payoffYear.monthlyPayment).toBe(2000);
        expect(payoffYear.principalInterestPayment).toBe(0);
        expect(payoffYear.otherFeesPayment).toBe(2000);
      }
    });
  });

  describe('post-sale cash flow', () => {
    it('should have zero cash flow after property sale', () => {
      const property = new Property('Sale Property', {
        purchasePrice: '400000',
        years: '10',
        monthlyPayment: '3000'
      });

      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);

      const results = property.results;
      
      // Years before sale should have negative cash flow (mortgage payments)
      expect(results[4].annualCashFlow).toBe(-36000); // Year 4: -$3000 x 12
      
      // Sale year should have cash flow up to sale month
      expect(results[5].isSaleYear).toBe(true);
      expect(results[5].annualCashFlow).toBeLessThan(0); // Partial year payments
      
      // Years after sale should have zero cash flow
      expect(results[6].isPostSale).toBe(true);
      expect(results[6].annualCashFlow).toBe(0);
      expect(results[7].annualCashFlow).toBe(0);
    });

    it('should handle rental property cash flow after sale', () => {
      const property = new Property('Rental Sale Property', {
        purchasePrice: '400000',
        years: '10',
        isRentalProperty: true,
        monthlyRent: '3500',
        monthlyPayment: '2500',
        annualExpenses: '6000'
      });

      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);

      const results = property.results;
      
      // Before sale: positive cash flow from rental
      const yearBeforeSale = results[4];
      expect(yearBeforeSale.annualCashFlow).toBeGreaterThan(0);
      
      // After sale: zero cash flow
      const yearAfterSale = results[6];
      expect(yearAfterSale.isPostSale).toBe(true);
      expect(yearAfterSale.annualCashFlow).toBe(0);
      expect(yearAfterSale.annualRentalIncome).toBe(0);
      expect(yearAfterSale.annualRentalExpenses).toBe(0);
    });
  });

  describe('partial year calculations', () => {
    it('should prorate rental income and expenses for sale month', () => {
      const property = new Property('Partial Year Rental', {
        purchasePrice: '300000',
        years: '10',
        isRentalProperty: true,
        monthlyRent: '2000',
        annualExpenses: '12000' // $1000/month
      });

      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('saleMonth', 3); // Sell in March

      const results = property.results;
      const saleYearResult = results[5];
      
      // Should only have 3 months of rental income (with growth applied to year 5)
      // Base rent: $2000, Growth: 3% default for 5 years = $2000 * 1.03^5 ≈ $2318.85
      // 3 months: $2318.85 * 3 = $6956.55 * 0.95 (vacancy) ≈ $6608.72
      expect(saleYearResult.annualRentalIncome).toBeCloseTo(6608, 0);
      
      // Should only have 3 months of expenses (with growth)
      // Base expenses: $12000/year = $1000/month, Growth: 3% for 5 years
      // Monthly: $1000 * 1.03^5 ≈ $1159.27, 3 months ≈ $3478
      expect(saleYearResult.annualRentalExpenses).toBeCloseTo(3478, 0);
    });
  });
});