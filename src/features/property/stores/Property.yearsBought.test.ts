import { Property } from '@/features/property/stores/Property';

describe('Property - Years Ago Bought Logic', () => {
  describe('sale year validation with years ago bought', () => {
    it('should allow selling in year 1 even if property was bought 5 years ago', () => {
      const property = new Property('Old Property', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        interestRate: '6',
        yearsBought: '5', // Property was bought 5 years ago
        years: '10'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 1); // Sell in year 1 of projection
      
      // This should be valid - selling 6 years after purchase (5 years ago + 1 year into projection)
      const errors = property.validationErrors;
      const saleYearErrors = errors.filter(error => error.includes('Sale year') && error.includes('years already owned'));
      expect(saleYearErrors).toHaveLength(0);
    });

    it('should prevent selling in year 0 or negative years', () => {
      const property = new Property('Test Property', {
        purchasePrice: '400000',
        yearsBought: '2',
        years: '5'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 0); // Invalid: year 0
      
      const errors = property.validationErrors;
      expect(errors).toContain('Sale year must be specified and greater than 0');
    });

    it('should prevent selling beyond projection years', () => {
      const property = new Property('Test Property', {
        purchasePrice: '400000',
        yearsBought: '2',
        years: '5'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 6); // Invalid: beyond 5-year projection
      
      const errors = property.validationErrors;
      expect(errors).toContain('Sale year must be between 1 and projection years');
    });
  });

  describe('property value calculations with years ago bought', () => {
    it('should calculate correct property value growth from purchase date', () => {
      const property = new Property('Growth Test', {
        purchasePrice: '300000',
        propertyGrowthRate: '4', // 4% annual growth
        yearsBought: '3', // Bought 3 years ago
        propertyGrowthModel: 'purchase_price'
      });

      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 2); // Sell in year 2 of projection

      // Total growth period: 3 years already owned + 2 years into projection = 5 years
      // Expected value: $300,000 * (1.04)^5 = $300,000 * 1.2167 = $365,002
      const expectedValue = 300000 * Math.pow(1.04, 5);
      expect(property.projectedSalePrice).toBeCloseTo(expectedValue, 0);
    });

    it('should calculate current value growth correctly', () => {
      const property = new Property('Current Value Test', {
        propertyGrowthRate: '3', // 3% annual growth  
        propertyGrowthModel: 'current_value',
        currentEstimatedValue: '450000', // Current estimated value
        yearsBought: '2' // Irrelevant for current_value model
      });

      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3); // Sell in year 3 of projection

      // Growth from current value: $450,000 * (1.03)^3 = $450,000 * 1.0927 = $491,723
      const expectedValue = 450000 * Math.pow(1.03, 3);
      expect(property.projectedSalePrice).toBeCloseTo(expectedValue, 0);
    });
  });

  describe('mortgage balance calculations with years ago bought', () => {
    it('should account for years already owned in mortgage paydown', () => {
      const property = new Property('Mortgage Test', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '30',
        yearsBought: '5', // 5 years of payments already made
        years: '10'
      });

      // Check initial mortgage balance (should be lower due to 5 years of payments)
      const year0Result = property.results[0];
      const newPropertyResult = new Property('New Property', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '30',
        yearsBought: '0', // Just purchased
        years: '10'
      }).results[0];

      // Property bought 5 years ago should have lower mortgage balance
      expect(year0Result.mortgageBalance).toBeLessThan(newPropertyResult.mortgageBalance);
    });

    it('should calculate correct mortgage balance at sale year', () => {
      const property = new Property('Sale Balance Test', {
        purchasePrice: '500000',
        downPaymentPercentage: '20',
        interestRate: '5',
        loanTerm: '30',
        yearsBought: '3',
        years: '8'
      });

      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4); // Sell in year 4

      // By sale year, property will have been owned for 3 + 4 = 7 years total
      // Mortgage should be significantly paid down
      const saleYearResult = property.results[4];
      expect(saleYearResult.preSaleMortgageBalance).toBeLessThan(400000); // Started at $400k loan
      expect(saleYearResult.preSaleMortgageBalance).toBeGreaterThan(0);
    });
  });

  describe('cash flow calculations with years ago bought', () => {
    it('should handle negative cash flows correctly when property was bought years ago', () => {
      const property = new Property('Cash Flow Test', {
        purchasePrice: '300000',
        downPaymentPercentage: '25',
        interestRate: '6',
        loanTerm: '30',
        yearsBought: '4', // Bought 4 years ago
        years: '6',
        linkedInvestmentId: 'test-investment'
      });

      // All projection years should have negative cash flow (mortgage payments)
      for (let year = 1; year <= 6; year++) {
        const result = property.results[year];
        expect(result.annualCashFlow).toBeLessThan(0); // Money flowing TO investment
      }
    });

    it('should include sale proceeds in cash flow when configured correctly', () => {
      const property = new Property('Sale Cash Flow Test', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '30',
        yearsBought: '2', // Bought 2 years ago
        years: '8',
        linkedInvestmentId: 'test-investment'
      });

      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5); // Sell in year 5 (7 years after purchase)
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 500000);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', 'test-investment'); // Same as linked

      // Before sale: negative cash flows
      for (let year = 1; year <= 4; year++) {
        const result = property.results[year];
        expect(result.annualCashFlow).toBeLessThan(0);
      }

      // Sale year: should have positive cash flow (includes sale proceeds)
      const saleYearResult = property.results[5];
      expect(saleYearResult.isSaleYear).toBe(true);
      expect(saleYearResult.annualCashFlow).toBeGreaterThan(0);

      // After sale: zero cash flows
      for (let year = 6; year <= 8; year++) {
        const result = property.results[year];
        expect(result.annualCashFlow).toBe(0);
        expect(result.isPostSale).toBe(true);
      }
    });
  });

  describe('edge cases with years ago bought', () => {
    it('should handle property that was bought many years ago', () => {
      const property = new Property('Very Old Property', {
        purchasePrice: '200000',
        downPaymentPercentage: '20',
        interestRate: '7',
        loanTerm: '30',
        yearsBought: '15', // Bought 15 years ago
        years: '5'
      });

      // Property should still be valid and calculable
      expect(property.hasResults).toBe(true);
      expect(property.results.length).toBe(6); // Year 0 + 5 years

      // Mortgage should be significantly paid down after 15 years
      const year0Result = property.results[0];
      expect(year0Result.mortgageBalance).toBeLessThan(160000); // Started at $160k loan
    });

    it('should handle property that might be fully paid off', () => {
      const property = new Property('Paid Off Property', {
        purchasePrice: '200000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '15', // Short term loan
        yearsBought: '16', // Bought 16 years ago (should be paid off)
        years: '5'
      });

      // Mortgage should be paid off
      const year0Result = property.results[0];
      expect(year0Result.mortgageBalance).toBe(0);
      
      // Monthly payments should be zero (except for user-configured payments)
      expect(year0Result.principalInterestPayment).toBe(0);
    });
  });
});