import { makeAutoObservable, computed } from 'mobx';
import { Asset } from './Asset';

export interface CombinedResult {
  year: number;
  totalBalance: number;
  totalRealBalance: number;
  totalAnnualContribution: number;
  totalRealAnnualContribution: number;
  totalEarnings: number;
  totalRealEarnings: number;
  totalYearlyGain: number;
  totalRealYearlyGain: number;
  assetBreakdown: {
    assetId: string;
    assetName: string;
    balance: number;
    realBalance: number;
    contribution: number;
    realContribution: number;
  }[];
}

export class PortfolioStore {
  assets: Map<string, Asset> = new Map();
  activeTabId: string = 'combined';
  hasUnsavedChanges: boolean = false;
  
  constructor() {
    makeAutoObservable(this, {
      enabledAssets: computed,
      combinedResults: computed,
      assetsList: computed,
      hasAssets: computed
    });
    
    // Load from localStorage on initialization
    this.loadFromLocalStorage();
    
    // If no assets exist, create a default one
    if (this.assets.size === 0) {
      this.addAsset('Asset 1');
    }
  }
  
  // Actions
  addAsset = (name?: string) => {
    const assetCount = this.assets.size + 1;
    const asset = new Asset(name || `Asset ${assetCount}`);
    this.assets.set(asset.id, asset);
    this.activeTabId = asset.id;
    this.hasUnsavedChanges = true;
    return asset.id;
  }
  
  removeAsset = (id: string) => {
    if (this.assets.size <= 1) {
      // Don't allow removing the last asset
      return;
    }
    
    this.assets.delete(id);
    
    // If we removed the active tab, switch to another tab
    if (this.activeTabId === id) {
      const firstAsset = this.assetsList[0];
      this.activeTabId = firstAsset ? firstAsset.id : 'combined';
    }
    
    this.hasUnsavedChanges = true;
  }
  
  updateAsset = (id: string, updates: Partial<Asset>) => {
    const asset = this.assets.get(id);
    if (!asset) return;
    
    Object.assign(asset, updates);
    this.hasUnsavedChanges = true;
  }
  
  setActiveTab = (id: string) => {
    this.activeTabId = id;
  }
  
  duplicateAsset = (id: string) => {
    const sourceAsset = this.assets.get(id);
    if (!sourceAsset) return;
    
    const newAsset = new Asset(
      `${sourceAsset.name} (copy)`,
      sourceAsset.inputs
    );
    
    // Copy display settings
    newAsset.showBalance = sourceAsset.showBalance;
    newAsset.showContributions = sourceAsset.showContributions;
    newAsset.showNetGain = sourceAsset.showNetGain;
    newAsset.showNominal = sourceAsset.showNominal;
    newAsset.showReal = sourceAsset.showReal;
    
    this.assets.set(newAsset.id, newAsset);
    this.activeTabId = newAsset.id;
    this.hasUnsavedChanges = true;
    
    return newAsset.id;
  }
  
  // Computed values
  get enabledAssets(): Asset[] {
    return Array.from(this.assets.values()).filter(asset => asset.enabled);
  }
  
  get assetsList(): Asset[] {
    return Array.from(this.assets.values());
  }
  
  get hasAssets(): boolean {
    return this.assets.size > 0;
  }
  
  get activeAsset(): Asset | null {
    return this.assets.get(this.activeTabId) || null;
  }
  
  get combinedResults(): CombinedResult[] {
    const enabledAssets = this.enabledAssets;
    if (enabledAssets.length === 0) return [];
    
    // Find the maximum number of years across all assets
    const maxYears = Math.max(...enabledAssets.map(asset => asset.results.length));
    
    const combinedResults: CombinedResult[] = [];
    
    for (let year = 1; year <= maxYears; year++) {
      let totalBalance = 0;
      let totalRealBalance = 0;
      let totalAnnualContribution = 0;
      let totalRealAnnualContribution = 0;
      let totalEarnings = 0;
      let totalRealEarnings = 0;
      let totalYearlyGain = 0;
      let totalRealYearlyGain = 0;
      const assetBreakdown: CombinedResult['assetBreakdown'] = [];
      
      for (const asset of enabledAssets) {
        const result = asset.results[year - 1];
        if (result) {
          totalBalance += result.balance;
          totalRealBalance += result.realBalance;
          totalAnnualContribution += result.annualContribution;
          totalRealAnnualContribution += result.realAnnualContribution;
          totalEarnings += result.totalEarnings;
          totalRealEarnings += result.realTotalEarnings;
          totalYearlyGain += result.yearlyGain;
          totalRealYearlyGain += result.realYearlyGain;
          
          assetBreakdown.push({
            assetId: asset.id,
            assetName: asset.name,
            balance: result.balance,
            realBalance: result.realBalance,
            contribution: result.annualContribution,
            realContribution: result.realAnnualContribution
          });
        }
      }
      
      combinedResults.push({
        year,
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalRealBalance: Math.round(totalRealBalance * 100) / 100,
        totalAnnualContribution: Math.round(totalAnnualContribution * 100) / 100,
        totalRealAnnualContribution: Math.round(totalRealAnnualContribution * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalRealEarnings: Math.round(totalRealEarnings * 100) / 100,
        totalYearlyGain: Math.round(totalYearlyGain * 100) / 100,
        totalRealYearlyGain: Math.round(totalRealYearlyGain * 100) / 100,
        assetBreakdown
      });
    }
    
    return combinedResults;
  }
  
  // Mark changes
  markAsChanged = () => {
    this.hasUnsavedChanges = true;
  }
  
  // Persistence
  saveToLocalStorage = () => {
    const data = {
      assets: Array.from(this.assets.values()).map(asset => asset.toJSON()),
      activeTabId: this.activeTabId
    };
    localStorage.setItem('portfolioData', JSON.stringify(data));
    this.hasUnsavedChanges = false;
  }
  
  loadFromLocalStorage = () => {
    const dataStr = localStorage.getItem('portfolioData');
    if (!dataStr) return;
    
    try {
      const data = JSON.parse(dataStr);
      
      // Clear existing assets
      this.assets.clear();
      
      // Load assets
      if (data.assets && Array.isArray(data.assets)) {
        for (const assetData of data.assets) {
          const asset = Asset.fromJSON(assetData);
          this.assets.set(asset.id, asset);
        }
      }
      
      // Set active tab
      if (data.activeTabId) {
        // Check if the active tab still exists
        if (data.activeTabId === 'combined' || this.assets.has(data.activeTabId)) {
          this.activeTabId = data.activeTabId;
        } else {
          // Default to first asset or combined
          const firstAsset = this.assetsList[0];
          this.activeTabId = firstAsset ? firstAsset.id : 'combined';
        }
      }
    } catch (error) {
      console.error('Failed to load portfolio data from localStorage:', error);
    }
  }
  
  clearAll = () => {
    this.assets.clear();
    this.activeTabId = 'combined';
    localStorage.removeItem('portfolioData');
    
    // Add a default asset
    this.addAsset('Asset 1');
  }
}