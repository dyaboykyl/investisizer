import { Property } from '@/features/property/stores/Property';

describe('Property - Sales Validation', () => {
  describe('input validation', () => {
    it('should validate sale year within projection range', () => {
      const property = new Property('Validation Test', { years: '10' });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 15); // Invalid: beyond projection years
      
      const errors = property.validationErrors;
      expect(errors).toContain('Sale year must be between 1 and projection years');
    });

    it('should validate expected sale price when using custom pricing', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 0); // Invalid: zero price
      
      const errors = property.validationErrors;
      expect(errors).toContain('Expected sale price must be greater than $0');
    });

    it('should validate selling costs percentage range', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('sellingCostsPercentage', 25); // Invalid: too high
      
      const errors = property.validationErrors;
      expect(errors).toContain('Selling costs must be between 0% and 20%');
    });

    it('should validate reinvestment target selection', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', ''); // Invalid: no target
      
      const errors = property.validationErrors;
      expect(errors).toContain('Target investment must be selected when reinvesting proceeds');
    });
  });

  describe('warning conditions', () => {
    it('should warn about underwater property sales', () => {
      const property = new Property('Underwater Warning', {
        purchasePrice: '500000',
        downPaymentPercentage: '5'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 400000); // Loss scenario
      property.updateSaleConfig('reinvestProceeds', false); // Disable to avoid other warnings
      
      const errors = property.validationErrors;
      expect(errors).toContain('Property sale will result in a loss after mortgage payoff and selling costs');
    });

    it('should warn about high selling costs', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('sellingCostsPercentage', 12); // High costs
      
      const errors = property.validationErrors;
      expect(errors).toContain('Selling costs exceed typical range of 6-8%');
    });

    it('should warn about early sales', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 2); // Early sale
      
      const errors = property.validationErrors;
      expect(errors).toContain('Selling shortly after purchase may incur additional costs and limit appreciation');
    });

    it('should allow selling in year 1 even with years ago bought', () => {
      const property = new Property('Old Property Test', {
        yearsBought: '5', // Property was bought 5 years ago
        years: '8'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 1); // Sell in year 1 of projection (6 years after purchase)
      property.updateSaleConfig('useProjectedValue', true);
      property.updateSaleConfig('sellingCostsPercentage', 7);
      
      // Should not have validation errors related to years ago bought
      const errors = property.validationErrors;
      const yearsBoughtErrors = errors.filter(error => error.includes('years already owned'));
      expect(yearsBoughtErrors).toHaveLength(0);
    });
  });

  describe('additional validation cases', () => {
    it('should validate sale month range', () => {
      const property = new Property();
      property.setSaleEnabled(true);
      
      // Invalid: month too low
      property.updateSaleConfig('saleMonth', 0);
      expect(property.validationErrors).toContain('Sale month must be between 1 and 12');
      
      // Invalid: month too high
      property.updateSaleConfig('saleMonth', 13);
      expect(property.validationErrors).toContain('Sale month must be between 1 and 12');
      
      // Valid month
      property.updateSaleConfig('saleMonth', 6);
      const monthErrors = property.validationErrors.filter(e => e.includes('Sale month must be'));
      expect(monthErrors).toHaveLength(0);
    });

    it('should validate expected sale price upper limit', () => {
      const property = new Property();
      property.setSaleEnabled(true);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 15000000);
      
      expect(property.validationErrors).toContain('Expected sale price cannot exceed $10,000,000');
    });

    it('should validate negative years bought', () => {
      const property = new Property('Test Property', {
        yearsBought: '-1'
      });
      
      expect(property.validationErrors).toContain('Years bought cannot be negative');
    });

    it('should validate years bought does not exceed projection years', () => {
      const property = new Property('Test Property', {
        yearsBought: '15',
        years: '10'
      });
      
      expect(property.validationErrors).toContain('Years bought cannot exceed projection years');
    });

    it('should validate current estimated value for current value growth model', () => {
      const property = new Property('Test Property', {
        propertyGrowthModel: 'current_value',
        currentEstimatedValue: '0'
      });
      
      expect(property.validationErrors).toContain('Current estimated value must be positive when using current value growth model');
    });
  });

  describe('rental property validation', () => {
    it('should validate monthly rent boundaries', () => {
      const property = new Property('Rental Property', {
        isRentalProperty: true,
        monthlyRent: '0'
      });
      
      expect(property.validationErrors).toContain('Monthly rent must be greater than $0');
      
      property.updateInput('monthlyRent', '60000');
      expect(property.validationErrors).toContain('Monthly rent cannot exceed $50,000');
    });

    it('should validate rent growth rate boundaries', () => {
      const property = new Property('Rental Property', {
        isRentalProperty: true,
        rentGrowthRate: '-15'
      });
      
      expect(property.validationErrors).toContain('Rent growth rate cannot be less than -10%');
      
      property.updateInput('rentGrowthRate', '25');
      expect(property.validationErrors).toContain('Rent growth rate cannot exceed 20%');
    });

    it('should validate vacancy rate boundaries', () => {
      const property = new Property('Rental Property', {
        isRentalProperty: true,
        vacancyRate: '-5'
      });
      
      expect(property.validationErrors).toContain('Vacancy rate cannot be negative');
      
      property.updateInput('vacancyRate', '60');
      expect(property.validationErrors).toContain('Vacancy rate cannot exceed 50%');
    });

    it('should validate annual expenses boundaries', () => {
      const property = new Property('Rental Property', {
        isRentalProperty: true,
        annualExpenses: '-1000'
      });
      
      expect(property.validationErrors).toContain('Annual expenses cannot be negative');
      
      property.updateInput('annualExpenses', '150000');
      expect(property.validationErrors).toContain('Annual expenses cannot exceed $100,000');
    });

    it('should validate expense growth rate boundaries', () => {
      const property = new Property('Rental Property', {
        isRentalProperty: true,
        expenseGrowthRate: '-5'
      });
      
      expect(property.validationErrors).toContain('Expense growth rate cannot be negative');
      
      property.updateInput('expenseGrowthRate', '20');
      expect(property.validationErrors).toContain('Expense growth rate cannot exceed 15%');
    });

    it('should warn about unrealistic expense to income ratio', () => {
      const property = new Property('Rental Property', {
        isRentalProperty: true,
        monthlyRent: '2000',
        annualExpenses: '50000' // More than 2x annual rent
      });
      
      expect(property.validationErrors).toContain('Annual expenses seem unreasonably high compared to rental income');
    });

    it('should warn about high expense to income ratio', () => {
      const property = new Property('Rental Property', {
        isRentalProperty: true,
        monthlyRent: '2000',
        annualExpenses: '20000' // 83% of annual rent
      });
      
      expect(property.validationErrors).toContain('Warning: Expenses exceed 80% of rental income, which may indicate unrealistic values');
    });
  });

  describe('no warnings for valid configurations', () => {
    it('should have no validation errors for properly configured sale', () => {
      const property = new Property('Valid Sale', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        linkedInvestmentId: 'test-investment'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 7);
      property.updateSaleConfig('useProjectedValue', true);
      property.updateSaleConfig('sellingCostsPercentage', 7);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', 'test-investment');
      
      const saleErrors = property.validationErrors.filter(error => 
        error.includes('sale') || error.includes('Sale')
      );
      expect(saleErrors).toHaveLength(0);
    });
  });
});