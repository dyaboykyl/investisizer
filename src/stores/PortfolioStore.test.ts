import { PortfolioStore } from './PortfolioStore';

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
      const assetId = store.addAsset('My Stock Portfolio');
      expect(store.assets.size).toBe(2);
      expect(store.activeTabId).toBe(assetId);
      expect(store.hasUnsavedChanges).toBe(true);
      
      const newAsset = store.assets.get(assetId);
      expect(newAsset?.name).toBe('My Stock Portfolio');
      expect(newAsset?.inputs.years).toBe('10');
      expect(newAsset?.inputs.inflationRate).toBe('2.5');
    });

    it('should auto-generate asset names', () => {
      store.addAsset();
      store.addAsset();
      const assetNames = store.assetsList.map(a => a.name);
      expect(assetNames).toContain('Asset 2');
      expect(assetNames).toContain('Asset 3');
    });

    it('should remove assets but keep at least one', () => {
      const asset2Id = store.addAsset('Asset 2');
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
      const asset2Id = store.addAsset('Asset 2');
      const asset3Id = store.addAsset('Asset 3');
      store.setActiveTab(asset2Id);
      
      store.removeAsset(asset2Id);
      expect(store.activeTabId).not.toBe(asset2Id);
      expect([asset3Id, store.assetsList[0].id, 'combined']).toContain(store.activeTabId);
    });

    it('should duplicate an asset', () => {
      const originalId = store.assetsList[0].id;
      const original = store.assets.get(originalId)!;
      original.setName('Original');
      original.updateInput('initialAmount', '50000');
      original.setInflationAdjustedContributions(true);
      
      const duplicateId = store.duplicateAsset(originalId);
      expect(store.assets.size).toBe(2);
      
      const duplicate = store.assets.get(duplicateId!);
      expect(duplicate?.name).toBe('Original (copy)');
      expect(duplicate?.inputs.initialAmount).toBe('50000');
      expect(duplicate?.inflationAdjustedContributions).toBe(true);
      expect(store.activeTabId).toBe(duplicateId);
      expect(store.hasUnsavedChanges).toBe(true);
    });
  });

  describe('Shared Input Management', () => {
    it('should update years for all assets', () => {
      store.addAsset('Asset 2');
      store.setYears('20');
      
      expect(store.years).toBe('20');
      store.assetsList.forEach(asset => {
        expect(asset.inputs.years).toBe('20');
      });
      expect(store.hasUnsavedChanges).toBe(true);
    });

    it('should update inflation rate for all assets', () => {
      store.addAsset('Asset 2');
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
      const asset2Id = store.addAsset('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;
      
      asset1.updateInput('initialAmount', '10000');
      asset1.updateInput('annualContribution', '1000');
      asset2.updateInput('initialAmount', '20000');
      asset2.updateInput('annualContribution', '2000');
      
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
      const asset2Id = store.addAsset('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;
      
      asset1.updateInput('annualContribution', '1000');
      asset2.updateInput('annualContribution', '2000');
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
      const asset2Id = store.addAsset('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;
      
      // Asset 1: $10,000 initial + $1,000/year * 10 years = $20,000
      asset1.updateInput('initialAmount', '10000');
      asset1.updateInput('annualContribution', '1000');
      asset1.updateInput('years', '10');
      
      // Asset 2: $20,000 initial + $2,000/year * 10 years = $40,000
      asset2.updateInput('initialAmount', '20000');
      asset2.updateInput('annualContribution', '2000');
      asset2.updateInput('years', '10');
      
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
      expect(newStore.assetsList[0].inputs.initialAmount).toBe('25000');
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
      const asset2Id = store.addAsset();
      store.setActiveTab('combined');
      expect(store.activeTabId).toBe('combined');
      
      store.setActiveTab(asset2Id);
      expect(store.activeTabId).toBe(asset2Id);
    });
    
    it('should undo changes', () => {
      // Save initial state
      const asset1 = store.assetsList[0];
      asset1.setName('Original Asset');
      asset1.updateInput('initialAmount', '50000');
      store.saveToLocalStorage();
      
      // Make changes
      asset1.setName('Modified Asset');
      asset1.updateInput('initialAmount', '100000');
      store.addAsset('New Asset');
      expect(store.hasUnsavedChanges).toBe(true);
      expect(store.assets.size).toBe(2);
      expect(asset1.name).toBe('Modified Asset');
      
      // Undo changes
      store.undoChanges();
      expect(store.hasUnsavedChanges).toBe(false);
      expect(store.assets.size).toBe(1);
      expect(store.assetsList[0].name).toBe('Original Asset');
      expect(store.assetsList[0].inputs.initialAmount).toBe('50000');
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
      const asset2Id = store.addAsset();
      store.assets.get(asset2Id)!.setEnabled(false);
      
      expect(store.enabledAssets.length).toBe(1);
      expect(store.enabledAssets[0]).toBe(store.assetsList[0]);
    });
    
    it('should calculate total contributions correctly', () => {
      const asset1 = store.assetsList[0];
      const asset2Id = store.addAsset('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;
      
      // Set up assets
      asset1.updateInput('initialAmount', '10000');
      asset1.updateInput('annualContribution', '1000');
      asset2.updateInput('initialAmount', '20000');
      asset2.updateInput('annualContribution', '2000');
      store.setYears('10');
      
      // Total should be: (10000 + 1000*10) + (20000 + 2000*10) = 60000
      expect(store.totalContributions).toBe(60000);
      
      // Disable one asset
      asset2.setEnabled(false);
      
      // Total should be: 10000 + 1000*10 = 20000
      expect(store.totalContributions).toBe(20000);
      
      // Change years
      store.setYears('5');
      
      // Total should be: 10000 + 1000*5 = 15000
      expect(store.totalContributions).toBe(15000);
      
      // Test with withdrawals (negative contributions)
      asset1.updateInput('annualContribution', '-2000');
      
      // Total should be: 10000 + (-2000*5) = 0
      expect(store.totalContributions).toBe(0);
      
      // Test with large withdrawals resulting in negative total
      asset1.updateInput('annualContribution', '-5000');
      store.setYears('10');
      
      // Total should be: 10000 + (-5000*10) = -40000
      expect(store.totalContributions).toBe(-40000);
    });
    
    it('should calculate total contributions with inflation adjustment', () => {
      const asset1 = store.assetsList[0];
      const asset2Id = store.addAsset('Asset 2');
      const asset2 = store.assets.get(asset2Id)!;
      
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
      
      // Asset 1: 10000 + (1000*1.03) + (1000*1.03^2) + (1000*1.03^3) = 10000 + 1030 + 1060.9 + 1092.73 = 13183.63
      // Asset 2: 20000 + 2000*3 = 26000
      // Total: 39183.63
      expect(store.totalContributions).toBeCloseTo(39183.63, 1);
      
      // Enable inflation adjustment for asset 2
      asset2.setInflationAdjustedContributions(true);
      
      // Asset 1: 10000 + 1030 + 1060.9 + 1092.73 = 13183.63
      // Asset 2: 20000 + (2000*1.03) + (2000*1.03^2) + (2000*1.03^3) = 20000 + 2060 + 2121.8 + 2185.45 = 26367.25
      // Total: 39550.88
      expect(store.totalContributions).toBeCloseTo(39550.88, 1);
      
      // Test with zero years - note that setYears enforces minimum of 1
      store.setYears('0');
      // setYears should have enforced minimum of 1 year
      expect(store.years).toBe('1');
      // So we still get 1 year of contributions
      // Asset 1: 10000 + (1000 * 1.03^1) = 10000 + 1030 = 11030
      // Asset 2: 20000 + (2000 * 1.03^1) = 20000 + 2060 = 22060
      // Total: 33090
      expect(store.totalContributions).toBe(33090);
    });
    
    it('should handle inflation-adjusted withdrawals in total contributions', () => {
      const asset = store.assetsList[0];
      
      asset.updateInput('initialAmount', '100000');
      asset.updateInput('annualContribution', '-5000'); // Withdrawal
      asset.updateInput('inflationRate', '2');
      asset.setInflationAdjustedContributions(true);
      
      store.setYears('3');
      
      // 100000 + (-5000*1.02) + (-5000*1.02^2) + (-5000*1.02^3) = 100000 - 5100 - 5202 - 5306.04 = 84391.96
      expect(store.totalContributions).toBeCloseTo(84391.96, 2);
    });
  });

  describe('Clear All', () => {
    it('should clear all assets and create a default one', () => {
      store.addAsset('Asset 2');
      store.addAsset('Asset 3');
      expect(store.assets.size).toBe(3);
      
      store.clearAll();
      expect(store.assets.size).toBe(1);
      expect(store.assetsList[0].name).toBe('Asset 1');
      expect(store.activeTabId).toBe('combined');
      expect(localStorageMock.getItem('portfolioData')).toBe(null);
    });
  });
});