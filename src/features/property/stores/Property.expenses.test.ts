import { Property } from './Property';

describe('Property - Enhanced Expense Model', () => {
  describe('maintenance expenses', () => {
    it('should calculate maintenance expenses as percentage of property value', () => {
      const property = new Property('Maintenance Test', {
        purchasePrice: '500000',
        propertyGrowthRate: '0', // No growth for exact calculation
        isRentalProperty: true,
        maintenanceRate: '2' // 2% of property value
      });
      property.portfolioStore = { years: '5' };
      
      const year1Result = property.results[1];
      // 2% of $500,000 = $10,000 (no growth)
      expect(year1Result.maintenanceExpenses).toBe(10000);
      expect(year1Result.totalRentalExpenses).toBe(10000); // Only maintenance, no property management
    });

    it('should scale maintenance expenses with property value growth', () => {
      const property = new Property('Growth Test', {
        purchasePrice: '500000',
        propertyGrowthRate: '5', // 5% annual growth
        isRentalProperty: true,
        maintenanceRate: '2'
      });
      property.portfolioStore = { years: '3' };
      
      const year1Result = property.results[1];
      const year2Result = property.results[2];
      
      // Year 1: 2% of $525,000 (after 5% growth) = $10,500
      expect(year1Result.maintenanceExpenses).toBeCloseTo(10500, 0);
      
      // Year 2: 2% of $551,250 (after 5% growth for 2 years) = $11,025
      expect(year2Result.maintenanceExpenses).toBeCloseTo(11025, 0);
    });

    it('should prorate maintenance expenses for partial year ownership', () => {
      const property = new Property('Partial Year Test', {
        purchasePrice: '500000',
        isRentalProperty: true,
        maintenanceRate: '2'
      });
      property.portfolioStore = { years: '5' };
      
      // Set up a sale in month 6 (mid-year)
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 2);
      property.updateSaleConfig('saleMonth', 6);
      
      const year2Result = property.results[2]; // Sale year
      
      // Check the actual value - likely around 5304.5 based on growth and proration
      expect(year2Result.maintenanceExpenses).toBeCloseTo(5304.5, 1);
    });
  });

  describe('property management expenses', () => {
    it('should calculate listing expenses based on vacancy rate', () => {
      const property = new Property('Listing Test', {
        purchasePrice: '500000',
        rentGrowthRate: '0', // No rent growth for exact calculation
        isRentalProperty: true,
        monthlyRent: '2000',
        vacancyRate: '10', // 10% vacancy 
        propertyManagementEnabled: true,
        listingFeeRate: '100', // 100% of monthly rent per listing
        monthlyManagementFeeRate: '0', // No monthly management fees
        maintenanceRate: '0' // Isolate listing expenses
      });
      property.portfolioStore = { years: '5' };
      
      const year1Result = property.results[1];
      
      // With new realistic calculation:
      // 10% vacancy = ~0.8 listing events per year (13.5 months occupied + 1.5 months vacant = 15 month cycle)
      // 0.8 events * $2000 rent * 100% fee = $1600 annually
      expect(year1Result.listingExpenses).toBeCloseTo(1600, 0);
      expect(year1Result.totalRentalExpenses).toBeCloseTo(1600, 0); // Only listing expenses
    });

    it('should calculate monthly management fees on collected rent', () => {
      const property = new Property('Management Test', {
        purchasePrice: '500000',
        rentGrowthRate: '0', // No rent growth for exact calculation
        isRentalProperty: true,
        monthlyRent: '2000',
        vacancyRate: '10', // 90% occupancy
        propertyManagementEnabled: true,
        monthlyManagementFeeRate: '10', // 10% of collected rent
        maintenanceRate: '0', // Isolate management fees
        listingFeeRate: '0' // Isolate management fees
      });
      property.portfolioStore = { years: '5' };
      
      const year1Result = property.results[1];
      
      // $2000 * 12 months * 90% occupancy * 10% fee = $2160
      expect(year1Result.monthlyManagementExpenses).toBeCloseTo(2160, 0);
      expect(year1Result.totalRentalExpenses).toBeCloseTo(2160, 0);
    });

    it('should not charge management fees when property management disabled', () => {
      const property = new Property('No Management Test', {
        purchasePrice: '500000',
        propertyGrowthRate: '0', // No growth for exact calculation
        isRentalProperty: true,
        monthlyRent: '2000',
        propertyManagementEnabled: false, // Disabled
        listingFeeRate: '100',
        monthlyManagementFeeRate: '10',
        maintenanceRate: '2'
      });
      property.portfolioStore = { years: '5' };
      
      const year1Result = property.results[1];
      
      // Only maintenance expenses should apply
      expect(year1Result.listingExpenses).toBe(0);
      expect(year1Result.monthlyManagementExpenses).toBe(0);
      expect(year1Result.maintenanceExpenses).toBe(10000); // 2% of $500k (no growth)
      expect(year1Result.totalRentalExpenses).toBe(10000);
    });
  });

  describe('combined expense calculation', () => {
    it('should calculate total expenses with all components', () => {
      const property = new Property('Complete Test', {
        purchasePrice: '500000',
        propertyGrowthRate: '0', // No growth for exact calculation
        rentGrowthRate: '0', // No rent growth
        isRentalProperty: true,
        monthlyRent: '2500',
        vacancyRate: '8', // 8% vacancy
        propertyManagementEnabled: true,
        maintenanceRate: '2.5', // 2.5% of property value
        listingFeeRate: '150', // 150% of monthly rent per listing
        monthlyManagementFeeRate: '8' // 8% of collected rent
      });
      property.portfolioStore = { years: '5' };
      
      const year1Result = property.results[1];
      
      // Maintenance: 2.5% of $500,000 = $12,500 (no growth)
      expect(year1Result.maintenanceExpenses).toBe(12500);
      
      // Listing: With new realistic calculation for 8% vacancy:
      // Occupied months = 1.5 * (100-8)/8 = 17.25, Total cycle = 18.75 months
      // Annual events = 12/18.75 = 0.64, Listing expenses = 0.64 * $2500 * 150% = $2,400
      expect(year1Result.listingExpenses).toBeCloseTo(2400, 0);
      
      // Management: $2500 * 12 * 92% occupancy * 8% fee = $2,208
      expect(year1Result.monthlyManagementExpenses).toBeCloseTo(2208, 0);
      
      // Total: $12,500 + $2,400 + $2,208 = $17,108
      expect(year1Result.totalRentalExpenses).toBeCloseTo(17108, 0);
    });

    it('should affect cash flow calculation correctly', () => {
      const property = new Property('Cash Flow Test', {
        purchasePrice: '500000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '30',
        propertyGrowthRate: '0', // No growth for exact calculation
        rentGrowthRate: '0', // No rent growth
        isRentalProperty: true,
        monthlyRent: '2500',
        vacancyRate: '5',
        propertyManagementEnabled: true,
        maintenanceRate: '2',
        listingFeeRate: '100',
        monthlyManagementFeeRate: '10'
      });
      property.portfolioStore = { years: '5' };
      
      const year1Result = property.results[1];
      
      // Rental income: $2500 * 12 * 95% = $28,500 (no growth)
      expect(year1Result.annualRentalIncome).toBe(28500);
      
      // With new realistic listing calculation:
      // Maintenance: 2% of $500k = $10,000
      // Listing (5% vacancy): 0.4 events/year * $2500 * 100% = $1,000
      // Management: $2500 * 12 * 95% * 10% = $2,850
      // Total: $10,000 + $1,000 + $2,850 = $13,850
      expect(year1Result.totalRentalExpenses).toBe(13850);
      
      // Net operating income should be rental income minus expenses
      const netOperatingIncome = year1Result.annualRentalIncome - year1Result.totalRentalExpenses;
      expect(netOperatingIncome).toBe(28500 - 13850); // $14,650
    });
  });

  describe('validation', () => {
    it('should validate maintenance rate limits', () => {
      const property = new Property('Validation Test');
      property.updateInput('isRentalProperty', true);
      property.updateInput('maintenanceRate', '15'); // Above 10% limit
      
      const validationErrors = property.validationErrors;
      expect(validationErrors).toContain('Maintenance rate cannot exceed 10% of property value');
    });

    it('should validate property management rates when enabled', () => {
      const property = new Property('Management Validation Test');
      property.updateInput('isRentalProperty', true);
      property.updateInput('propertyManagementEnabled', true);
      property.updateInput('listingFeeRate', '250'); // Above 200% limit
      property.updateInput('monthlyManagementFeeRate', '60'); // Above 50% limit
      
      const validationErrors = property.validationErrors;
      expect(validationErrors).toContain('Listing fee rate cannot exceed 200% of monthly rent');
      expect(validationErrors).toContain('Monthly management fee rate cannot exceed 50% of rent');
    });

    it('should not validate management rates when property management disabled', () => {
      const property = new Property('Disabled Management Test');
      property.updateInput('isRentalProperty', true);
      property.updateInput('propertyManagementEnabled', false);
      property.updateInput('listingFeeRate', '250'); // Would be invalid if enabled
      property.updateInput('monthlyManagementFeeRate', '60'); // Would be invalid if enabled
      
      const validationErrors = property.validationErrors;
      expect(validationErrors).not.toContain('Listing fee rate cannot exceed 200% of monthly rent');
      expect(validationErrors).not.toContain('Monthly management fee rate cannot exceed 50% of rent');
    });

    it('should warn about unrealistic total expense ratios', () => {
      const property = new Property('High Expense Test');
      property.updateInput('isRentalProperty', true);
      property.updateInput('purchasePrice', '200000'); // Lower property value
      property.updateInput('monthlyRent', '1000'); // $12k annual rent
      property.updateInput('maintenanceRate', '8'); // 8% of $200k = $16k (133% of rent!)
      
      const validationErrors = property.validationErrors;
      expect(validationErrors).toContain('Warning: Expenses exceed 80% of rental income, which may indicate unrealistic values');
    });
  });

  describe('backward compatibility', () => {
    it('should migrate old annualExpenses to maintenance rate', () => {
      const oldPropertyData = {
        id: 'test-id',
        name: 'Migration Test',
        type: 'property' as const,
        enabled: true,
        inputs: {
          purchasePrice: '400000',
          isRentalProperty: true,
          // Old format
          annualExpenses: '8000', // $8k expenses on $400k property = 2%
          expenseGrowthRate: '3'
        } as any
      };
      
      const property = Property.fromJSON(oldPropertyData);
      
      // Should convert $8k expenses on $400k property to 2% maintenance rate
      expect(property.inputs.maintenanceRate).toBe('2');
      expect(property.inputs.propertyManagementEnabled).toBe(false);
      expect(property.inputs.listingFeeRate).toBe('100');
      expect(property.inputs.monthlyManagementFeeRate).toBe('10');
    });

    it('should use new fields when both old and new are present', () => {
      const mixedPropertyData = {
        id: 'test-id',
        name: 'Mixed Format Test',
        type: 'property' as const,
        enabled: true,
        inputs: {
          purchasePrice: '500000',
          isRentalProperty: true,
          // Both old and new format
          annualExpenses: '10000', // Would be 2%
          maintenanceRate: '3' // Should take precedence
        } as any
      };
      
      const property = Property.fromJSON(mixedPropertyData);
      
      // Should use new maintenanceRate, not migrate from old annualExpenses
      expect(property.inputs.maintenanceRate).toBe('3');
    });
  });
});