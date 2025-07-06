import { PortfolioStore } from '@/features/portfolio/stores/PortfolioStore';
import { Property } from '@/features/property/stores/Property';
import { Investment } from '@/features/investment/stores/Investment';

describe('Investment Sale Proceeds Integration', () => {
  let portfolioStore: PortfolioStore;
  let investmentId: string;
  let propertyId: string;

  beforeEach(() => {
    portfolioStore = new PortfolioStore();
    
    investmentId = portfolioStore.addInvestment('Test Investment', {
      initialAmount: '100000',
      annualContribution: '10000',
      rateOfReturn: '7',
      years: '10'
    });
    
    propertyId = portfolioStore.addProperty('Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '10',
      linkedInvestmentId: investmentId
    });
  });

  describe('sale proceeds in investment cash flows', () => {
    it('should include sale proceeds in linked investment cash flows', () => {
      const property = portfolioStore.assets.get(propertyId) as Property;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const cashFlows = portfolioStore.getLinkedPropertyCashFlows(investmentId);
      
      // Sale year should have significantly higher cash flow
      expect(cashFlows[4]).toBeGreaterThan(cashFlows[3]); // Year 5 (index 4) vs Year 4
      expect(cashFlows[4]).toBeGreaterThan(50000); // Should include substantial sale proceeds
    });

    it('should handle sale proceeds to different investment', () => {
      const otherInvestmentId = portfolioStore.addInvestment('Other Investment', {
        initialAmount: '50000',
        annualContribution: '5000',
        rateOfReturn: '6',
        years: '10'
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 6);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', otherInvestmentId);
      
      const originalCashFlows = portfolioStore.getLinkedPropertyCashFlows(investmentId);
      const targetCashFlows = portfolioStore.getLinkedPropertyCashFlows(otherInvestmentId);
      
      // Original investment should still get regular cash flows but no sale proceeds
      expect(originalCashFlows[5]).toBeLessThan(0); // Regular mortgage payments (negative)
      
      // Target investment should get sale proceeds
      expect(targetCashFlows[5]).toBeGreaterThan(0); // Sale proceeds (positive)
    });

    it('should not include sale proceeds when keeping proceeds separate', () => {
      const property = portfolioStore.assets.get(propertyId) as Property;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4);
      property.updateSaleConfig('reinvestProceeds', false);
      
      const cashFlows = portfolioStore.getLinkedPropertyCashFlows(investmentId);
      
      // Should continue getting regular mortgage payments until sale year
      expect(cashFlows[3]).toBeLessThan(0); // Year 4 should have mortgage payments
      expect(cashFlows[4]).toBe(0); // Year 5+ should be zero (property sold, no reinvestment)
    });
  });

  describe('investment balance impact', () => {
    it('should show investment balance spike in sale year', () => {
      const property = portfolioStore.assets.get(propertyId) as Property;
      const investment = portfolioStore.assets.get(investmentId) as Investment;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 500000);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const year4Balance = investment.results[4].balance;
      const year5Balance = investment.results[5].balance;
      const year5Contribution = investment.results[5].annualContribution;
      
      // Balance increase should be much larger than normal contribution
      const balanceIncrease = year5Balance - year4Balance;
      expect(balanceIncrease).toBeGreaterThan(year5Contribution * 5); // At least 5x normal contribution
    });

    it('should maintain proper investment calculations after sale proceeds', () => {
      const property = portfolioStore.assets.get(propertyId) as Property;
      const investment = portfolioStore.assets.get(investmentId) as Investment;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      // Verify investment continues normal growth after sale
      const year3Result = investment.results[3];
      const year4Result = investment.results[4];
      
      // Year 4 should show normal growth rate applied to enhanced balance
      const expectedGrowth = year3Result.balance * 0.07; // 7% growth
      const actualGrowth = year4Result.balance - year3Result.balance - year4Result.annualContribution;
      
      expect(actualGrowth).toBeCloseTo(expectedGrowth, -2); // Allow for rounding
    });
  });

  describe('multiple property sales', () => {
    it('should handle multiple properties selling to same investment in same year', () => {
      const property2Id = portfolioStore.addProperty('Property 2', {
        purchasePrice: '300000',
        downPaymentPercentage: '25',
        years: '10',
        linkedInvestmentId: investmentId
      });
      
      const property1 = portfolioStore.assets.get(propertyId) as Property;
      const property2 = portfolioStore.assets.get(property2Id) as Property;
      
      // Both properties sell in year 5
      property1.setSaleEnabled(true);
      property1.updateSaleConfig('saleYear', 5);
      property1.updateSaleConfig('reinvestProceeds', true);
      property1.updateSaleConfig('targetInvestmentId', investmentId);
      
      property2.setSaleEnabled(true);
      property2.updateSaleConfig('saleYear', 5);
      property2.updateSaleConfig('reinvestProceeds', true);
      property2.updateSaleConfig('targetInvestmentId', investmentId);
      
      const cashFlows = portfolioStore.getLinkedPropertyCashFlows(investmentId);
      const investment = portfolioStore.assets.get(investmentId) as Investment;
      
      // Year 5 cash flow should include proceeds from both properties
      expect(cashFlows[4]).toBeGreaterThan(100000); // Substantial combined proceeds
      
      // Investment balance should reflect both sales
      const year5Result = investment.results[5];
      expect(year5Result.balance).toBeGreaterThan(250000); // Large balance increase
    });
  });
});

describe('Portfolio-Level Sale Integration', () => {
  let portfolioStore: PortfolioStore;

  beforeEach(() => {
    portfolioStore = new PortfolioStore();
  });

  describe('combined results with property sales', () => {
    it('should handle asset allocation transition during property sale', () => {
      const investmentId = portfolioStore.addInvestment('Investment', {
        initialAmount: '100000',
        annualContribution: '12000',
        rateOfReturn: '7',
        years: '8'
      });
      
      const propertyId = portfolioStore.addProperty('Property', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        years: '8',
        linkedInvestmentId: investmentId
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const combinedResults = portfolioStore.combinedResults;
      
      // Before sale: should have both property and investment values
      const year4Result = combinedResults[4];
      expect(year4Result.totalPropertyValue).toBeGreaterThan(0);
      expect(year4Result.totalInvestmentBalance).toBeGreaterThan(0);
      
      // After sale: property value should be zero, investment balance should be higher
      const year6Result = combinedResults[6];
      expect(year6Result.totalPropertyValue).toBe(0);
      expect(year6Result.totalInvestmentBalance).toBeGreaterThan(year4Result.totalInvestmentBalance);
      
      // Total portfolio value should transition smoothly
      expect(year6Result.totalBalance).toBeGreaterThan(0);
    });

    it('should maintain portfolio totals across sale transition', () => {
      const portfolioStore = new PortfolioStore();
      
      const investmentId = portfolioStore.addInvestment('Investment', {
        initialAmount: '50000',
        annualContribution: '6000',
        rateOfReturn: '6',
        years: '6'
      });
      
      const propertyId = portfolioStore.addProperty('Property', {
        purchasePrice: '300000',
        downPaymentPercentage: '20',
        propertyGrowthRate: '4',
        years: '6',
        linkedInvestmentId: investmentId
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const combinedResults = portfolioStore.combinedResults;
      
      // Total balance should increase over time even with asset transition
      for (let i = 1; i < combinedResults.length; i++) {
        expect(combinedResults[i].totalBalance).toBeGreaterThanOrEqual(
          combinedResults[i-1].totalBalance * 0.95 // Allow for some transaction costs
        );
      }
    });
  });

  describe('asset breakdown with sales', () => {
    it('should show correct asset breakdown before and after sale', () => {
      const investmentId = portfolioStore.addInvestment('Investment', {
        initialAmount: '100000',
        years: '6'
      });
      
      const propertyId = portfolioStore.addProperty('Property', {
        purchasePrice: '400000',
        downPaymentPercentage: '25',
        years: '6'
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const combinedResults = portfolioStore.combinedResults;
      
      // Before sale: should have both assets in breakdown
      const year2Result = combinedResults[2];
      expect(year2Result.assetBreakdown).toHaveLength(2);
      expect(year2Result.assetBreakdown.find(asset => asset.assetType === 'property')).toBeDefined();
      expect(year2Result.assetBreakdown.find(asset => asset.assetType === 'investment')).toBeDefined();
      
      // After sale: should only have investment in breakdown
      const year4Result = combinedResults[4];
      expect(year4Result.assetBreakdown).toHaveLength(1);
      expect(year4Result.assetBreakdown[0].assetType).toBe('investment');
      expect(year4Result.assetBreakdown[0].balance).toBeGreaterThan(100000); // Enhanced by sale proceeds
    });
  });
});

describe('Property Sale Serialization', () => {
  describe('JSON serialization', () => {
    it('should serialize sale configuration correctly', () => {
      const property = new Property('Serialization Test', {
        purchasePrice: '500000',
        years: '8'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 6);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 600000);
      property.updateSaleConfig('sellingCostsPercentage', 8);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', 'target-investment');
      property.updateSaleConfig('saleMonth', 9);
      
      const json = property.toJSON();
      
      expect(json.inputs.saleConfig.isPlannedForSale).toBe(true);
      expect(json.inputs.saleConfig.saleYear).toBe(6);
      expect(json.inputs.saleConfig.useProjectedValue).toBe(false);
      expect(json.inputs.saleConfig.expectedSalePrice).toBe(600000);
      expect(json.inputs.saleConfig.sellingCostsPercentage).toBe(8);
      expect(json.inputs.saleConfig.reinvestProceeds).toBe(true);
      expect(json.inputs.saleConfig.targetInvestmentId).toBe('target-investment');
      expect(json.inputs.saleConfig.saleMonth).toBe(9);
    });

    it('should deserialize sale configuration correctly', () => {
      const propertyData = {
        id: 'test-id',
        name: 'Deserialization Test',
        type: 'property' as const,
        enabled: true,
        inputs: {
          purchasePrice: '450000',
          downPaymentPercentage: '20',
          interestRate: '6.5',
          loanTerm: '30',
          years: '7',
          inflationRate: '2.5',
          yearsBought: '1',
          propertyGrowthRate: '3.5',
          monthlyPayment: '',
          linkedInvestmentId: 'linked-investment',
          propertyGrowthModel: 'purchase_price' as const,
          currentEstimatedValue: '',
          isRentalProperty: false,
          monthlyRent: '2000',
          rentGrowthRate: '3',
          vacancyRate: '5',
          annualExpenses: '8000',
          expenseGrowthRate: '3',
          saleConfig: {
            isPlannedForSale: true,
            saleYear: 5,
            expectedSalePrice: 550000,
            useProjectedValue: false,
            sellingCostsPercentage: 7.5,
            reinvestProceeds: true,
            targetInvestmentId: 'target-investment',
            saleMonth: 8
          }
        },
        showBalance: true,
        showContributions: true,
        showNetGain: true
      };
      
      const property = Property.fromJSON(propertyData);
      
      expect(property.inputs.saleConfig.isPlannedForSale).toBe(true);
      expect(property.inputs.saleConfig.saleYear).toBe(5);
      expect(property.inputs.saleConfig.expectedSalePrice).toBe(550000);
      expect(property.inputs.saleConfig.useProjectedValue).toBe(false);
      expect(property.inputs.saleConfig.sellingCostsPercentage).toBe(7.5);
      expect(property.inputs.saleConfig.reinvestProceeds).toBe(true);
      expect(property.inputs.saleConfig.targetInvestmentId).toBe('target-investment');
      expect(property.inputs.saleConfig.saleMonth).toBe(8);
    });
  });

  describe('portfolio store persistence', () => {
    it('should persist and restore sale configurations through portfolio store', () => {
      const portfolioStore = new PortfolioStore();
      
      const propertyId = portfolioStore.addProperty('Persistence Test', {
        purchasePrice: '400000',
        years: '10'
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 7);
      property.updateSaleConfig('sellingCostsPercentage', 8.5);
      
      // Simulate save and reload
      portfolioStore.saveToLocalStorage();
      const newPortfolioStore = new PortfolioStore();
      
      const restoredProperty = newPortfolioStore.assets.get(propertyId) as Property;
      expect(restoredProperty.inputs.saleConfig.isPlannedForSale).toBe(true);
      expect(restoredProperty.inputs.saleConfig.saleYear).toBe(7);
      expect(restoredProperty.inputs.saleConfig.sellingCostsPercentage).toBe(8.5);
    });
  });
});