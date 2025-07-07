import { computed, makeAutoObservable } from 'mobx';
import { type Asset, createAsset, createAssetFromJSON, isInvestment, isProperty } from '@/features/portfolio/factories/AssetFactory';
import { Investment, type InvestmentResult } from '@/features/investment/stores/Investment';
import { Property, type PropertyResult } from '@/features/property/stores/Property';
import type { RootStore } from '@/features/core/stores/RootStore';

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

  // Property-specific totals
  totalPropertyValue: number;
  totalRealPropertyValue: number;
  totalMortgageBalance: number;
  totalPropertyEquity: number;
  totalRealPropertyEquity: number;
  totalInvestmentBalance: number;
  totalRealInvestmentBalance: number;

  assetBreakdown: {
    assetId: string;
    assetName: string;
    assetType: 'investment' | 'property';
    balance: number;
    realBalance: number;
    contribution: number;
    realContribution: number;

    // Property-specific fields
    propertyValue?: number;
    realPropertyValue?: number;
    mortgageBalance?: number;
    monthlyPayment?: number;
    principalInterestPayment?: number;
    otherFeesPayment?: number;
  }[];
}

export class PortfolioStore {
  assets: Map<string, Asset> = new Map();
  activeTabId: string = 'combined';
  private savedPortfolioData: string | null = null;

  // Shared inputs across all assets
  years: string = '10';
  inflationRate: string = '2.5';
  startingYear: string = new Date().getFullYear().toString();

  // Global display settings
  showNominal: boolean = true;
  showReal: boolean = true;

  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
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
      totalReturnPercentage: computed,
      hasUnsavedChanges: computed,
      currentPortfolioData: computed,
      serializedData: computed
    });

    // Initialize synchronously for tests, but set up async loading for production
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
      // Production: async loading
      this.initializeFromStorage();
    } else {
      // Tests: synchronous loading for backward compatibility
      this.loadFromStorageSync();
      this.loadDisplaySettingsSync();
    }

    // Store initial state as "saved" state
    this.savedPortfolioData = this.currentPortfolioData;

    // If no assets exist, create a default one
    if (this.assets.size === 0) {
      this.addInvestment('Asset 1');
      // Reset to combined tab after creating default asset
      this.activeTabId = 'combined';
      // Update saved state to reflect the default asset
      this.savedPortfolioData = this.currentPortfolioData;
    }
  }

  // Helper methods for common calculations
  private parseFloatSafe(value: string | undefined): number {
    return parseFloat(value || '0') || 0;
  }

  private parseIntSafe(value: string | undefined): number {
    return parseInt(value || '0') || 0;
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private calculateInflationAdjustedContribution(
    annualContribution: number,
    inflationRate: number,
    years: number,
    useInflationAdjustment: boolean
  ): number {
    if (useInflationAdjustment && years > 0) {
      let contributionSum = 0;
      for (let year = 1; year <= years; year++) {
        contributionSum += annualContribution * Math.pow(1 + inflationRate / 100, year);
      }
      return contributionSum;
    } else {
      return annualContribution * years;
    }
  }

  private calculateInvestmentContribution(asset: Investment, years: number, isWithdrawal = false): number {
    const annualContribution = this.parseFloatSafe(asset.inputs.annualContribution);
    const inflationRate = this.parseFloatSafe(asset.inputs.inflationRate);

    // Handle contributions vs withdrawals
    if (isWithdrawal) {
      if (annualContribution >= 0) return 0; // No withdrawals, only contributions
      const withdrawalAmount = Math.abs(annualContribution);
      return this.calculateInflationAdjustedContribution(
        withdrawalAmount,
        inflationRate,
        years,
        asset.inflationAdjustedContributions
      );
    } else {
      if (annualContribution <= 0) return 0; // Only count positive contributions
      return this.calculateInflationAdjustedContribution(
        annualContribution,
        inflationRate,
        years,
        asset.inflationAdjustedContributions
      );
    }
  }

  private calculatePropertyContribution(asset: Property, years: number): number {
    const monthlyPayment = this.parseFloatSafe(asset.inputs.monthlyPayment) || asset.calculatedPrincipalInterestPayment;
    return monthlyPayment * 12 * years;
  }

  // Helper method for asset creation - overloaded for type safety
  private createAssetWithDefaults(type: 'investment', name?: string, inputs?: Partial<Investment['inputs']>): string;
  private createAssetWithDefaults(type: 'property', name?: string, inputs?: Partial<Property['inputs']>): string;
  private createAssetWithDefaults(type: 'investment' | 'property', name?: string, inputs?: any): string {
    const assetCount = this.assets.size + 1;
    const defaultName = name || `${type === 'investment' ? 'Asset' : 'Property'} ${assetCount}`;

    let asset: Asset;
    if (type === 'investment') {
      asset = createAsset('investment', defaultName, {
        inflationRate: this.inflationRate,
        ...inputs
      });
    } else {
      asset = createAsset('property', defaultName, {
        inflationRate: this.inflationRate,
        ...inputs
      });
    }

    // Inject portfolio store context
    asset.portfolioStore = this;
    this.assets.set(asset.id, asset);
    this.activeTabId = asset.id;
    return asset.id;
  }

  // Actions - Type-safe asset creation methods
  addInvestment = (name?: string, inputs?: Partial<Investment['inputs']>) => {
    return this.createAssetWithDefaults('investment', name, inputs);
  }

  addProperty = (name?: string, inputs?: Partial<Property['inputs']>) => {
    return this.createAssetWithDefaults('property', name, inputs);
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


  }

  updateAsset = (id: string, updates: Partial<Asset>) => {
    const asset = this.assets.get(id);
    if (!asset) return;

    Object.assign(asset, updates);

  }

  setActiveTab = (id: string) => {
    this.activeTabId = id;
  }

  duplicateAsset = (id: string) => {
    const sourceAsset = this.assets.get(id);
    if (!sourceAsset) return;

    let newAsset: Asset;

    if (isInvestment(sourceAsset)) {
      newAsset = createAsset('investment', `${sourceAsset.name} (copy)`, {
        ...sourceAsset.inputs,
        inflationRate: this.inflationRate
      });
      // Copy investment-specific settings
      newAsset.inflationAdjustedContributions = sourceAsset.inflationAdjustedContributions;
    } else if (isProperty(sourceAsset)) {
      newAsset = createAsset('property', `${sourceAsset.name} (copy)`, {
        ...sourceAsset.inputs,
        inflationRate: this.inflationRate
      });
    } else {
      return; // Unknown asset type
    }

    // Copy display settings
    newAsset.showBalance = sourceAsset.showBalance;
    newAsset.showContributions = sourceAsset.showContributions;
    newAsset.showNetGain = sourceAsset.showNetGain;

    this.assets.set(newAsset.id, newAsset);
    this.activeTabId = newAsset.id;


    return newAsset.id;
  }

  // Computed values
  get enabledAssets(): Asset[] {
    return Array.from(this.assets.values()).filter(asset => asset.enabled);
  }

  // Type-safe getters
  get investments(): Investment[] {
    return Array.from(this.assets.values()).filter(isInvestment);
  }

  get properties(): Property[] {
    return Array.from(this.assets.values()).filter(isProperty);
  }

  get enabledInvestments(): Investment[] {
    return this.investments.filter(asset => asset.enabled);
  }

  get enabledProperties(): Property[] {
    return this.properties.filter(asset => asset.enabled);
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
    const years = this.parseIntSafe(this.years);
    return this.enabledAssets.reduce((total, asset) => {
      if (isInvestment(asset)) {
        return total + this.calculateInvestmentContribution(asset, years);
      } else if (isProperty(asset)) {
        return total + this.calculatePropertyContribution(asset, years);
      }
      return total;
    }, 0);
  }

  get totalInitialInvestment(): number {
    return this.enabledAssets.reduce((total, asset) => {
      if (isInvestment(asset)) {
        const initialAmount = parseFloat(asset.inputs.initialAmount) || 0;
        return total + initialAmount;
      } else if (isProperty(asset)) {
        // For properties, count down payment as initial investment
        const purchasePrice = parseFloat(asset.inputs.purchasePrice) || 0;
        const downPaymentPercentage = parseFloat(asset.inputs.downPaymentPercentage) || 0;
        const downPayment = purchasePrice * (downPaymentPercentage / 100);
        return total + downPayment;
      }
      return total;
    }, 0);
  }

  get totalContributed(): number {
    const years = this.parseIntSafe(this.years);
    return this.enabledAssets.reduce((total, asset) => {
      if (isInvestment(asset)) {
        return total + this.calculateInvestmentContribution(asset, years);
      } else if (isProperty(asset)) {
        return total + this.calculatePropertyContribution(asset, years);
      }
      return total;
    }, 0);
  }

  get totalWithdrawn(): number {
    const years = this.parseIntSafe(this.years);
    return this.enabledAssets.reduce((total, asset) => {
      if (isInvestment(asset)) {
        return total + this.calculateInvestmentContribution(asset, years, true);
      }
      // Properties don't have withdrawals in this context
      return total;
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

  // Generate portfolio data object for serialization
  private getPortfolioDataForSerialization() {
    return {
      assets: Array.from(this.assets.values()).map(asset => asset.toJSON()),
      activeTabId: this.activeTabId,
      years: this.years,
      inflationRate: this.inflationRate,
      startingYear: this.startingYear
    };
  }

  // Current portfolio data as JSON string for comparison
  get currentPortfolioData(): string {
    return JSON.stringify(this.getPortfolioDataForSerialization());
  }

  // Computed property to check if there are unsaved changes
  get hasUnsavedChanges(): boolean {
    return this.savedPortfolioData !== this.currentPortfolioData;
  }

  // Calculate annual property cash flows for a given investment
  getLinkedPropertyCashFlows(investmentId: string): number[] {
    const years = parseInt(this.years) || 1;
    const cashFlows: number[] = [];

    // Find all properties linked to this investment
    const linkedProperties = this.properties.filter(
      property => property.enabled && property.inputs.linkedInvestmentId === investmentId
    );

    // Calculate total annual cash flows for each year
    for (let year = 1; year <= years; year++) {
      let totalAnnualCashFlow = 0;

      for (const property of linkedProperties) {
        // Check if property has results for this year
        const propertyResult = property.results[year];
        if (propertyResult) {
          // Use the annual cash flow from the property result
          // Positive = property contributes to investment
          // Negative = property withdraws from investment
          totalAnnualCashFlow += propertyResult.annualCashFlow;
        }
      }

      // Check for sale proceeds from other properties being reinvested into this investment
      for (const property of this.properties) {
        if (property.enabled &&
          property.inputs.linkedInvestmentId !== investmentId && // Not directly linked
          property.inputs.saleConfig.isPlannedForSale &&
          property.inputs.saleConfig.reinvestProceeds &&
          property.inputs.saleConfig.targetInvestmentId === investmentId) {

          const propertyResult = property.results[year];
          if (propertyResult?.isSaleYear && propertyResult.saleProceeds) {
            totalAnnualCashFlow += propertyResult.saleProceeds;
          }
        }
      }

      cashFlows.push(totalAnnualCashFlow);
    }

    return cashFlows;
  }

  // Note: recalculateLinkedInvestments() method removed - no longer needed
  // Results are now computed properties that automatically update

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

      // Property-specific totals
      let totalPropertyValue = 0;
      let totalRealPropertyValue = 0;
      let totalMortgageBalance = 0;
      let totalInvestmentBalance = 0;
      let totalRealInvestmentBalance = 0;

      const assetBreakdown: CombinedResult['assetBreakdown'] = [];

      for (const asset of enabledAssets) {
        const result = asset.results[year];
        if (result) {
          if (isInvestment(asset)) {
            // For investments: use balance as portfolio value
            const investmentResult = result as InvestmentResult;
            totalBalance += result.balance;
            totalRealBalance += result.realBalance;
            totalInvestmentBalance += result.balance;
            totalRealInvestmentBalance += result.realBalance;
            totalAnnualContribution += investmentResult.annualContribution || 0;
            totalRealAnnualContribution += investmentResult.realAnnualContribution || 0;
            totalEarnings += investmentResult.totalEarnings || 0;
            totalRealEarnings += investmentResult.realTotalEarnings || 0;
            totalYearlyGain += investmentResult.yearlyGain || 0;
            totalRealYearlyGain += investmentResult.realYearlyGain || 0;

            assetBreakdown.push({
              assetId: asset.id,
              assetName: asset.name,
              assetType: 'investment',
              balance: result.balance,
              realBalance: result.realBalance,
              contribution: investmentResult.annualContribution || 0,
              realContribution: investmentResult.realAnnualContribution || 0
            });
          } else if (isProperty(asset)) {
            // For properties: use equity (property value - mortgage balance)
            const propertyResult = result as PropertyResult;
            const propertyValue = propertyResult.balance; // This is the property value
            const mortgageBalance = propertyResult.mortgageBalance || 0;
            const equity = propertyValue - mortgageBalance;

            totalBalance += equity;
            totalRealBalance += result.realBalance - mortgageBalance; // Approximation for real equity
            totalPropertyValue += propertyValue;
            totalRealPropertyValue += result.realBalance;
            totalMortgageBalance += mortgageBalance;

            // Properties don't have traditional contributions/earnings like investments
            // But we can show monthly payments as a form of contribution
            const monthlyPayment = propertyResult.monthlyPayment || 0;
            const annualPayment = monthlyPayment * 12;
            totalAnnualContribution += annualPayment;
            totalRealAnnualContribution += annualPayment; // Simplified - could be inflation adjusted

            assetBreakdown.push({
              assetId: asset.id,
              assetName: asset.name,
              assetType: 'property',
              balance: equity, // Net equity for properties
              realBalance: result.realBalance - mortgageBalance,
              contribution: annualPayment,
              realContribution: annualPayment,
              propertyValue,
              realPropertyValue: result.realBalance,
              mortgageBalance,
              monthlyPayment: propertyResult.monthlyPayment,
              principalInterestPayment: propertyResult.principalInterestPayment,
              otherFeesPayment: propertyResult.otherFeesPayment
            });
          }
        }
      }

      const totalPropertyEquity = totalPropertyValue - totalMortgageBalance;
      const totalRealPropertyEquity = totalRealPropertyValue - totalMortgageBalance;

      combinedResults.push({
        year,
        totalBalance: this.roundToTwoDecimals(totalBalance),
        totalRealBalance: this.roundToTwoDecimals(totalRealBalance),
        totalAnnualContribution: this.roundToTwoDecimals(totalAnnualContribution),
        totalRealAnnualContribution: this.roundToTwoDecimals(totalRealAnnualContribution),
        totalEarnings: this.roundToTwoDecimals(totalEarnings),
        totalRealEarnings: this.roundToTwoDecimals(totalRealEarnings),
        totalYearlyGain: this.roundToTwoDecimals(totalYearlyGain),
        totalRealYearlyGain: this.roundToTwoDecimals(totalRealYearlyGain),

        // Property-specific totals
        totalPropertyValue: this.roundToTwoDecimals(totalPropertyValue),
        totalRealPropertyValue: this.roundToTwoDecimals(totalRealPropertyValue),
        totalMortgageBalance: this.roundToTwoDecimals(totalMortgageBalance),
        totalPropertyEquity: this.roundToTwoDecimals(totalPropertyEquity),
        totalRealPropertyEquity: this.roundToTwoDecimals(totalRealPropertyEquity),
        totalInvestmentBalance: this.roundToTwoDecimals(totalInvestmentBalance),
        totalRealInvestmentBalance: this.roundToTwoDecimals(totalRealInvestmentBalance),

        assetBreakdown
      });
    }

    return combinedResults;
  }

  // Shared input setters
  setYears = (value: string) => {
    // Ensure years is at least 1
    const numValue = this.parseIntSafe(value);
    if (numValue < 1) {
      this.years = '1';
    } else {
      this.years = value;
    }

    // Assets will automatically recompute using the portfolio years
    // No need to update individual asset inputs since they use portfolioStore.years
  }

  setInflationRate = (value: string) => {
    this.inflationRate = value;

    // Update all assets - results will automatically recompute
    this.assets.forEach(asset => {
      if (asset.type === 'investment') {
        (asset as Investment).updateInput('inflationRate', value);
      } else if (asset.type === 'property') {
        (asset as Property).updateInput('inflationRate', value);
      }
    });
  }

  setStartingYear = (value: string) => {
    this.startingYear = value;

    // Results will automatically recompute when startingYear changes
  }

  // Display settings
  setShowNominal = (value: boolean) => {
    // If trying to deselect nominal when real is also off, toggle to real instead
    if (!value && !this.showReal) {
      this.showReal = true;
    }
    this.showNominal = value;
    // Auto-save display settings only
    this.saveDisplaySettingsSync();
  }

  setShowReal = (value: boolean) => {
    // If trying to deselect real when nominal is also off, toggle to nominal instead
    if (!value && !this.showNominal) {
      this.showNominal = true;
    }
    this.showReal = value;
    // Auto-save display settings only
    this.saveDisplaySettingsSync();
  }

  // Helper to create display settings data
  private getDisplaySettingsData() {
    return {
      showNominal: this.showNominal,
      showReal: this.showReal
    };
  }

  // Save display settings
  saveDisplaySettings = async () => {
    await this.rootStore.storageStore.save('portfolioDisplaySettings', this.getDisplaySettingsData());
  }

  // Synchronous save for tests
  saveDisplaySettingsSync = () => {
    this.rootStore.storageStore.saveSync('portfolioDisplaySettings', this.getDisplaySettingsData());
  }

  // Save portfolio data
  save = async () => {
    const data = this.getPortfolioDataForSerialization();
    await this.rootStore.storageStore.save('portfolioData', data);
    
    // Update saved state to current state only after successful save
    this.savedPortfolioData = JSON.stringify(data);
  }

  // Helper to apply display settings data
  private applyDisplaySettings(displayData: any) {
    if (displayData) {
      if (displayData.showNominal !== undefined) this.showNominal = displayData.showNominal;
      if (displayData.showReal !== undefined) this.showReal = displayData.showReal;
    }
  }

  // Load display settings
  loadDisplaySettings = async () => {
    const displayData = await this.rootStore.storageStore.load('portfolioDisplaySettings');
    this.applyDisplaySettings(displayData);
  }

  // Initialize from storage (async, don't block constructor)
  initializeFromStorage = async () => {
    await this.loadDisplaySettings();
    await this.loadFromStorage();
  }

  // Synchronous loading for tests
  loadFromStorageSync = () => {
    const data = this.rootStore.storageStore.loadSync('portfolioData');
    if (data) {
      this.loadPortfolioData(data);
    }
  }

  loadDisplaySettingsSync = () => {
    const displayData = this.rootStore.storageStore.loadSync('portfolioDisplaySettings');
    this.applyDisplaySettings(displayData);
  }

  // Load portfolio data
  loadFromStorage = async () => {
    const data = await this.rootStore.storageStore.load('portfolioData');
    
    if (!data) {
      console.log('No portfolio data found in storage');
      return;
    }

    this.loadPortfolioData(data);
  }

  // Common method to load portfolio data from a parsed object
  private loadPortfolioData = (data: any) => {
    // Clear existing assets
    this.assets.clear();

    // Load assets and inject portfolio store context
    if (data.assets && Array.isArray(data.assets)) {
      for (const assetData of data.assets) {
        const asset = createAssetFromJSON(assetData);
        // Inject portfolio store context for reactive calculations
        asset.portfolioStore = this;
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
    
    // Load display settings if they exist in the data
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
  }

  clearAll = () => {
    this.assets.clear();
    this.activeTabId = 'combined';
    // Clear storage through StorageStore
    this.rootStore.storageStore.clear('portfolioData');
    // Note: Keep display settings when clearing portfolio data

    // Add a default asset
    this.addInvestment('Asset 1');
    // Reset to combined tab after creating default asset
    this.activeTabId = 'combined';
    // Update saved state to reflect the default asset
    this.savedPortfolioData = this.currentPortfolioData;
  }

  undoChanges = () => {
    // For backward compatibility with tests - use synchronous loading
    this.loadFromStorageSync();

    // If no data found, reset to default state
    if (this.assets.size === 0) {
      this.addInvestment('Asset 1');
      this.activeTabId = 'combined';
    }

    // Update saved state to match what was loaded
    this.savedPortfolioData = this.currentPortfolioData;
  }

  // Serialized data for saving
  get serializedData(): string {
    return JSON.stringify({
      assets: Array.from(this.assets.values()).map(asset => asset.toJSON()),
      years: this.years,
      inflationRate: this.inflationRate,
      startingYear: this.startingYear,
      showNominal: this.showNominal,
      showReal: this.showReal
    });
  }

  // Storage state accessors - delegate to StorageStore
  get isSaving(): boolean {
    return this.rootStore.storageStore.isSaving;
  }

  get lastSaveTime(): Date | null {
    return this.rootStore.storageStore.lastSaveTime;
  }

  get saveError(): string | null {
    return this.rootStore.storageStore.saveError;
  }

  // Clear save error
  clearSaveError = () => {
    this.rootStore.storageStore.clearError();
  };

  // Reset storage state (for debugging)
  resetStorageState = () => {
    this.rootStore.storageStore.resetState();
  };

  // Legacy methods for backward compatibility (tests)
  saveToLocalStorage = () => {
    const data = this.getPortfolioDataForSerialization();
    this.rootStore.storageStore.saveSync('portfolioData', data);
    this.savedPortfolioData = JSON.stringify(data);
  };

  // Legacy properties for backward compatibility (tests)
  get lastSyncTime(): Date | null {
    return this.lastSaveTime;
  }

  get syncError(): string | null {
    return this.saveError;
  }

  clearSyncError = () => {
    this.clearSaveError();
  };

  resetSyncState = () => {
    this.resetStorageState();
  };
}