import { Property } from '@/features/property/stores/Property';

describe('Property - Sales Configuration & Calculations', () => {
  describe('sale configuration defaults', () => {
    it('should have sale disabled by default', () => {
      const property = new Property();
      expect(property.inputs.saleConfig.isPlannedForSale).toBe(false);
      expect(property.inputs.saleConfig.saleYear).toBeNull();
      expect(property.inputs.saleConfig.useProjectedValue).toBe(true);
      expect(property.inputs.saleConfig.sellingCostsPercentage).toBe(7);
      expect(property.inputs.saleConfig.reinvestProceeds).toBe(true);
      expect(property.inputs.saleConfig.targetInvestmentId).toBeNull();
      expect(property.inputs.saleConfig.saleMonth).toBe(6);
    });

    it('should maintain backward compatibility with existing properties', () => {
      const legacyData = {
        id: 'test-id',
        name: 'Legacy Property',
        type: 'property' as const,
        enabled: true,
        inputs: {
          purchasePrice: '500000',
          downPaymentPercentage: '20',
          interestRate: '7',
          loanTerm: '30',
          inflationRate: '2.5',
          yearsBought: '0',
          propertyGrowthRate: '3',
          monthlyPayment: '',
          linkedInvestmentId: '',
          propertyGrowthModel: 'purchase_price' as const,
          currentEstimatedValue: '',
          isRentalProperty: false,
          monthlyRent: '2000',
          rentGrowthRate: '3',
          vacancyRate: '5',
          maintenanceRate: '1.5',
          propertyManagementEnabled: false
          // No saleConfig property
        },
        showBalance: true,
        showContributions: true,
        showNetGain: true
      };

      const property = Property.fromJSON(legacyData);
      expect(property.inputs.saleConfig.isPlannedForSale).toBe(false);
      expect(property.inputs.saleConfig.saleYear).toBeNull();
    });
  });

  describe('sale configuration actions', () => {
    it('should enable sale planning and set default sale year', () => {
      const property = new Property('Test Property', {});
      property.portfolioStore = { years: '10' };
      property.setSaleEnabled(true);
      
      expect(property.inputs.saleConfig.isPlannedForSale).toBe(true);
      expect(property.inputs.saleConfig.saleYear).toBe(5); // Mid-point of 10 years
    });

    it('should update sale configuration properties', () => {
      const property = new Property();
      
      property.updateSaleConfig('saleYear', 7);
      property.updateSaleConfig('expectedSalePrice', 600000);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('sellingCostsPercentage', 8.5);
      
      expect(property.inputs.saleConfig.saleYear).toBe(7);
      expect(property.inputs.saleConfig.expectedSalePrice).toBe(600000);
      expect(property.inputs.saleConfig.useProjectedValue).toBe(false);
      expect(property.inputs.saleConfig.sellingCostsPercentage).toBe(8.5);
    });

    it('should auto-select linked investment as target when enabling reinvestment', () => {
      const property = new Property('Test Property', {
        linkedInvestmentId: 'linked-investment-id'
      });
      
      property.updateSaleConfig('reinvestProceeds', true);
      expect(property.inputs.saleConfig.targetInvestmentId).toBe('linked-investment-id');
    });
  });

  describe('sale configuration computed properties', () => {
    it('should calculate projected sale price using purchase price model', () => {
      const property = new Property('Test Property', {
        purchasePrice: '400000',
        propertyGrowthRate: '3',
        yearsBought: '2',
        propertyGrowthModel: 'purchase_price'
      });
      
      property.updateSaleConfig('saleYear', 5);
      
      // Expected: $400,000 × (1.03)^(2+5) = $400,000 × (1.03)^7 ≈ $491,808
      const expectedPrice = 400000 * Math.pow(1.03, 7);
      expect(property.projectedSalePrice).toBeCloseTo(expectedPrice, 0);
    });

    it('should calculate projected sale price using current value model', () => {
      const property = new Property('Test Property', {
        propertyGrowthRate: '3',
        propertyGrowthModel: 'current_value',
        currentEstimatedValue: '450000'
      });
      
      property.updateSaleConfig('saleYear', 3);
      
      // Expected: $450,000 × (1.03)^3 ≈ $491,706
      const expectedPrice = 450000 * Math.pow(1.03, 3);
      expect(property.projectedSalePrice).toBeCloseTo(expectedPrice, 0);
    });

    it('should use effective sale price based on configuration', () => {
      const property = new Property('Test Property', {
        purchasePrice: '400000',
        propertyGrowthRate: '3'
      });
      
      property.updateSaleConfig('saleYear', 5);
      
      // Test projected value
      property.updateSaleConfig('useProjectedValue', true);
      expect(property.effectiveSalePrice).toBe(property.projectedSalePrice);
      
      // Test custom value
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 550000);
      expect(property.effectiveSalePrice).toBe(550000);
    });

    it('should calculate selling costs correctly', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 600000);
      property.updateSaleConfig('sellingCostsPercentage', 7);
      
      expect(property.sellingCosts).toBeCloseTo(42000, 2); // 600000 × 0.07
    });
  });

  describe('net sale proceeds calculation', () => {
    it('should calculate positive net proceeds correctly', () => {
      const property = new Property('Profitable Sale', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '30'
      });
      property.portfolioStore = { years: '10' };
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 500000);
      property.updateSaleConfig('sellingCostsPercentage', 7);
      
      // Calculate expected mortgage balance at year 5
      const year5Result = property.results[5];
      const expectedNetProceeds = 500000 - 35000 - (year5Result.preSaleMortgageBalance || year5Result.mortgageBalance); // Sale price - costs - mortgage
      
      expect(property.netSaleProceeds).toBeCloseTo(expectedNetProceeds, -4); // Allow $10000 difference
      expect(property.netSaleProceeds).toBeGreaterThan(0);
    });

    it('should handle underwater property sales with negative proceeds', () => {
      const property = new Property('Underwater Property', {
        purchasePrice: '500000',
        downPaymentPercentage: '5',  // Low down payment
        interestRate: '8',           // High interest rate
        loanTerm: '30'
      });
      property.portfolioStore = { years: '5' };
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 2);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 400000); // Underwater
      property.updateSaleConfig('sellingCostsPercentage', 7);
      
      // Mortgage balance should be high due to low down payment and high interest
      const year2Result = property.results[2];
      const expectedNetProceeds = 400000 - 28000 - (year2Result.preSaleMortgageBalance || year2Result.mortgageBalance); // Will be negative
      
      expect(property.netSaleProceeds).toBeCloseTo(expectedNetProceeds, -4); // Allow $10000 difference
      expect(property.netSaleProceeds).toBeLessThan(0);
    });

    it('should return zero for properties not planned for sale', () => {
      const property = new Property('No Sale Property');
      
      expect(property.netSaleProceeds).toBe(0);
      expect(property.sellingCosts).toBe(0);
      expect(property.effectiveSalePrice).toBe(0);
    });
  });

  describe('partial year calculations in sale year', () => {
    it('should prorate rental income for mid-year sale', () => {
      const property = new Property('Mid-Year Sale', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '30',
        isRentalProperty: true,
        monthlyRent: '2400', // $28,800 annually
        rentGrowthRate: '3',
        vacancyRate: '5',    // 95% occupancy
        maintenanceRate: '2',
        propertyManagementEnabled: false
      });
      property.portfolioStore = { years: '5' };
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('saleMonth', 6); // Mid-year sale
      
      const saleYearResult = property.results[3];
      
      // Calculate expected partial year rental income
      const year3MonthlyRent = 2400 * Math.pow(1.03, 3);
      const partialRentalIncome = (year3MonthlyRent * 12) * 0.95 * 0.5; // 6 months, 95% occupancy
      
      expect(saleYearResult.annualRentalIncome).toBeCloseTo(partialRentalIncome, 0);
    });

    it('should prorate expenses for partial year sale', () => {
      const property = new Property('Partial Year Sale', {
        purchasePrice: '400000',
        isRentalProperty: true,
        monthlyRent: '2000',
        maintenanceRate: '3',
        propertyManagementEnabled: false
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4);
      property.updateSaleConfig('saleMonth', 9); // 9 months into year
      
      const saleYearResult = property.results[4];
      
      // Calculate expected partial year expenses
      const year4Expenses = 12000 * Math.pow(1.03, 4);
      const partialExpenses = year4Expenses * (9 / 12); // 9 months
      
      expect(saleYearResult.totalRentalExpenses).toBeCloseTo(partialExpenses, 0);
    });

    it('should combine partial operating cash flow with sale proceeds', () => {
      const property = new Property('Combined Cash Flow', {
        purchasePrice: '300000',
        downPaymentPercentage: '25',
        interestRate: '5',
        loanTerm: '30',
        isRentalProperty: true,
        monthlyRent: '2000',
        vacancyRate: '5',
        maintenanceRate: '2',
        linkedInvestmentId: 'test-linked-investment'
      });
      property.portfolioStore = { years: '6' };
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4);
      property.updateSaleConfig('saleMonth', 6);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 350000);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', 'test-linked-investment'); // Simulate linked investment
      
      const saleYearResult = property.results[4];
      
      // Verify total cash flow includes both partial operating and sale proceeds
      expect(saleYearResult.annualCashFlow).toBeGreaterThan(saleYearResult.saleProceeds || 0);
      expect(saleYearResult.isSaleYear).toBe(true);
    });
  });

  describe('post-sale year calculations', () => {
    it('should zero out all property metrics after sale', () => {
      const property = new Property('Post Sale Property', {
        purchasePrice: '400000'
      });
      property.portfolioStore = { years: '8' };
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      
      // Check years after sale
      for (let year = 6; year <= 8; year++) {
        const result = property.results[year];
        expect(result.isPostSale).toBe(true);
        expect(result.balance).toBe(0);
        expect(result.mortgageBalance).toBe(0);
        expect(result.annualCashFlow).toBe(0);
        expect(result.monthlyPayment).toBe(0);
        expect(result.principalInterestPayment).toBe(0);
      }
    });

    it('should continue normal calculations up to sale year', () => {
      const property = new Property('Pre Sale Property', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        propertyGrowthRate: '3'
      });
      property.portfolioStore = { years: '8' };
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 6);
      
      // Check years before sale
      for (let year = 1; year < 6; year++) {
        const result = property.results[year];
        expect(result.isSaleYear).toBe(false);
        expect(result.isPostSale).toBe(false);
        expect(result.balance).toBeGreaterThan(0);
        expect(result.mortgageBalance).toBeGreaterThan(0);
      }
      
      // Check sale year
      const saleYearResult = property.results[6];
      expect(saleYearResult.isSaleYear).toBe(true);
      expect(saleYearResult.saleProceeds).toBeGreaterThan(0);
    });

    it('should have zero annual cash flow for linked investment after sale', () => {
      const property = new Property('Linked Property', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '30',
        linkedInvestmentId: 'test-investment-id'
      });
      property.portfolioStore = { years: '8' };
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 500000);
      property.updateSaleConfig('reinvestProceeds', true); // Reinvest into linked investment
      property.updateSaleConfig('targetInvestmentId', 'test-investment-id'); // Same as linked investment
      
      // Before sale: should have negative cash flow (mortgage payments)
      for (let year = 1; year <= 4; year++) {
        const result = property.results[year];
        expect(result.annualCashFlow).toBeLessThan(0); // Negative = money flowing TO investment
        expect(result.isPostSale).toBe(false);
      }
      
      // Sale year: should have large positive cash flow (sale proceeds)
      const saleYearResult = property.results[5];
      expect(saleYearResult.isSaleYear).toBe(true);
      expect(saleYearResult.annualCashFlow).toBeGreaterThan(0); // Includes sale proceeds
      expect(saleYearResult.isPostSale).toBe(false);
      
      // After sale: should have zero cash flow (no more property payments or proceeds)
      for (let year = 6; year <= 8; year++) {
        const result = property.results[year];
        expect(result.annualCashFlow).toBe(0); // No cash flow to investment
        expect(result.isPostSale).toBe(true);
        expect(result.balance).toBe(0); // Property has no value
        expect(result.mortgageBalance).toBe(0); // No mortgage
        expect(result.monthlyPayment).toBe(0); // No payments
      }
    });
  });
});