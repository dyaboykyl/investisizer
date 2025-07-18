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
        monthlyPayment: '2500' // Custom payment including other fees
      });
      property.portfolioStore = { years: '5' };

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
        monthlyPayment: '' // No custom payment
      });
      property.portfolioStore = { years: '5' };

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
        monthlyPayment: '2000' // Custom payment
      });
      property.portfolioStore = { years: '5' };

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
        monthlyPayment: '3000'
      });
      property.portfolioStore = { years: '10' };

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
        isRentalProperty: true,
        monthlyRent: '3500',
        monthlyPayment: '2500',
        maintenanceRate: '1.5'
      });
      property.portfolioStore = { years: '10' };

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
      expect(yearAfterSale.totalRentalExpenses).toBe(0);
    });
  });

  describe('partial year calculations', () => {
    it('should prorate rental income and expenses for sale month', () => {
      const property = new Property('Partial Year Rental', {
        purchasePrice: '300000',
        isRentalProperty: true,
        monthlyRent: '2000',
        maintenanceRate: '3'   // 3% of property value
      });
      property.portfolioStore = { years: '10' };

      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('saleMonth', 3); // Sell in March

      const results = property.results;
      const saleYearResult = results[5];
      
      // Should only have 3 months of rental income (with growth applied to year 5)
      // Base rent: $2000, Growth: 3% default for 5 years = $2000 * 1.03^5 ≈ $2318.85
      // 3 months: $2318.85 * 3 = $6956.55 * 0.95 (vacancy) ≈ $6608.72
      expect(saleYearResult.annualRentalIncome).toBeCloseTo(6608, 0);
      
      // Should only have 3 months of maintenance expenses (3% of property value)
      // Property value in year 5: $300000 * 1.03^5 ≈ $347,782
      // Annual maintenance: 3% = $10,433, 3 months = $2,608
      expect(saleYearResult.totalRentalExpenses).toBeCloseTo(2608, 0);
    });
  });
});