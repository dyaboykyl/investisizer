import { PortfolioStore } from './PortfolioStore';
import { isInvestment } from './AssetFactory';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('PortfolioStore', () => {
  let store: PortfolioStore;

  beforeEach(() => {
    localStorageMock.clear();
    store = new PortfolioStore();
  });

  describe('Initial State', () => {
    it('should create a default asset on initialization', () => {
      expect(store.assets.size).toBe(1);
      expect(store.assetsList.length).toBe(1);
      expect(store.assetsList[0].name).toBe('Asset 1');
    });

    it('should have correct initial values', () => {
      expect(store.activeTabId).toBe('combined');
      expect(store.hasUnsavedChanges).toBe(false);
      expect(store.years).toBe('10');
      expect(store.inflationRate).toBe('2.5');
    });
  });

  describe('Asset Management', () => {
    it('should add a new asset', () => {
      const assetId = store.addInvestment('My Stock Portfolio');
      expect(store.assets.size).toBe(2);
      expect(store.activeTabId).toBe(assetId);
      expect(store.hasUnsavedChanges).toBe(true);

      const newAsset = store.assets.get(assetId);
      expect(newAsset?.name).toBe('My Stock Portfolio');
      expect(newAsset?.inputs.years).toBe('10');
      expect(newAsset?.inputs.inflationRate).toBe('2.5');
    });

    it('should auto-generate asset names', () => {
      store.addInvestment();
      store.addInvestment();
      const assetNames = store.assetsList.map(a => a.name);
      expect(assetNames).toContain('Asset 2');
      expect(assetNames).toContain('Asset 3');
    });

    it('should remove assets but keep at least one', () => {
      const asset2Id = store.addInvestment('Asset 2');
      expect(store.assets.size).toBe(2);

      store.removeAsset(asset2Id);
      expect(store.assets.size).toBe(1);
      expect(store.hasUnsavedChanges).toBe(true);

      // Try to remove the last asset - should not work
      const lastAssetId = store.assetsList[0].id;
      store.removeAsset(lastAssetId);
      expect(store.assets.size).toBe(1);
    });

    it('should switch active tab when removing current tab', () => {
      const asset2Id = store.addInvestment('Asset 2');
      const asset3Id = store.addInvestment('Asset 3');
      store.setActiveTab(asset2Id);

      store.removeAsset(asset2Id);
      expect(store.activeTabId).not.toBe(asset2Id);
      expect([asset3Id, store.assetsList[0].id, 'combined']).toContain(store.activeTabId);
    });

    it('should duplicate an investment asset', () => {
      const originalId = store.assetsList[0].id;
      const original = store.assets.get(originalId)!;
      original.setName('Original');
      
      if (isInvestment(original)) {
        original.updateInput('initialAmount', '50000');
        original.setInflationAdjustedContributions(true);
      }

      const duplicateId = store.duplicateAsset(originalId);
      expect(store.assets.size).toBe(2);

      const duplicate = store.assets.get(duplicateId!);
      expect(duplicate?.name).toBe('Original (copy)');
      
      if (duplicate && isInvestment(duplicate)) {
        expect(duplicate.inputs.initialAmount).toBe('50000');
        expect(duplicate.inflationAdjustedContributions).toBe(true);
      }
      
      expect(store.activeTabId).toBe(duplicateId);
      expect(store.hasUnsavedChanges).toBe(true);
    });
  });

  describe('Shared Input Management', () => {
    it('should update years for all assets', () => {
      store.addInvestment('Asset 2');
      store.setYears('20');

      expect(store.years).toBe('20');
      store.assetsList.forEach(asset => {
        expect(asset.inputs.years).toBe('20');
      });
      expect(store.hasUnsavedChanges).toBe(true);
    });

    it('should update inflation rate for all assets', () => {
      store.addInvestment('Asset 2');
      store.setInflationRate('3.5');

      expect(store.inflationRate).toBe('3.5');
      store.assetsList.forEach(asset => {
        expect(asset.inputs.inflationRate).toBe('3.5');
      });
      expect(store.hasUnsavedChanges).toBe(true);
    });
  });

  describe('Combined Results', () => {
    it('should calculate combined results for enabled assets', () => {
      const asset1 = store.assetsList[0];
      const asset2Id = store.addInvestment('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;

      if (isInvestment(asset1)) {
        asset1.updateInput('initialAmount', '10000');
        asset1.updateInput('annualContribution', '1000');
      }
      if (isInvestment(asset2)) {
        asset2.updateInput('initialAmount', '20000');
        asset2.updateInput('annualContribution', '2000');
      }

      const combined = store.combinedResults;
      expect(combined.length).toBe(11); // 10 years + year 0

      const yearZero = combined[0];
      expect(yearZero.totalBalance).toBe(30000); // Just initial amounts
      expect(yearZero.totalAnnualContribution).toBe(0); // No contributions in year 0

      const firstYear = combined[1];
      expect(firstYear.totalBalance).toBeGreaterThan(30000);
      expect(firstYear.totalAnnualContribution).toBe(3000);
      expect(firstYear.assetBreakdown.length).toBe(2);
    });

    it('should exclude disabled assets from combined results', () => {
      const asset1 = store.assetsList[0];
      const asset2Id = store.addInvestment('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;

      if (isInvestment(asset1)) {
        asset1.updateInput('annualContribution', '1000');
      }
      if (isInvestment(asset2)) {
        asset2.updateInput('annualContribution', '2000');
      }
      asset2.setEnabled(false);

      const combined = store.combinedResults;
      expect(combined[0].totalAnnualContribution).toBe(0); // Year 0
      expect(combined[1].totalAnnualContribution).toBe(1000); // Year 1
      expect(combined[0].assetBreakdown.length).toBe(1);
    });

    it('should return empty array when no assets are enabled', () => {
      store.assetsList[0].setEnabled(false);
      expect(store.enabledAssets.length).toBe(0);
      expect(store.combinedResults.length).toBe(0);
    });

    it('should correctly calculate total contributions across all years', () => {
      const asset1 = store.assetsList[0];
      const asset2Id = store.addInvestment('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;

      // Asset 1: $10,000 initial + $1,000/year * 10 years = $20,000
      if (isInvestment(asset1)) {
        asset1.updateInput('initialAmount', '10000');
        asset1.updateInput('annualContribution', '1000');
        asset1.updateInput('years', '10');
      }

      // Asset 2: $20,000 initial + $2,000/year * 10 years = $40,000
      if (isInvestment(asset2)) {
        asset2.updateInput('initialAmount', '20000');
        asset2.updateInput('annualContribution', '2000');
        asset2.updateInput('years', '10');
      }

      const combined = store.combinedResults;

      // Verify annual contributions are summed correctly
      expect(combined[0].totalAnnualContribution).toBe(0); // Year 0 has no contributions
      expect(combined[1].totalAnnualContribution).toBe(3000); // $1,000 + $2,000
      expect(combined[10].totalAnnualContribution).toBe(3000); // Should be same each year

      // Verify cumulative calculations would show $60,000 total
      // ($10,000 + $20,000 initial) + ($1,000 + $2,000) * 10 years
      let cumulativeContributions = 30000; // Initial amounts
      for (let i = 1; i <= 10; i++) {
        cumulativeContributions += combined[i].totalAnnualContribution;
      }
      expect(cumulativeContributions).toBe(60000);
    });
  });

  describe('Persistence', () => {
    it('should save to localStorage', () => {
      const asset1 = store.assetsList[0];
      asset1.setName('Saved Asset');
      store.setYears('15');
      store.setInflationRate('3');

      store.saveToLocalStorage();
      expect(store.hasUnsavedChanges).toBe(false);

      const saved = JSON.parse(localStorageMock.getItem('portfolioData') || '{}');
      expect(saved.assets.length).toBe(1);
      expect(saved.assets[0].name).toBe('Saved Asset');
      expect(saved.years).toBe('15');
      expect(saved.inflationRate).toBe('3');
      expect(saved.activeTabId).toBe('combined');
    });

    it('should load from localStorage', () => {
      const data = {
        assets: [
          {
            id: 'asset-1',
            name: 'Loaded Asset',
            enabled: true,
            type: 'investment',
            inputs: {
              initialAmount: '25000',
              years: '20',
              rateOfReturn: '8',
              inflationRate: '3',
              annualContribution: '3000'
            }
          }
        ],
        activeTabId: 'asset-1',
        years: '20',
        inflationRate: '3'
      };

      localStorageMock.setItem('portfolioData', JSON.stringify(data));

      const newStore = new PortfolioStore();
      expect(newStore.assets.size).toBe(1);
      expect(newStore.assetsList[0].name).toBe('Loaded Asset');
      if (isInvestment(newStore.assetsList[0])) {
        expect(newStore.assetsList[0].inputs.initialAmount).toBe('25000');
      }
      expect(newStore.activeTabId).toBe('asset-1');
      expect(newStore.years).toBe('20');
      expect(newStore.inflationRate).toBe('3');
    });

    it('should handle invalid localStorage data gracefully', () => {
      // Mock console.error to suppress expected error message
      const originalError = console.error;
      console.error = jest.fn();

      localStorageMock.setItem('portfolioData', 'invalid json');
      const newStore = new PortfolioStore();
      expect(newStore.assets.size).toBe(1); // Should create default asset

      // Verify error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load portfolio data from localStorage:',
        expect.any(Error)
      );

      // Restore console.error
      console.error = originalError;
    });
  });

  describe('State Management', () => {
    it('should track unsaved changes', () => {
      expect(store.hasUnsavedChanges).toBe(false);

      store.markAsChanged();
      expect(store.hasUnsavedChanges).toBe(true);

      store.saveToLocalStorage();
      expect(store.hasUnsavedChanges).toBe(false);
    });

    it('should set active tab', () => {
      const asset2Id = store.addInvestment();
      store.setActiveTab('combined');
      expect(store.activeTabId).toBe('combined');

      store.setActiveTab(asset2Id);
      expect(store.activeTabId).toBe(asset2Id);
    });

    it('should undo changes', () => {
      // Save initial state
      const asset1 = store.assetsList[0];
      asset1.setName('Original Asset');
      if (isInvestment(asset1)) {
        asset1.updateInput('initialAmount', '50000');
      }
      store.saveToLocalStorage();

      // Make changes
      asset1.setName('Modified Asset');
      if (isInvestment(asset1)) {
        asset1.updateInput('initialAmount', '100000');
      }
      store.addInvestment('New Asset');
      expect(store.hasUnsavedChanges).toBe(true);
      expect(store.assets.size).toBe(2);
      expect(asset1.name).toBe('Modified Asset');

      // Undo changes
      store.undoChanges();
      expect(store.hasUnsavedChanges).toBe(false);
      expect(store.assets.size).toBe(1);
      expect(store.assetsList[0].name).toBe('Original Asset');
      if (isInvestment(store.assetsList[0])) {
        expect(store.assetsList[0].inputs.initialAmount).toBe('50000');
      }
    });
  });

  describe('Computed Properties', () => {
    it('should return active asset', () => {
      const asset1 = store.assetsList[0];
      store.setActiveTab(asset1.id);
      expect(store.activeAsset).toBe(asset1);

      store.setActiveTab('combined');
      expect(store.activeAsset).toBe(null);
    });

    it('should return enabled assets', () => {
      const asset2Id = store.addInvestment();
      store.assets.get(asset2Id)!.setEnabled(false);

      expect(store.enabledAssets.length).toBe(1);
      expect(store.enabledAssets[0]).toBe(store.assetsList[0]);
    });

    it('should calculate total contributions correctly', () => {
      const asset1 = store.assetsList[0];
      const asset2Id = store.addInvestment('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;

      // Set up assets
      if (isInvestment(asset1)) {
        asset1.updateInput('initialAmount', '10000');
        asset1.updateInput('annualContribution', '1000');
      }
      if (isInvestment(asset2)) {
        asset2.updateInput('initialAmount', '20000');
        asset2.updateInput('annualContribution', '2000');
      }
      store.setYears('10');

      // Test new separated calculations
      // Total initial investment: 10000 + 20000 = 30000
      expect(store.totalInitialInvestment).toBe(30000);

      // Total ongoing contributions: (1000*10) + (2000*10) = 30000
      expect(store.totalContributions).toBe(30000);

      // Total contributed (positive only): 30000
      expect(store.totalContributed).toBe(30000);

      // Total withdrawn: 0
      expect(store.totalWithdrawn).toBe(0);

      // Net contributions: 30000 - 0 = 30000
      expect(store.netContributions).toBe(30000);

      // Disable one asset
      asset2.setEnabled(false);

      // Only asset1 should be counted now
      expect(store.totalInitialInvestment).toBe(10000);
      expect(store.totalContributions).toBe(10000); // 1000 * 10

      // Change years
      store.setYears('5');

      // Total contributions should be: 1000*5 = 5000
      expect(store.totalContributions).toBe(5000);

      // Test with withdrawals (negative contributions)
      if (isInvestment(asset1)) {
        asset1.updateInput('annualContribution', '-2000');
      }

      // Total contributions should be: 0 (no positive contributions)
      expect(store.totalContributions).toBe(0);

      // Total withdrawn should be: 2000 * 5 = 10000
      expect(store.totalWithdrawn).toBe(10000);

      // Net contributions should be: 0 - 10000 = -10000
      expect(store.netContributions).toBe(-10000);

      // Test with large withdrawals resulting in negative net
      if (isInvestment(asset1)) {
        asset1.updateInput('annualContribution', '-5000');
      }
      store.setYears('10');

      // Total contributions: 0, Total withdrawn: 50000, Net: -50000
      expect(store.totalContributions).toBe(0);
      expect(store.totalWithdrawn).toBe(50000);
      expect(store.netContributions).toBe(-50000);
    });

    it('should calculate total contributions with inflation adjustment', () => {
      const asset1 = store.assetsList[0];
      const asset2Id = store.addInvestment('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;

      // Only run test if both assets are investments
      if (isInvestment(asset1) && isInvestment(asset2)) {
        // Setup assets with inflation-adjusted contributions
        asset1.updateInput('initialAmount', '10000');
        asset1.updateInput('annualContribution', '1000');
        asset1.updateInput('inflationRate', '3');
        asset1.setInflationAdjustedContributions(true);

        asset2.updateInput('initialAmount', '20000');
        asset2.updateInput('annualContribution', '2000');
        asset2.updateInput('inflationRate', '3');
        asset2.setInflationAdjustedContributions(false); // Not inflation-adjusted

        store.setYears('3');

        // Test separated calculations
        // Total initial investment: 10000 + 20000 = 30000
        expect(store.totalInitialInvestment).toBe(30000);

        // Asset 1 contributions: (1000*1.03) + (1000*1.03^2) + (1000*1.03^3) = 1030 + 1060.9 + 1092.73 = 3183.63
        // Asset 2 contributions: 2000*3 = 6000
        // Total contributions: 9183.63
        expect(store.totalContributions).toBeCloseTo(9183.63, 1);

        // Enable inflation adjustment for asset 2
        asset2.setInflationAdjustedContributions(true);

        // Asset 1 contributions: 1030 + 1060.9 + 1092.73 = 3183.63
        // Asset 2 contributions: (2000*1.03) + (2000*1.03^2) + (2000*1.03^3) = 2060 + 2121.8 + 2185.45 = 6367.25
        // Total contributions: 9550.88
        expect(store.totalContributions).toBeCloseTo(9550.88, 1);

        // Test with zero years - note that setYears enforces minimum of 1
        store.setYears('0');
        // setYears should have enforced minimum of 1 year
        expect(store.years).toBe('1');
        // So we still get 1 year of contributions
        // Asset 1: (1000 * 1.03^1) = 1030
        // Asset 2: (2000 * 1.03^1) = 2060
        // Total contributions: 3090 (not including initial amounts)
        expect(store.totalContributions).toBe(3090);
      } else {
        // Skip test for non-investment assets
        expect(true).toBe(true);
      }
    });

    it('should handle inflation-adjusted withdrawals in total contributions', () => {
      const asset = store.assetsList[0];

      if (isInvestment(asset)) {
        asset.updateInput('initialAmount', '100000');
        asset.updateInput('annualContribution', '-5000'); // Withdrawal
        asset.updateInput('inflationRate', '2');
        asset.setInflationAdjustedContributions(true);

        store.setYears('3');

        // Test separated calculations
        // Total initial investment: 100000
        expect(store.totalInitialInvestment).toBe(100000);

        // Total contributions: 0 (no positive contributions)
        expect(store.totalContributions).toBe(0);

        // Total withdrawn: (5000*1.02) + (5000*1.02^2) + (5000*1.02^3) = 5100 + 5202 + 5306.04 = 15608.04
        expect(store.totalWithdrawn).toBeCloseTo(15608.04, 2);

        // Net contributions: 0 - 15608.04 = -15608.04
        expect(store.netContributions).toBeCloseTo(-15608.04, 2);
      } else {
        // Skip test for non-investment assets
        expect(true).toBe(true);
      }
    });
  });

  describe('Property-Investment Linking', () => {
    it('should link a property to an investment and affect calculations', () => {
      // Create an investment and property
      const investmentId = store.addInvestment('Stock Portfolio');
      const propertyId = store.addProperty('Home');
      
      const investment = store.assets.get(investmentId)!;
      const property = store.assets.get(propertyId)!;

      // Set up investment
      if (isInvestment(investment)) {
        investment.updateInput('initialAmount', '100000');
        investment.updateInput('annualContribution', '12000');
        investment.updateInput('rateOfReturn', '7');
      }

      // Set up property with monthly payment
      if (property && property.type === 'property') {
        property.updateInput('purchasePrice', '500000');
        property.updateInput('downPaymentPercentage', '20');
        property.updateInput('interestRate', '6');
        property.updateInput('loanTerm', '30');
        property.updateInput('monthlyPayment', '3000');
        property.updateInput('linkedInvestmentId', investmentId);
      }

      store.setYears('5');
      
      // Recalculate with linked property
      // Calculations now happen automatically via computed properties

      // Verify property withdrawals are calculated
      const withdrawals = store.getLinkedPropertyWithdrawals(investmentId);
      expect(withdrawals.length).toBe(5);
      expect(withdrawals[0]).toBe(36000); // $3000 * 12 months
      expect(withdrawals[4]).toBe(36000); // Same for year 5

      // Verify investment results account for property payments
      if (isInvestment(investment)) {
        const results = investment.results;
        expect(results.length).toBe(6); // 5 years + year 0
        
        // Year 1 should have reduced net contribution due to property payment
        const year1 = results[1];
        expect(year1.annualContribution).toBe(-24000); // $12000 - $36000 = -$24000
        
        // Balance should be lower than without property payments
        expect(year1.balance).toBeLessThan(100000 * 1.07 + 12000); // Without property withdrawal
      }
    });

    it('should handle multiple properties linked to single investment', () => {
      const investmentId = store.addInvestment('Stock Portfolio');
      const property1Id = store.addProperty('Primary Home');
      const property2Id = store.addProperty('Rental Property');
      
      const investment = store.assets.get(investmentId)!;
      const property1 = store.assets.get(property1Id)!;
      const property2 = store.assets.get(property2Id)!;

      // Set up investment
      if (isInvestment(investment)) {
        investment.updateInput('initialAmount', '200000');
        investment.updateInput('annualContribution', '50000');
      }

      // Set up properties
      if (property1 && property1.type === 'property') {
        property1.updateInput('monthlyPayment', '2000');
        property1.updateInput('linkedInvestmentId', investmentId);
      }
      if (property2 && property2.type === 'property') {
        property2.updateInput('monthlyPayment', '1500');
        property2.updateInput('linkedInvestmentId', investmentId);
      }

      store.setYears('3');
      // Calculations now happen automatically via computed properties

      // Verify combined withdrawals
      const withdrawals = store.getLinkedPropertyWithdrawals(investmentId);
      expect(withdrawals.length).toBe(3);
      expect(withdrawals[0]).toBe(42000); // ($2000 + $1500) * 12 = $42000
      
      // Verify investment accounts for both properties
      if (isInvestment(investment)) {
        const year1 = investment.results[1];
        expect(year1.annualContribution).toBe(8000); // $50000 - $42000 = $8000
      }
    });

    it('should properly unlink property from investment', () => {
      // Set up linked property and investment
      const investmentId = store.addInvestment('Stock Portfolio');
      const propertyId = store.addProperty('Home');
      
      const investment = store.assets.get(investmentId)!;
      const property = store.assets.get(propertyId)!;

      if (isInvestment(investment)) {
        investment.updateInput('initialAmount', '100000');
        investment.updateInput('annualContribution', '12000');
      }

      if (property && property.type === 'property') {
        property.updateInput('monthlyPayment', '3000');
        property.updateInput('linkedInvestmentId', investmentId);
      }

      // Calculations now happen automatically via computed properties

      // Verify property is linked
      const linkedWithdrawals = store.getLinkedPropertyWithdrawals(investmentId);
      expect(linkedWithdrawals[0]).toBe(36000);

      // Unlink property
      if (property && property.type === 'property') {
        property.updateInput('linkedInvestmentId', '');
      }
      
      // Calculations now happen automatically via computed properties

      // Verify property is no longer linked
      const unlinkedWithdrawals = store.getLinkedPropertyWithdrawals(investmentId);
      expect(unlinkedWithdrawals[0]).toBe(0);

      // Verify investment calculation reverts to original
      if (isInvestment(investment)) {
        const year1 = investment.results[1];
        expect(year1.annualContribution).toBe(12000); // Back to original contribution
      }
    });

    it('should recalculate when property payment amount changes', () => {
      const investmentId = store.addInvestment('Stock Portfolio');
      const propertyId = store.addProperty('Home');
      
      const investment = store.assets.get(investmentId)!;
      const property = store.assets.get(propertyId)!;

      if (isInvestment(investment)) {
        investment.updateInput('initialAmount', '100000');
        investment.updateInput('annualContribution', '24000');
      }

      if (property && property.type === 'property') {
        property.updateInput('monthlyPayment', '1000');
        property.updateInput('linkedInvestmentId', investmentId);
      }

      // Calculations now happen automatically via computed properties

      // Initial state: $24000 - $12000 = $12000 net contribution
      if (isInvestment(investment)) {
        expect(investment.results[1].annualContribution).toBe(12000);
      }

      // Change property payment
      if (property && property.type === 'property') {
        property.updateInput('monthlyPayment', '2000');
      }
      
      // Calculations now happen automatically via computed properties

      // New state: $24000 - $24000 = $0 net contribution
      if (isInvestment(investment)) {
        expect(investment.results[1].annualContribution).toBe(0);
      }
    });

    it('should handle disabled properties in linked calculations', () => {
      const investmentId = store.addInvestment('Stock Portfolio');
      const propertyId = store.addProperty('Home');
      
      const investment = store.assets.get(investmentId)!;
      const property = store.assets.get(propertyId)!;

      if (isInvestment(investment)) {
        investment.updateInput('initialAmount', '100000');
        investment.updateInput('annualContribution', '24000');
      }

      if (property && property.type === 'property') {
        property.updateInput('monthlyPayment', '2000');
        property.updateInput('linkedInvestmentId', investmentId);
      }

      // Calculations now happen automatically via computed properties

      // With enabled property
      let withdrawals = store.getLinkedPropertyWithdrawals(investmentId);
      expect(withdrawals[0]).toBe(24000); // $2000 * 12

      // Disable property
      property.setEnabled(false);
      // Calculations now happen automatically via computed properties

      // With disabled property - no withdrawals
      withdrawals = store.getLinkedPropertyWithdrawals(investmentId);
      expect(withdrawals[0]).toBe(0);

      // Verify investment calculation doesn't include disabled property
      if (isInvestment(investment)) {
        expect(investment.results[1].annualContribution).toBe(24000); // Full contribution
      }
    });

    it('should properly calculate net gain with property withdrawals', () => {
      const investmentId = store.addInvestment('Stock Portfolio');
      const propertyId = store.addProperty('Home');
      
      const investment = store.assets.get(investmentId)!;
      const property = store.assets.get(propertyId)!;

      if (isInvestment(investment)) {
        investment.updateInput('initialAmount', '100000');
        investment.updateInput('annualContribution', '0'); // No manual contributions
        investment.updateInput('rateOfReturn', '10'); // Simple 10% return
      }

      if (property && property.type === 'property') {
        property.updateInput('monthlyPayment', '1000');
        property.updateInput('linkedInvestmentId', investmentId);
      }

      store.setYears('1');
      // Calculations now happen automatically via computed properties

      if (isInvestment(investment)) {
        const year1 = investment.results[1];
        
        // Expected calculation:
        // Starting balance: $100,000
        // Returns: $100,000 * 0.10 = $10,000
        // Property withdrawals: $1,000 * 12 = $12,000
        // Ending balance: $100,000 + $10,000 - $12,000 = $98,000
        // Net gain (balance change): $98,000 - $100,000 = -$2,000
        
        expect(year1.balance).toBe(98000);
        expect(year1.yearlyGain).toBe(-2000); // Simple balance difference
        expect(year1.annualContribution).toBe(-12000); // Property withdrawal
        expect(year1.totalEarnings).toBe(10000); // Investment gains only
      }
    });

    it('should exclude property withdrawals from investment gains calculation', () => {
      const investmentId = store.addInvestment('Stock Portfolio');
      const propertyId = store.addProperty('Home');
      
      const investment = store.assets.get(investmentId)!;
      const property = store.assets.get(propertyId)!;

      if (isInvestment(investment)) {
        investment.updateInput('initialAmount', '100000');
        investment.updateInput('annualContribution', '12000');
        investment.updateInput('rateOfReturn', '8');
      }

      if (property && property.type === 'property') {
        property.updateInput('monthlyPayment', '2000');
        property.updateInput('linkedInvestmentId', investmentId);
      }

      store.setYears('2');
      // Calculations now happen automatically via computed properties

      if (isInvestment(investment)) {
        const year1 = investment.results[1];
        const year2 = investment.results[2];
        
        // Year 1: Investment gains should exclude property payments
        // Investment gains = returns only, not affected by withdrawals for property
        expect(year1.totalEarnings).toBeGreaterThan(0); // Should have positive investment gains
        
        // Net contribution = manual contribution - property payment
        // $12,000 - $24,000 = -$12,000
        expect(year1.annualContribution).toBe(-12000);
        
        // Year 2 should compound properly
        expect(year2.totalEarnings).toBeGreaterThan(year1.totalEarnings);
      }
    });

    it('should maintain property linkage when investment inputs are updated', () => {
      const investmentId = store.addInvestment('Stock Portfolio');
      const propertyId = store.addProperty('Home');
      
      const investment = store.assets.get(investmentId)!;
      const property = store.assets.get(propertyId)!;

      // Set up initial investment and property
      if (isInvestment(investment)) {
        investment.updateInput('initialAmount', '100000');
        investment.updateInput('annualContribution', '24000');
        investment.updateInput('rateOfReturn', '7');
      }

      if (property && property.type === 'property') {
        property.updateInput('monthlyPayment', '2000');
        property.updateInput('linkedInvestmentId', investmentId);
      }

      // Calculations now happen automatically via computed properties

      // Verify initial linkage works
      if (isInvestment(investment)) {
        const initialYear1 = investment.results[1];
        expect(initialYear1.annualContribution).toBe(0); // $24,000 - $24,000 = $0
      }

      // Update investment input - this should maintain the property linkage
      if (isInvestment(investment)) {
        investment.updateInput('rateOfReturn', '10'); // Change return rate
        // Manually trigger recalculation since we're calling updateInput directly
        // Calculations now happen automatically via computed properties
      }

      // Verify property linkage is still maintained after input update
      if (isInvestment(investment)) {
        const updatedYear1 = investment.results[1];
        expect(updatedYear1.annualContribution).toBe(0); // Should still be $24,000 - $24,000 = $0
        
        // Verify the rate of return change took effect
        // With 10% return: $100,000 * 1.10 + $0 = $110,000
        expect(updatedYear1.balance).toBe(110000);
      }

      // Test updating annual contribution
      if (isInvestment(investment)) {
        investment.updateInput('annualContribution', '36000'); // Increase contribution
        // Calculations now happen automatically via computed properties
      }

      // Verify property withdrawals are still factored in
      if (isInvestment(investment)) {
        const finalYear1 = investment.results[1];
        expect(finalYear1.annualContribution).toBe(12000); // $36,000 - $24,000 = $12,000
      }
    });
  });

  describe('Clear All', () => {
    it('should clear all assets and create a default one', () => {
      store.addInvestment('Asset 2');
      store.addInvestment('Asset 3');
      expect(store.assets.size).toBe(3);

      store.clearAll();
      expect(store.assets.size).toBe(1);
      expect(store.assetsList[0].name).toBe('Asset 1');
      expect(store.activeTabId).toBe('combined');
      expect(localStorageMock.getItem('portfolioData')).toBe(null);
    });
  });
});