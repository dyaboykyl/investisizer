import { Property, type PropertySaleConfig } from '@/features/property/stores/Property';

// Helper function to create default sale config with tax profile fields
const createSaleConfig = (overrides: Partial<PropertySaleConfig> = {}): PropertySaleConfig => ({
  isPlannedForSale: false,
  saleYear: null,
  expectedSalePrice: null,
  useProjectedValue: true,
  sellingCostsPercentage: 7,
  reinvestProceeds: true,
  targetInvestmentId: null,
  saleMonth: 6,
  capitalImprovements: '',
  originalBuyingCosts: '',
  filingStatus: 'single',
  annualIncome: '75000',
  state: 'CA',
  enableStateTax: false,
  otherCapitalGains: '',
  carryoverLosses: '',
  // Section 121 Primary Residence Exclusion fields
  isPrimaryResidence: false,
  yearsOwned: '0',
  yearsLived: '0',
  hasUsedExclusionInLastTwoYears: false,
  enableSection121: false,
  // Depreciation Recapture fields
  enableDepreciationRecapture: false,
  totalDepreciationTaken: '0',
  landValuePercentage: '20',
  ...overrides
});

describe('Property - Cost Basis Tracking', () => {
  describe('cost basis fields initialization', () => {
    it('should initialize cost basis fields with empty strings', () => {
      const property = new Property();
      
      expect(property.inputs.saleConfig.capitalImprovements).toBe('');
      expect(property.inputs.saleConfig.originalBuyingCosts).toBe('');
    });

    it('should accept custom cost basis values during construction', () => {
      const property = new Property('Test Property', {
        saleConfig: createSaleConfig({
          isPlannedForSale: true,
          saleYear: 5,
          capitalImprovements: '25000',
          originalBuyingCosts: '15000'
        })
      });

      expect(property.inputs.saleConfig.capitalImprovements).toBe('25000');
      expect(property.inputs.saleConfig.originalBuyingCosts).toBe('15000');
    });
  });

  describe('adjustedCostBasis computed property', () => {
    it('should calculate adjusted cost basis with only purchase price when no improvements or costs', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000'
      });

      expect(property.adjustedCostBasis).toBe(500000);
    });

    it('should include capital improvements in adjusted cost basis', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000',
        saleConfig: createSaleConfig({
          capitalImprovements: '25000'
        })
      });

      expect(property.adjustedCostBasis).toBe(525000); // 500k + 25k improvements
    });

    it('should include original buying costs in adjusted cost basis', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000',
        saleConfig: createSaleConfig({
          originalBuyingCosts: '15000'
        })
      });

      expect(property.adjustedCostBasis).toBe(515000); // 500k + 15k buying costs
    });

    it('should include both improvements and buying costs in adjusted cost basis', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000',
        saleConfig: createSaleConfig({
          capitalImprovements: '25000',
          originalBuyingCosts: '15000'
        })
      });

      expect(property.adjustedCostBasis).toBe(540000); // 500k + 25k + 15k
    });

    it('should handle empty string values as zero', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000',
        saleConfig: createSaleConfig({})
      });

      expect(property.adjustedCostBasis).toBe(500000);
    });

    it('should handle invalid string values as zero', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000',
        saleConfig: createSaleConfig({
          capitalImprovements: 'invalid',
          originalBuyingCosts: 'abc'
        })
      });

      expect(property.adjustedCostBasis).toBe(500000);
    });

    it('should handle decimal values correctly', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000',
        saleConfig: createSaleConfig({
          capitalImprovements: '25000.50',
          originalBuyingCosts: '15000.75'
        })
      });

      expect(property.adjustedCostBasis).toBe(540001.25); // 500k + 25000.50 + 15000.75
    });
  });

  describe('capitalGain computed property', () => {
    it('should return 0 when property is not planned for sale', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000',
        saleConfig: createSaleConfig({
          capitalImprovements: '25000',
          originalBuyingCosts: '15000'
        })
      });

      expect(property.capitalGain).toBe(0);
    });

    it('should calculate capital gain correctly when property is sold for profit', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000',
        downPaymentPercentage: '20',
        interestRate: '7',
        loanTerm: '30',
        saleConfig: createSaleConfig({
          isPlannedForSale: true,
          saleYear: 5,
          expectedSalePrice: 700000,
          useProjectedValue: false,
          capitalImprovements: '25000',
          originalBuyingCosts: '15000'
        })
      });
      property.portfolioStore = { years: '10' };

      // Sale price: 700k
      // Selling costs: 700k * 7% = 49k
      // Remaining mortgage after 5 years: ~320k (approximate)
      // Net proceeds: 700k - 49k - 320k = ~331k
      // Adjusted cost basis: 500k + 25k + 15k = 540k
      // Since net proceeds < cost basis, capital gain should be 0
      const adjustedBasis = property.adjustedCostBasis;
      
      // Capital gain should be calculated excluding mortgage payoff
      const salePrice = property.effectiveSalePrice;
      const sellingCosts = property.sellingCosts;
      const expectedCapitalGain = Math.max(0, (salePrice - sellingCosts) - adjustedBasis);
      expect(property.capitalGain).toBe(expectedCapitalGain);
    });

    it('should handle scenario with actual capital gain', () => {
      const property = new Property('Test Property', {
        purchasePrice: '300000',
        downPaymentPercentage: '50', // Higher down payment for lower mortgage
        interestRate: '7',
        loanTerm: '30',
        saleConfig: createSaleConfig({
          isPlannedForSale: true,
          saleYear: 10,
          expectedSalePrice: 600000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          capitalImprovements: '20000',
          originalBuyingCosts: '10000'
        })
      });
      property.portfolioStore = { years: '15' };

      // Sale price: 600k
      // Selling costs: 600k * 6% = 36k
      // Remaining mortgage after 10 years with 50% down: much lower
      // Net proceeds should be higher
      // Adjusted cost basis: 300k + 20k + 10k = 330k
      const capitalGain = property.capitalGain;
      
      expect(capitalGain).toBeGreaterThanOrEqual(0);
      
      // Verify the calculation logic
      const adjustedBasis = property.adjustedCostBasis;
      // Capital gain should be calculated excluding mortgage payoff  
      const salePrice = property.effectiveSalePrice;
      const sellingCosts = property.sellingCosts;
      const expectedCapitalGain = Math.max(0, (salePrice - sellingCosts) - adjustedBasis);
      expect(capitalGain).toBe(expectedCapitalGain);
      expect(adjustedBasis).toBe(330000);
    });

    it('should never return negative capital gains', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000',
        downPaymentPercentage: '20',
        interestRate: '7',
        loanTerm: '30',
        saleConfig: createSaleConfig({
          isPlannedForSale: true,
          saleYear: 2,
          expectedSalePrice: 400000, // Selling at a loss
          useProjectedValue: false,
          capitalImprovements: '25000',
          originalBuyingCosts: '15000'
        })
      });
      property.portfolioStore = { years: '10' };

      // This should result in a loss, but capital gain should be 0 (not negative)
      expect(property.capitalGain).toBe(0);
    });
  });

  describe('parsedInputs integration', () => {
    it('should include cost basis fields in parsedInputs', () => {
      const property = new Property('Test Property', {
        saleConfig: createSaleConfig({
          capitalImprovements: '25000',
          originalBuyingCosts: '15000'
        })
      });

      const parsed = property.parsedInputs;
      expect(parsed.capitalImprovements).toBe(25000);
      expect(parsed.originalBuyingCosts).toBe(15000);
    });

    it('should handle empty cost basis values in parsedInputs', () => {
      const property = new Property('Test Property', {
        saleConfig: createSaleConfig({
          capitalImprovements: '',
          originalBuyingCosts: ''
        })
      });

      const parsed = property.parsedInputs;
      expect(parsed.capitalImprovements).toBe(0);
      expect(parsed.originalBuyingCosts).toBe(0);
    });
  });

  describe('backward compatibility', () => {
    it('should handle legacy properties without cost basis fields', () => {
      const legacyData = {
        id: 'test-id',
        name: 'Legacy Property',
        type: 'property' as const,
        enabled: true,
        inputs: {
          purchasePrice: '400000',
          downPaymentPercentage: '20',
          interestRate: '6.5',
          loanTerm: '30',
          saleConfig: createSaleConfig({
            isPlannedForSale: true,
            saleYear: 5,
            expectedSalePrice: null,
            useProjectedValue: true,
            sellingCostsPercentage: 6,
            capitalImprovements: '',
            originalBuyingCosts: ''
            // Simulating fields that were added later but are empty
          })
        }
      };

      const property = Property.fromJSON(legacyData);
      
      expect(property.inputs.saleConfig.capitalImprovements).toBe('');
      expect(property.inputs.saleConfig.originalBuyingCosts).toBe('');
      expect(property.adjustedCostBasis).toBe(400000); // Just purchase price
    });

    it('should handle completely missing saleConfig in legacy data', () => {
      const legacyData = {
        id: 'test-id',
        name: 'Very Legacy Property',
        type: 'property' as const,
        enabled: true,
        inputs: {
          purchasePrice: '350000',
          downPaymentPercentage: '25',
          interestRate: '7'
          // No saleConfig at all
        }
      };

      const property = Property.fromJSON(legacyData);
      
      expect(property.inputs.saleConfig.capitalImprovements).toBe('');
      expect(property.inputs.saleConfig.originalBuyingCosts).toBe('');
      expect(property.inputs.saleConfig.isPlannedForSale).toBe(false);
      expect(property.adjustedCostBasis).toBe(350000);
    });
  });

  describe('dynamic updates', () => {
    it('should recalculate adjusted cost basis when cost fields are updated', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000'
      });

      expect(property.adjustedCostBasis).toBe(500000);

      // Update capital improvements
      property.updateSaleConfig('capitalImprovements', '30000');

      expect(property.adjustedCostBasis).toBe(530000);

      // Update buying costs
      property.updateSaleConfig('originalBuyingCosts', '12000');

      expect(property.adjustedCostBasis).toBe(542000); // 500k + 30k + 12k
    });

    it('should recalculate capital gain when cost basis changes', () => {
      const property = new Property('Test Property', {
        purchasePrice: '300000',
        downPaymentPercentage: '50',
        saleConfig: createSaleConfig({
          isPlannedForSale: true,
          saleYear: 5,
          expectedSalePrice: 500000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          capitalImprovements: '',
          originalBuyingCosts: ''
        })
      });
      property.portfolioStore = { years: '10' };

      const initialGain = property.capitalGain;

      // Add capital improvements (increases cost basis, reduces gain)
      property.updateSaleConfig('capitalImprovements', '50000');

      const newGain = property.capitalGain;
      expect(newGain).toBeLessThan(initialGain);
    });
  });
});