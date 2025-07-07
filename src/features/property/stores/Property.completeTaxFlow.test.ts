import { Property } from './Property';

describe('Property - Complete Tax Flow Integration Tests', () => {
  describe('Federal + State Tax Integration', () => {
    it('should calculate federal and state taxes for California property', () => {
      const property = new Property('California Investment Property', {
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
          capitalImprovements: '20000',
          originalBuyingCosts: '10000',
          filingStatus: 'single',
          annualIncome: '120000',
          state: 'CA',
          enableStateTax: true,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields - investment property
          isPrimaryResidence: false,
          yearsOwned: '3',
          yearsLived: '0',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Capital gain: $700k - $42k selling costs - ($500k + $20k + $10k) = $128k
      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeCloseTo(128000, 0);

      // Section 121 should not apply (investment property)
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(false);
      expect(exclusion.remainingGain).toBe(128000);

      // Federal tax: With $120k income, single filer should be in 15% bracket
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBeCloseTo(19200, 0); // $128k * 15%

      // State tax: California 13.3%
      const stateTax = property.stateTaxAmount;
      expect(stateTax).toBeCloseTo(17024, 0); // $128k * 13.3%

      // Total tax
      const totalTax = property.totalTaxAmount;
      expect(totalTax).toBeCloseTo(36224, 0); // $19.2k + $17.024k

      // Net after-tax proceeds
      const netProceeds = property.netSaleProceeds;
      const netAfterTax = property.netAfterTaxProceeds;
      expect(netAfterTax).toBeCloseTo(netProceeds - totalTax, 0);
    });

    it('should calculate zero state tax for Texas property', () => {
      const property = new Property('Texas Investment Property', {
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
          capitalImprovements: '15000',
          originalBuyingCosts: '5000',
          filingStatus: 'single',
          annualIncome: '100000',
          state: 'TX',
          enableStateTax: true,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields
          isPrimaryResidence: false,
          yearsOwned: '5',
          yearsLived: '0',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Capital gain: $600k - $36k selling costs - ($400k + $15k + $5k) = $144k
      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeCloseTo(144000, 0);

      // Federal tax: With $100k income, should be in 15% bracket
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBeCloseTo(21600, 0); // $144k * 15%

      // State tax: Texas has no capital gains tax
      const stateTax = property.stateTaxAmount;
      expect(stateTax).toBe(0);

      // Total tax should equal federal tax only
      const totalTax = property.totalTaxAmount;
      expect(totalTax).toBe(federalTax);
    });

    it('should disable state tax when enableStateTax is false', () => {
      const property = new Property('Property with State Tax Disabled', {
        purchasePrice: '300000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 3,
          expectedSalePrice: 450000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '10000',
          originalBuyingCosts: '5000',
          filingStatus: 'single',
          annualIncome: '80000',
          state: 'CA',
          enableStateTax: false, // Disabled
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields
          isPrimaryResidence: false,
          yearsOwned: '3',
          yearsLived: '0',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeGreaterThan(0);

      // State tax should be disabled
      const stateTax = property.stateTaxAmount;
      expect(stateTax).toBe(0);

      const stateTaxCalc = property.stateTaxCalculation;
      expect(stateTaxCalc.notes).toBe('State tax disabled or sale not configured');

      // Total tax should equal federal tax only
      const federalTax = property.federalTaxAmount;
      const totalTax = property.totalTaxAmount;
      expect(totalTax).toBe(federalTax);
    });
  });

  describe('Section 121 + State Tax Integration', () => {
    it('should apply Section 121 exclusion before calculating state tax', () => {
      const property = new Property('California Primary Residence with High Gain', {
        purchasePrice: '600000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 5,
          expectedSalePrice: 1100000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '30000',
          originalBuyingCosts: '15000',
          filingStatus: 'single',
          annualIncome: '150000',
          state: 'CA',
          enableStateTax: true,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields - primary residence
          isPrimaryResidence: true,
          yearsOwned: '5',
          yearsLived: '5',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Capital gain: $1.1M - $66k selling costs - ($600k + $30k + $15k) = $389k
      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeCloseTo(389000, 0);

      // Section 121 exclusion should apply
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(true);
      expect(exclusion.appliedExclusion).toBe(250000); // Single filer max
      expect(exclusion.remainingGain).toBe(139000); // $389k - $250k

      // Federal tax on remaining gain
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBeCloseTo(20850, 0); // $139k * 15%

      // State tax on remaining gain
      const stateTax = property.stateTaxAmount;
      expect(stateTax).toBeCloseTo(18487, 0); // $139k * 13.3%

      // Total tax
      const totalTax = property.totalTaxAmount;
      expect(totalTax).toBeCloseTo(39337, 0);
    });

    it('should calculate taxes for married couple in New York', () => {
      const property = new Property('NY Primary Residence - Married Couple', {
        purchasePrice: '800000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 4,
          expectedSalePrice: 1400000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '50000',
          originalBuyingCosts: '20000',
          filingStatus: 'married_joint',
          annualIncome: '200000',
          state: 'NY',
          enableStateTax: true,
          otherCapitalGains: '',
          carryoverLosses: '',
          // Section 121 fields
          isPrimaryResidence: true,
          yearsOwned: '4',
          yearsLived: '4',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Capital gain: $1.4M - $84k selling costs - ($800k + $50k + $20k) = $446k
      const capitalGain = property.capitalGain;
      expect(capitalGain).toBeCloseTo(446000, 0);

      // Section 121 exclusion for married filing jointly
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(true);
      expect(exclusion.appliedExclusion).toBe(446000); // Fully excluded (under $500k limit)
      expect(exclusion.remainingGain).toBe(0);

      // No federal tax due to full exclusion
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBe(0);

      // No state tax due to full exclusion
      const stateTax = property.stateTaxAmount;
      expect(stateTax).toBe(0);

      // Total tax should be zero
      const totalTax = property.totalTaxAmount;
      expect(totalTax).toBe(0);
    });
  });

  describe('Other Capital Gains and Losses Integration', () => {
    it('should include other gains and losses in state tax calculation', () => {
      const property = new Property('Property with Other Capital Activity', {
        purchasePrice: '400000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 3,
          expectedSalePrice: 550000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '15000',
          originalBuyingCosts: '8000',
          filingStatus: 'single',
          annualIncome: '120000',
          state: 'CA',
          enableStateTax: true,
          otherCapitalGains: '25000', // Additional gains
          carryoverLosses: '10000', // Previous losses
          // Section 121 fields - investment property
          isPrimaryResidence: false,
          yearsOwned: '3',
          yearsLived: '0',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Property capital gain: $550k - $33k selling costs - ($400k + $15k + $8k) = $94k
      const propertyGain = property.capitalGain;
      expect(propertyGain).toBeCloseTo(94000, 0);

      // Total taxable for federal: $94k + $25k - $10k = $109k
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBeCloseTo(16350, 0); // $109k * 15%

      // Total taxable for state: $94k + $25k - $10k = $109k
      const stateTax = property.stateTaxAmount;
      expect(stateTax).toBeCloseTo(14497, 0); // $109k * 13.3%

      // Verify state tax calculation details
      const stateTaxCalc = property.stateTaxCalculation;
      expect(stateTaxCalc.stateCode).toBe('CA');
      expect(stateTaxCalc.taxableGain).toBeCloseTo(109000, 0);
      expect(stateTaxCalc.taxRate).toBe(0.133);
    });

    it('should handle Section 121 exclusion with other gains', () => {
      const property = new Property('Primary Residence with Stock Gains', {
        purchasePrice: '500000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 3,
          expectedSalePrice: 800000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '20000',
          originalBuyingCosts: '10000',
          filingStatus: 'single',
          annualIncome: '130000',
          state: 'CA',
          enableStateTax: true,
          otherCapitalGains: '50000', // Stock sale gains
          carryoverLosses: '5000', // Small loss carryover
          // Section 121 fields - primary residence
          isPrimaryResidence: true,
          yearsOwned: '3',
          yearsLived: '3',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Property gain: $800k - $48k selling costs - ($500k + $20k + $10k) = $222k
      const propertyGain = property.capitalGain;
      expect(propertyGain).toBeCloseTo(222000, 0);

      // Section 121 exclusion
      const exclusion = property.section121Exclusion;
      expect(exclusion.isEligible).toBe(true);
      expect(exclusion.appliedExclusion).toBe(222000); // Fully excluded
      expect(exclusion.remainingGain).toBe(0);

      // Federal tax on other gains only: $50k - $5k = $45k
      const federalTax = property.federalTaxAmount;
      expect(federalTax).toBeCloseTo(6750, 0); // $45k * 15%

      // State tax on other gains only: $50k - $5k = $45k
      const stateTax = property.stateTaxAmount;
      expect(stateTax).toBeCloseTo(5985, 0); // $45k * 13.3%

      // Verify the taxable amount calculation
      const stateTaxCalc = property.stateTaxCalculation;
      expect(stateTaxCalc.taxableGain).toBeCloseTo(45000, 0); // $0 property + $50k other - $5k losses
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle unknown state gracefully', () => {
      const property = new Property('Property in Unknown State', {
        purchasePrice: '400000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 3,
          expectedSalePrice: 500000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '',
          originalBuyingCosts: '',
          filingStatus: 'single',
          annualIncome: '100000',
          state: 'XX', // Unknown state
          enableStateTax: true,
          otherCapitalGains: '',
          carryoverLosses: '',
          isPrimaryResidence: false,
          yearsOwned: '3',
          yearsLived: '0',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      const stateTaxCalc = property.stateTaxCalculation;
      expect(stateTaxCalc.stateCode).toBe('XX');
      expect(stateTaxCalc.stateName).toBe('Unknown State');
      expect(stateTaxCalc.hasCapitalGainsTax).toBe(false);
      expect(stateTaxCalc.taxAmount).toBe(0);
      expect(stateTaxCalc.notes).toBe('State not found in tax database');
    });

    it('should handle negative total taxable gain', () => {
      const property = new Property('Property with Large Losses', {
        purchasePrice: '600000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 3,
          expectedSalePrice: 650000,
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
          enableStateTax: true,
          otherCapitalGains: '5000',
          carryoverLosses: '100000', // Large loss carryover
          isPrimaryResidence: false,
          yearsOwned: '3',
          yearsLived: '0',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Property gain: $650k - $39k selling costs - ($600k + $10k + $5k) = -$4k (loss)
      // Total: -$4k + $5k - $100k = -$99k (net loss)
      
      const federalTax = property.federalTaxAmount;
      const stateTax = property.stateTaxAmount;
      
      expect(federalTax).toBe(0); // No tax on net loss
      expect(stateTax).toBe(0); // No state tax on net loss
    });
  });

  describe('Net After-Tax Proceeds Calculation', () => {
    it('should calculate correct net after-tax proceeds with all taxes', () => {
      const property = new Property('Complete Tax Calculation Test', {
        purchasePrice: '500000',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 4,
          expectedSalePrice: 750000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: false,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '25000',
          originalBuyingCosts: '12000',
          filingStatus: 'single',
          annualIncome: '110000',
          state: 'CA',
          enableStateTax: true,
          otherCapitalGains: '',
          carryoverLosses: '',
          isPrimaryResidence: false,
          yearsOwned: '4',
          yearsLived: '0',
          hasUsedExclusionInLastTwoYears: false,
          enableSection121: true,
        },
      });
      property.portfolioStore = { years: '10', startingYear: '2024' };

      // Calculate all components
      const federalTax = property.federalTaxAmount;
      const stateTax = property.stateTaxAmount;
      const totalTax = property.totalTaxAmount;
      
      // Net sale proceeds (before tax)
      const netProceeds = property.netSaleProceeds;
      // Don't assume mortgage amount - just verify the calculation is consistent
      expect(netProceeds).toBeGreaterThan(0);
      
      // Net after-tax proceeds
      const netAfterTax = property.netAfterTaxProceeds;
      const expectedNetAfterTax = netProceeds - totalTax;
      expect(netAfterTax).toBeCloseTo(expectedNetAfterTax, 0);
      
      // Verify all taxes are included
      expect(totalTax).toBe(federalTax + stateTax);
      expect(totalTax).toBeGreaterThan(0);
    });
  });
});