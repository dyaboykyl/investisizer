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