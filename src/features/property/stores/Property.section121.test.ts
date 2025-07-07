import { Property } from './Property';

describe('Property - Section 121 Integration Tests', () => {
  describe('Section 121 Primary Residence Exclusion', () => {
    it('should calculate full exclusion for qualifying primary residence', () => {
      const property = new Property('Primary Residence', {
        purchasePrice: '400000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 5,
          expectedSalePrice: 600000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '20000',
          originalBuyingCosts: '5000',
          filingStatus: 'single',
          annualIncome: '100000',
          state: 'CA',
          enableStateTax: false,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields
          isPrimaryResidence: true,
          yearsOwned: '5',
          yearsLived: '5',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
          // Depreciation Recapture fields
          enableDepreciationRecapture: false,
          totalDepreciationTaken: '',
          landValuePercentage: '20',
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Capital gain calculation: $600k - $6k*6% selling costs - ($400k + $20k improvements + $5k buying costs)
      // = $600k - $36k - $425k = $139k capital gain
      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeCloseTo(139000, 0);

      // Section 121 exclusion should fully exclude the gain
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(true);
      expect(exclusion.maxExclusion).toBe(250000); // Single filer max
      expect(exclusion.appliedExclusion).toBe(139000); // Full gain excluded
      expect(exclusion.remainingGain).toBe(0);

      // Federal tax should be $0 due to full exclusion
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBe(0);

      // Net after-tax proceeds should equal net proceeds (no tax)
      const netProceeds = property.netSaleProceeds;
      const netAfterTax = property.netAfterTaxProceeds;
      expect(netAfterTax).toBe(netProceeds);
    });

    it('should calculate partial exclusion for high-gain primary residence', () => {
      const property = new Property('High Value Primary Residence', {
        purchasePrice: '500000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 3,
          expectedSalePrice: 900000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '30000',
          originalBuyingCosts: '10000',
          filingStatus: 'single',
          annualIncome: '150000',
          state: 'CA',
          enableStateTax: false,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields
          isPrimaryResidence: true,
          yearsOwned: '3',
          yearsLived: '3',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
          // Depreciation Recapture fields
          enableDepreciationRecapture: false,
          totalDepreciationTaken: '',
          landValuePercentage: '20',
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Capital gain: $900k - $54k selling costs - ($500k + $30k + $10k) = $306k
      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeCloseTo(306000, 0);

      // Section 121 exclusion should partially exclude the gain
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(true);
      expect(exclusion.maxExclusion).toBe(250000);
      expect(exclusion.appliedExclusion).toBe(250000);
      expect(exclusion.remainingGain).toBe(56000); // $306k - $250k exclusion

      // Federal tax should be calculated on remaining $56k gain
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBeGreaterThan(0);
      
      // With $150k income, single filer should be in 15% capital gains bracket
      // Tax on $56k should be $56k * 0.15 = $8,400
      expect(federalTax).toBeCloseTo(8400, 0);
    });

    it('should calculate exclusion for married filing jointly', () => {
      const property = new Property('Married Couple Primary Residence', {
        purchasePrice: '600000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 4,
          expectedSalePrice: 1200000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '50000',
          originalBuyingCosts: '15000',
          filingStatus: 'married_joint',
          annualIncome: '150000',
          state: 'CA',
          enableStateTax: false,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields
          isPrimaryResidence: true,
          yearsOwned: '4',
          yearsLived: '4',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
          // Depreciation Recapture fields
          enableDepreciationRecapture: false,
          totalDepreciationTaken: '',
          landValuePercentage: '20',
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Capital gain: $1.2M - $72k selling costs - ($600k + $50k + $15k) = $463k
      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeCloseTo(463000, 0);

      // Section 121 exclusion for married filing jointly
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(true);
      expect(exclusion.maxExclusion).toBe(500000); // Married joint max
      expect(exclusion.appliedExclusion).toBe(463000); // Full gain excluded
      expect(exclusion.remainingGain).toBe(0);

      // Federal tax should be $0 due to full exclusion
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBe(0);
    });

    it('should reject exclusion for investment property', () => {
      const property = new Property('Investment Property', {
        purchasePrice: '300000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 5,
          expectedSalePrice: 450000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '10000',
          originalBuyingCosts: '5000',
          filingStatus: 'single',
          annualIncome: '100000',
          state: 'CA',
          enableStateTax: false,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields - investment property
          isPrimaryResidence: false, // Not primary residence
          yearsOwned: '5',
          yearsLived: '0',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
          // Depreciation Recapture fields
          enableDepreciationRecapture: false,
          totalDepreciationTaken: '',
          landValuePercentage: '20',
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Capital gain: $450k - $27k selling costs - ($300k + $10k + $5k) = $108k
      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeCloseTo(108000, 0);

      // Section 121 exclusion should be rejected
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(false);
      expect(exclusion.appliedExclusion).toBe(0);
      expect(exclusion.remainingGain).toBe(108000);
      expect(exclusion.reason).toBe('Property is not a primary residence');

      // Federal tax should be calculated on full capital gain
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBeGreaterThan(0);
      
      // With $100k income, should be in 15% bracket: $108k * 0.15 = $16,200
      expect(federalTax).toBeCloseTo(16200, 0);
    });

    it('should reject exclusion for insufficient ownership time', () => {
      const property = new Property('Short-term Primary Residence', {
        purchasePrice: '400000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 1,
          expectedSalePrice: 500000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '5000',
          originalBuyingCosts: '5000',
          filingStatus: 'single',
          annualIncome: '80000',
          state: 'CA',
          enableStateTax: false,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields - insufficient time
          isPrimaryResidence: true,
          yearsOwned: '1.5', // Less than 2 years
          yearsLived: '1.5',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
          // Depreciation Recapture fields
          enableDepreciationRecapture: false,
          totalDepreciationTaken: '',
          landValuePercentage: '20',
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeGreaterThan(0);

      // Section 121 exclusion should be rejected
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(false);
      expect(exclusion.appliedExclusion).toBe(0);
      expect(exclusion.remainingGain).toBe(capitalGain);
      expect(exclusion.reason).toContain('Ownership requirement not met');

      // Federal tax should be calculated on full capital gain
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBeGreaterThan(0);
    });

    it('should disable Section 121 when enableSection121 is false', () => {
      const property = new Property('Primary Residence - Section 121 Disabled', {
        purchasePrice: '400000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 5,
          expectedSalePrice: 600000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '20000',
          originalBuyingCosts: '5000',
          filingStatus: 'single',
          annualIncome: '100000',
          state: 'CA',
          enableStateTax: false,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields - qualifying but disabled
          isPrimaryResidence: true,
          yearsOwned: '5',
          yearsLived: '5',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: false, // Disabled
          // Depreciation Recapture fields
          enableDepreciationRecapture: false,
          totalDepreciationTaken: '',
          landValuePercentage: '20',
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeGreaterThan(0);

      // Section 121 exclusion should be disabled
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(false);
      expect(exclusion.reason).toBe('Sale not configured or Section 121 disabled');

      // Federal tax should be calculated on full capital gain (original behavior)
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBeGreaterThan(0);
      
      // Should match the original federal tax calculation
      const originalTaxCalculation = property.federalTaxCalculation;
      expect(federalTax).toBe(originalTaxCalculation.taxAmount);
    });

    it('should handle Section 121 with other capital gains and carryover losses', () => {
      const property = new Property('Primary Residence with Other Gains', {
        purchasePrice: '500000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 3,
          expectedSalePrice: 700000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '15000',
          originalBuyingCosts: '10000',
          filingStatus: 'single',
          annualIncome: '120000',
          state: 'CA',
          enableStateTax: false,
          otherCapitalGains: '30000', // Additional $30k in gains
          carryoverLosses: '10000', // $10k in carryover losses
          // Section 121 fields
          isPrimaryResidence: true,
          yearsOwned: '3',
          yearsLived: '3',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
          // Depreciation Recapture fields
          enableDepreciationRecapture: false,
          totalDepreciationTaken: '',
          landValuePercentage: '20',
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Capital gain: $700k - $42k selling costs - ($500k + $15k + $10k) = $133k
      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeCloseTo(133000, 0);

      // Section 121 should exclude the property gain
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(true);
      expect(exclusion.appliedExclusion).toBe(133000);
      expect(exclusion.remainingGain).toBe(0);

      // Federal tax should be calculated on: ($0 remaining + $30k other - $10k losses) = $20k
      const federalTax = property.federalTaxAmount;
      
      // With $120k income, should be in 15% bracket: $20k * 0.15 = $3,000
      expect(federalTax).toBeCloseTo(3000, 0);
    });
  });

  describe('Section 121 with no sale configuration', () => {
    it('should return default exclusion when sale is not planned', () => {
      const property = new Property('No Sale Property', {
        purchasePrice: '400000',
        saleConfig: {
          isPlannedForSale: false, // No sale planned
          saleYear: null,
          expectedSalePrice: null,
          useProjectedValue: true,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '',
          originalBuyingCosts: '',
          filingStatus: 'single',
          annualIncome: '100000',
          state: 'CA',
          enableStateTax: false,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields
          isPrimaryResidence: true,
          yearsOwned: '5',
          yearsLived: '5',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
          // Depreciation Recapture fields
          enableDepreciationRecapture: false,
          totalDepreciationTaken: '',
          landValuePercentage: '20',
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(false);
      expect(exclusion.maxExclusion).toBe(0);
      expect(exclusion.appliedExclusion).toBe(0);
      expect(exclusion.reason).toBe('Sale not configured or Section 121 disabled');

      // Federal tax amount should be 0 (no sale)
      expect(property.federalTaxAmount).toBe(0);
    });
  });
});