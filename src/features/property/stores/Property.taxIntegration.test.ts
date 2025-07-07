import { Property } from '@/features/property/stores/Property';

describe('Property - Tax Integration', () => {
  describe('federal tax calculations', () => {
    let property: Property;

    beforeEach(() => {
      property = new Property('Tax Test Property', {
        purchasePrice: '300000',
        downPaymentPercentage: '50', // Very high down payment to reduce mortgage
        interestRate: '6',
        loanTerm: '30',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 10, // Sell after 10 years to pay down more mortgage
          expectedSalePrice: 600000, // Double the purchase price
          useProjectedValue: false,
          sellingCostsPercentage: 5, // Lower selling costs
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '20000',
          originalBuyingCosts: '10000'
        }
      });
      property.portfolioStore = { years: '15' };
    });

    it('should calculate federal tax with 0% rate for low income', () => {
      const taxResult = property.calculateFederalTax(40000, 'single');
      
      expect(taxResult.taxRate).toBe(0.00);
      expect(taxResult.taxAmount).toBe(0);
      expect(taxResult.bracketInfo.rate).toBe(0.00);
    });

    it('should calculate federal tax with 15% rate for middle income', () => {
      const taxResult = property.calculateFederalTax(100000, 'single');
      
      expect(taxResult.taxRate).toBe(0.15);
      expect(taxResult.taxAmount).toBeGreaterThan(0);
      expect(taxResult.bracketInfo.rate).toBe(0.15);
      
      // Verify calculation: taxable gain * 15%
      const expectedTax = taxResult.taxableGain * 0.15;
      expect(taxResult.taxAmount).toBeCloseTo(expectedTax, 2);
    });

    it('should calculate federal tax with 20% rate for high income', () => {
      const taxResult = property.calculateFederalTax(600000, 'single');
      
      expect(taxResult.taxRate).toBe(0.20);
      expect(taxResult.taxAmount).toBeGreaterThan(0);
      expect(taxResult.bracketInfo.rate).toBe(0.20);
    });

    it('should handle different filing statuses correctly', () => {
      const singleResult = property.calculateFederalTax(100000, 'single');
      const marriedResult = property.calculateFederalTax(100000, 'married_joint');
      
      // Same income but different filing status should potentially result in different rates
      // For $100k, single filer is in 15% bracket, married filing jointly is in 15% bracket too
      expect(singleResult.taxRate).toBe(0.15);
      expect(marriedResult.taxRate).toBe(0.15);
    });

    it('should apply carryover losses to reduce taxable gain', () => {
      const withoutLosses = property.calculateFederalTax(100000, 'single', 0, 0);
      const withLosses = property.calculateFederalTax(100000, 'single', 0, 30000);
      
      expect(withLosses.taxableGain).toBe(withoutLosses.taxableGain - 30000);
      expect(withLosses.taxAmount).toBeLessThan(withoutLosses.taxAmount);
    });

    it('should add other capital gains to increase taxable gain', () => {
      const withoutOtherGains = property.calculateFederalTax(100000, 'single', 0, 0);
      const withOtherGains = property.calculateFederalTax(100000, 'single', 20000, 0);
      
      expect(withOtherGains.taxableGain).toBe(withoutOtherGains.taxableGain + 20000);
      expect(withOtherGains.taxAmount).toBeGreaterThan(withoutOtherGains.taxAmount);
    });

    it('should handle scenario where losses exceed gains', () => {
      const largePropertyGain = property.capitalGain;
      const excessiveLosses = largePropertyGain + 50000;
      
      const result = property.calculateFederalTax(100000, 'single', 0, excessiveLosses);
      
      expect(result.taxableGain).toBe(0);
      expect(result.taxAmount).toBe(0);
    });

    it('should return zero tax when property is not for sale', () => {
      const notForSaleProperty = new Property('Not For Sale', {
        purchasePrice: '300000',
        saleConfig: {
          isPlannedForSale: false, // Not for sale
          saleYear: null,
          expectedSalePrice: null,
          useProjectedValue: true,
          sellingCostsPercentage: 5,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '',
          originalBuyingCosts: ''
        }
      });
      
      const result = notForSaleProperty.calculateFederalTax(100000, 'single');
      
      expect(result.taxableGain).toBe(0);
      expect(result.taxAmount).toBe(0);
      expect(result.taxRate).toBe(0);
    });
  });

  describe('getFederalTaxAmount convenience method', () => {
    let property: Property;

    beforeEach(() => {
      property = new Property('Tax Amount Test', {
        purchasePrice: '300000',
        downPaymentPercentage: '30',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 3,
          expectedSalePrice: 450000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '15000',
          originalBuyingCosts: '10000'
        }
      });
      property.portfolioStore = { years: '8' };
    });

    it('should return just the tax amount', () => {
      const fullResult = property.calculateFederalTax(100000, 'single');
      const taxAmount = property.getFederalTaxAmount(100000, 'single');
      
      expect(taxAmount).toBe(fullResult.taxAmount);
      expect(typeof taxAmount).toBe('number');
    });

    it('should handle all the same parameters as full calculation', () => {
      const taxAmount = property.getFederalTaxAmount(100000, 'single', 15000, 5000);
      const fullResult = property.calculateFederalTax(100000, 'single', 15000, 5000);
      
      expect(taxAmount).toBe(fullResult.taxAmount);
    });
  });

  describe('calculateNetAfterTaxProceeds integration', () => {
    let property: Property;

    beforeEach(() => {
      property = new Property('After-Tax Test', {
        purchasePrice: '500000',
        downPaymentPercentage: '20',
        interestRate: '7',
        loanTerm: '30',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 8,
          expectedSalePrice: 750000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '30000',
          originalBuyingCosts: '20000'
        }
      });
      property.portfolioStore = { years: '12' };
    });

    it('should calculate net after-tax proceeds correctly', () => {
      const netProceeds = property.netSaleProceeds;
      const federalTax = property.getFederalTaxAmount(150000, 'married_joint');
      const netAfterTax = property.calculateNetAfterTaxProceeds(150000, 'married_joint');
      
      expect(netAfterTax).toBe(netProceeds - federalTax);
      expect(netAfterTax).toBeLessThanOrEqual(netProceeds);
    });

    it('should preserve existing selling costs calculation', () => {
      const salePrice = property.effectiveSalePrice;
      const sellingCosts = property.sellingCosts;
      
      // Verify selling costs are still calculated correctly (6% of sale price)
      expect(sellingCosts).toBe(salePrice * 0.06);
      
      // Just verify netSaleProceeds is calculated correctly by the property
      expect(property.netSaleProceeds).toBeGreaterThan(0);
      expect(property.netSaleProceeds).toBeLessThan(salePrice);
    });

    it('should show tax as additional deduction beyond existing costs', () => {
      const netProceeds = property.netSaleProceeds; // After selling costs and mortgage
      const federalTax = property.getFederalTaxAmount(100000, 'single');
      const netAfterTax = property.calculateNetAfterTaxProceeds(100000, 'single');
      
      // After-tax should be net proceeds minus taxes
      expect(netAfterTax).toBe(netProceeds - federalTax);
      
      // Show the complete waterfall: Sale Price -> Selling Costs -> Mortgage -> Taxes -> Final Net
      const salePrice = property.effectiveSalePrice;
      
      expect(salePrice).toBeGreaterThan(0);
      expect(netProceeds).toBeGreaterThan(0);
      expect(netProceeds).toBeLessThan(salePrice); // Net should be less than gross
      expect(netAfterTax).toBe(netProceeds - federalTax);
    });

    it('should handle zero tax scenarios', () => {
      const netProceeds = property.netSaleProceeds;
      const netAfterTax = property.calculateNetAfterTaxProceeds(30000, 'single'); // 0% bracket
      
      expect(netAfterTax).toBe(netProceeds); // No tax deduction
    });

    it('should handle high tax scenarios', () => {
      // Create a property specifically designed to have a large capital gain
      const highGainProperty = new Property('High Gain Property', {
        purchasePrice: '100000', // Low purchase price
        downPaymentPercentage: '80', // Very high down payment
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 15, // Long time for mortgage paydown
          expectedSalePrice: 800000, // Very high sale price
          useProjectedValue: false,
          sellingCostsPercentage: 3, // Low selling costs
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '',
          originalBuyingCosts: ''
        }
      });
      highGainProperty.portfolioStore = { years: '20' };
      
      const netProceeds = highGainProperty.netSaleProceeds;
      const capitalGain = highGainProperty.capitalGain;
      const taxAmount = highGainProperty.getFederalTaxAmount(800000, 'single');
      const netAfterTax = highGainProperty.calculateNetAfterTaxProceeds(800000, 'single'); // 20% bracket
      
      expect(capitalGain).toBeGreaterThan(0); // Should have capital gain
      expect(taxAmount).toBeGreaterThan(0); // Should have some tax
      expect(netAfterTax).toBe(netProceeds - taxAmount);
      expect(netAfterTax).toBeLessThan(netProceeds);
    });

    it('should return 0 when property is not for sale', () => {
      const testProperty = new Property('Not For Sale Property', {
        purchasePrice: '300000',
        saleConfig: {
          isPlannedForSale: false, // Not for sale
          saleYear: null,
          expectedSalePrice: null,
          useProjectedValue: true,
          sellingCostsPercentage: 5,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '',
          originalBuyingCosts: ''
        }
      });
      testProperty.portfolioStore = { years: '10' };
      
      const netAfterTax = testProperty.calculateNetAfterTaxProceeds(100000, 'single');
      expect(netAfterTax).toBe(0);
    });
  });

  describe('cost basis integration with taxes', () => {
    it('should use adjusted cost basis for capital gains calculation', () => {
      const property = new Property('Cost Basis Tax Test', {
        purchasePrice: '400000',
        downPaymentPercentage: '25',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 5,
          expectedSalePrice: 600000,
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '50000', // High improvements to reduce gain
          originalBuyingCosts: '25000'   // High buying costs to reduce gain
        }
      });
      property.portfolioStore = { years: '8' };

      const adjustedBasis = property.adjustedCostBasis;
      const capitalGain = property.capitalGain;
      const netProceeds = property.netSaleProceeds;
      
      // Verify cost basis calculation
      expect(adjustedBasis).toBe(400000 + 50000 + 25000); // 475k
      
      // Verify capital gain uses adjusted basis
      expect(capitalGain).toBe(Math.max(0, netProceeds - adjustedBasis));
      
      // Verify tax calculation uses the reduced capital gain
      const taxResult = property.calculateFederalTax(100000, 'single');
      expect(taxResult.taxableGain).toBe(capitalGain);
    });

    it('should show tax savings from higher cost basis', () => {
      const lowBasisProperty = new Property('Low Basis Property', {
        purchasePrice: '200000',
        downPaymentPercentage: '50', // High down payment to ensure gain
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 10,
          expectedSalePrice: 500000, // Big gain
          useProjectedValue: false,
          sellingCostsPercentage: 5,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '',     // No improvements
          originalBuyingCosts: ''      // No buying costs
        }
      });
      lowBasisProperty.portfolioStore = { years: '15' };

      const highBasisProperty = new Property('High Basis Property', {
        purchasePrice: '200000',
        downPaymentPercentage: '50',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 10,
          expectedSalePrice: 500000, // Same sale price
          useProjectedValue: false,
          sellingCostsPercentage: 5,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '100000', // High improvements
          originalBuyingCosts: '30000'   // High buying costs
        }
      });
      highBasisProperty.portfolioStore = { years: '15' };

      const lowBasisGain = lowBasisProperty.capitalGain;
      const highBasisGain = highBasisProperty.capitalGain;
      
      // Verify different capital gains
      expect(lowBasisGain).toBeGreaterThan(highBasisGain);
      
      const lowBasisTax = lowBasisProperty.getFederalTaxAmount(100000, 'single');
      const highBasisTax = highBasisProperty.getFederalTaxAmount(100000, 'single');
      
      // Higher basis should result in lower taxes (if there's a difference in gains)
      if (lowBasisGain > highBasisGain) {
        expect(highBasisTax).toBeLessThanOrEqual(lowBasisTax);
      }
      
      // Verify the mechanics
      expect(lowBasisProperty.adjustedCostBasis).toBe(200000);
      expect(highBasisProperty.adjustedCostBasis).toBe(330000); // 200k + 100k + 30k
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle properties with no capital gain', () => {
      const property = new Property('No Gain Property', {
        purchasePrice: '500000',
        downPaymentPercentage: '20',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 2,
          expectedSalePrice: 400000, // Selling at a loss
          useProjectedValue: false,
          sellingCostsPercentage: 6,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '',
          originalBuyingCosts: ''
        }
      });
      property.portfolioStore = { years: '5' };

      const capitalGain = property.capitalGain;
      const taxResult = property.calculateFederalTax(100000, 'single');
      
      expect(capitalGain).toBe(0); // No gain from loss sale
      expect(taxResult.taxableGain).toBe(0);
      expect(taxResult.taxAmount).toBe(0);
    });

    it('should handle very high sale prices correctly', () => {
      const property = new Property('High Value Property', {
        purchasePrice: '1000000',
        downPaymentPercentage: '40',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 10,
          expectedSalePrice: 3000000, // 3x appreciation
          useProjectedValue: false,
          sellingCostsPercentage: 5,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '100000',
          originalBuyingCosts: '50000'
        }
      });
      property.portfolioStore = { years: '15' };

      const capitalGain = property.capitalGain;
      const taxResult = property.calculateFederalTax(800000, 'single'); // High income = 20% rate
      
      expect(capitalGain).toBeGreaterThan(0);
      expect(taxResult.taxRate).toBe(0.20); // High income bracket
      expect(taxResult.taxAmount).toBeGreaterThan(0);
      expect(Number.isFinite(taxResult.taxAmount)).toBe(true);
    });

    it('should handle decimal values in calculations', () => {
      const property = new Property('Decimal Test Property', {
        purchasePrice: '333333.33',
        downPaymentPercentage: '33.33',
        saleConfig: {
          isPlannedForSale: true,
          saleYear: 3,
          expectedSalePrice: 444444.44,
          useProjectedValue: false,
          sellingCostsPercentage: 6.66,
          reinvestProceeds: true,
          targetInvestmentId: null,
          saleMonth: 6,
          capitalImprovements: '11111.11',
          originalBuyingCosts: '5555.55'
        }
      });
      property.portfolioStore = { years: '6' };

      const taxResult = property.calculateFederalTax(77777.77, 'single');
      
      expect(Number.isFinite(taxResult.taxAmount)).toBe(true);
      expect(taxResult.taxAmount).toBeGreaterThanOrEqual(0);
    });
  });
});