import { computed, makeAutoObservable } from 'mobx';
import { Asset, type AssetType } from './Asset';

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

  // Shared inputs across all assets
  years: string = '10';
  inflationRate: string = '2.5';
  startingYear: string = new Date().getFullYear().toString();

  // Global display settings
  showNominal: boolean = true;
  showReal: boolean = true;

  constructor() {
    makeAutoObservable(this, {
      enabledAssets: computed,
      combinedResults: computed,
      assetsList: computed,
      hasAssets: computed,
      activeAsset: computed,
      totalContributions: computed,
      totalInitialInvestment: computed,
      totalContributed: computed,
      totalWithdrawn: computed,
      netContributions: computed,
      totalReturnPercentage: computed
    });

    // Load from localStorage on initialization
    this.loadFromLocalStorage();

    // If no assets exist, create a default one
    if (this.assets.size === 0) {
      this.addAsset('Asset 1');
      // Reset to combined tab after creating default asset
      this.activeTabId = 'combined';
      this.hasUnsavedChanges = false;
    }
  }

  // Actions
  addAsset = (name?: string, type: AssetType = 'investment') => {
    console.log('Adding asset:', name, type);
    const assetCount = this.assets.size + 1;
    const defaultName = type === 'property' ? `Property ${assetCount}` : `Asset ${assetCount}`;
    const asset = new Asset(name || defaultName, type, {
      years: this.years,
      inflationRate: this.inflationRate
    });
    asset.calculateProjection(parseInt(this.startingYear));
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
      sourceAsset.type,
      {
        ...sourceAsset.inputs,
        years: this.years,
        inflationRate: this.inflationRate
      }
    );

    // Copy asset settings
    newAsset.inflationAdjustedContributions = sourceAsset.inflationAdjustedContributions;

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
    return Array.from(this.assets.values()).filter(asset => asset.enabled && asset.type === 'investment');
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

  get totalContributions(): number {
    return this.enabledAssets.reduce((total, asset) => {
      const annualContribution = parseFloat(asset.inputs.annualContribution) || 0;
      const years = parseInt(this.years) || 0;
      const inflationRate = parseFloat(asset.inputs.inflationRate) || 0;

      // Only count positive contributions
      if (annualContribution <= 0) return total;

      if (asset.inflationAdjustedContributions && years > 0) {
        // Calculate sum of inflation-adjusted contributions
        let contributionSum = 0;
        for (let year = 1; year <= years; year++) {
          contributionSum += annualContribution * Math.pow(1 + inflationRate / 100, year);
        }
        return total + contributionSum;
      } else {
        return total + (annualContribution * years);
      }
    }, 0);
  }

  get totalInitialInvestment(): number {
    return this.enabledAssets.reduce((total, asset) => {
      const initialAmount = parseFloat(asset.inputs.initialAmount) || 0;
      return total + initialAmount;
    }, 0);
  }

  get totalContributed(): number {
    return this.enabledAssets.reduce((total, asset) => {
      const annualContribution = parseFloat(asset.inputs.annualContribution) || 0;
      const years = parseInt(this.years) || 0;
      const inflationRate = parseFloat(asset.inputs.inflationRate) || 0;

      if (annualContribution <= 0) return total; // No contributions, only withdrawals

      if (asset.inflationAdjustedContributions && years > 0) {
        // Calculate sum of inflation-adjusted contributions
        let contributionSum = 0;
        for (let year = 1; year <= years; year++) {
          contributionSum += annualContribution * Math.pow(1 + inflationRate / 100, year);
        }
        return total + contributionSum;
      } else {
        return total + (annualContribution * years);
      }
    }, 0);
  }

  get totalWithdrawn(): number {
    return this.enabledAssets.reduce((total, asset) => {
      const annualContribution = parseFloat(asset.inputs.annualContribution) || 0;
      const years = parseInt(this.years) || 0;
      const inflationRate = parseFloat(asset.inputs.inflationRate) || 0;

      if (annualContribution >= 0) return total; // No withdrawals, only contributions

      const withdrawalAmount = Math.abs(annualContribution);

      if (asset.inflationAdjustedContributions && years > 0) {
        // Calculate sum of inflation-adjusted withdrawals
        let withdrawalSum = 0;
        for (let year = 1; year <= years; year++) {
          withdrawalSum += withdrawalAmount * Math.pow(1 + inflationRate / 100, year);
        }
        return total + withdrawalSum;
      } else {
        return total + (withdrawalAmount * years);
      }
    }, 0);
  }

  get netContributions(): number {
    return this.totalContributed - this.totalWithdrawn;
  }

  get totalReturnPercentage(): number {
    const finalResult = this.combinedResults[this.combinedResults.length - 1];
    if (!finalResult || this.totalInitialInvestment === 0) return 0;

    return (finalResult.totalEarnings / this.totalInitialInvestment) * 100;
  }

  get combinedResults(): CombinedResult[] {
    const enabledAssets = this.enabledAssets;
    if (enabledAssets.length === 0) return [];

    // Find the maximum number of years across all assets (including year 0)
    const maxYears = Math.max(...enabledAssets.map(asset => asset.results.length - 1));

    const combinedResults: CombinedResult[] = [];

    for (let year = 0; year <= maxYears; year++) {
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
        const result = asset.results[year];
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

  // Shared input setters
  setYears = (value: string) => {
    // Ensure years is at least 1
    const numValue = parseInt(value) || 0;
    if (numValue < 1) {
      this.years = '1';
    } else {
      this.years = value;
    }
    this.hasUnsavedChanges = true;
    // Update all assets
    this.assets.forEach(asset => {
      asset.updateInput('years', this.years);
      asset.calculateProjection(parseInt(this.startingYear));
    });
  }

  setInflationRate = (value: string) => {
    this.inflationRate = value;
    this.hasUnsavedChanges = true;
    // Update all assets
    this.assets.forEach(asset => {
      asset.updateInput('inflationRate', value);
    });
  }

  setStartingYear = (value: string) => {
    this.startingYear = value;
    this.hasUnsavedChanges = true;
    // Recalculate all assets with new starting year
    this.assets.forEach(asset => {
      asset.calculateProjection(parseInt(this.startingYear));
    });
  }

  // Display settings
  setShowNominal = (value: boolean) => {
    // If trying to deselect nominal when real is also off, toggle to real instead
    if (!value && !this.showReal) {
      this.showReal = true;
    }
    this.showNominal = value;
    // Auto-save display changes
    this.saveToLocalStorage();
  }

  setShowReal = (value: boolean) => {
    // If trying to deselect real when nominal is also off, toggle to nominal instead
    if (!value && !this.showNominal) {
      this.showNominal = true;
    }
    this.showReal = value;
    // Auto-save display changes
    this.saveToLocalStorage();
  }

  // Persistence
  saveToLocalStorage = () => {
    const data = {
      assets: Array.from(this.assets.values()).map(asset => asset.toJSON()),
      activeTabId: this.activeTabId,
      years: this.years,
      inflationRate: this.inflationRate,
      startingYear: this.startingYear,
      showNominal: this.showNominal,
      showReal: this.showReal
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
          asset.calculateProjection(parseInt(data.startingYear || this.startingYear));
          this.assets.set(asset.id, asset);
        }
      }

      // Load shared values
      if (data.years) {
        // Validate years is at least 1
        const years = parseInt(data.years) || 0;
        this.years = years < 1 ? '1' : data.years;
      }
      if (data.inflationRate) this.inflationRate = data.inflationRate;
      if (data.startingYear) this.startingYear = data.startingYear;
      if (data.showNominal !== undefined) this.showNominal = data.showNominal;
      if (data.showReal !== undefined) this.showReal = data.showReal;

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
    // Reset to combined tab after creating default asset
    this.activeTabId = 'combined';
    this.hasUnsavedChanges = false;
  }

  undoChanges = () => {
    // Reload from localStorage to undo unsaved changes
    this.loadFromLocalStorage();

    // If nothing in localStorage, reset to default state
    if (this.assets.size === 0) {
      this.addAsset('Asset 1');
      this.activeTabId = 'combined';
    }

    this.hasUnsavedChanges = false;
  }
}