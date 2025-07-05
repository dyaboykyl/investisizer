import { computed, makeAutoObservable } from 'mobx';
import { type Asset, createAsset, createAssetFromJSON, isInvestment, isProperty } from './AssetFactory';
import { Investment, type InvestmentResult } from './Investment';
import { Property, type PropertyResult } from './Property';

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
      this.addInvestment('Asset 1');
      // Reset to combined tab after creating default asset
      this.activeTabId = 'combined';
      this.hasUnsavedChanges = false;
    }
  }

  // Actions - Type-safe asset creation methods
  addInvestment = (name?: string, inputs?: Partial<Investment['inputs']>) => {
    const assetCount = this.assets.size + 1;
    const defaultName = name || `Asset ${assetCount}`;
    
    const asset = createAsset('investment', defaultName, {
      years: this.years,
      inflationRate: this.inflationRate,
      ...inputs
    });
    
    // Inject portfolio store context
    asset.portfolioStore = this;
    this.assets.set(asset.id, asset);
    this.activeTabId = asset.id;
    this.hasUnsavedChanges = true;
    return asset.id;
  }

  addProperty = (name?: string, inputs?: Partial<Property['inputs']>) => {
    const assetCount = this.assets.size + 1;
    const defaultName = name || `Property ${assetCount}`;
    
    const asset = createAsset('property', defaultName, {
      years: this.years,
      inflationRate: this.inflationRate,
      ...inputs
    });
    
    // Inject portfolio store context
    asset.portfolioStore = this;
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

    let newAsset: Asset;
    
    if (isInvestment(sourceAsset)) {
      newAsset = createAsset('investment', `${sourceAsset.name} (copy)`, {
        ...sourceAsset.inputs,
        years: this.years,
        inflationRate: this.inflationRate
      });
      // Copy investment-specific settings
      newAsset.inflationAdjustedContributions = sourceAsset.inflationAdjustedContributions;
    } else if (isProperty(sourceAsset)) {
      newAsset = createAsset('property', `${sourceAsset.name} (copy)`, {
        ...sourceAsset.inputs,
        years: this.years,
        inflationRate: this.inflationRate
      });
    } else {
      return; // Unknown asset type
    }

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
    return this.enabledAssets.reduce((total, asset) => {
      if (isInvestment(asset)) {
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
      } else if (isProperty(asset)) {
        // For properties, count monthly payments as contributions
        const monthlyPayment = parseFloat(asset.inputs.monthlyPayment) || asset.calculatedPrincipalInterestPayment;
        const years = parseInt(this.years) || 0;
        return total + (monthlyPayment * 12 * years);
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
    return this.enabledAssets.reduce((total, asset) => {
      if (isInvestment(asset)) {
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
      } else if (isProperty(asset)) {
        // For properties, count monthly payments as contributions
        const monthlyPayment = parseFloat(asset.inputs.monthlyPayment) || asset.calculatedPrincipalInterestPayment;
        const years = parseInt(this.years) || 0;
        return total + (monthlyPayment * 12 * years);
      }
      return total;
    }, 0);
  }

  get totalWithdrawn(): number {
    return this.enabledAssets.reduce((total, asset) => {
      if (isInvestment(asset)) {
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

  // Calculate annual property payment withdrawals for a given investment
  getLinkedPropertyWithdrawals(investmentId: string): number[] {
    const years = parseInt(this.years) || 1;
    const withdrawals: number[] = [];
    
    // Find all properties linked to this investment
    const linkedProperties = this.properties.filter(
      property => property.enabled && property.inputs.linkedInvestmentId === investmentId
    );
    
    // Calculate total annual withdrawals for each year
    for (let year = 1; year <= years; year++) {
      let totalAnnualWithdrawal = 0;
      
      for (const property of linkedProperties) {
        const monthlyPayment = parseFloat(property.inputs.monthlyPayment) || property.calculatedPrincipalInterestPayment;
        const annualPayment = monthlyPayment * 12;
        totalAnnualWithdrawal += annualPayment;
      }
      
      withdrawals.push(totalAnnualWithdrawal);
    }
    
    return withdrawals;
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
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalRealBalance: Math.round(totalRealBalance * 100) / 100,
        totalAnnualContribution: Math.round(totalAnnualContribution * 100) / 100,
        totalRealAnnualContribution: Math.round(totalRealAnnualContribution * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalRealEarnings: Math.round(totalRealEarnings * 100) / 100,
        totalYearlyGain: Math.round(totalYearlyGain * 100) / 100,
        totalRealYearlyGain: Math.round(totalRealYearlyGain * 100) / 100,
        
        // Property-specific totals
        totalPropertyValue: Math.round(totalPropertyValue * 100) / 100,
        totalRealPropertyValue: Math.round(totalRealPropertyValue * 100) / 100,
        totalMortgageBalance: Math.round(totalMortgageBalance * 100) / 100,
        totalPropertyEquity: Math.round(totalPropertyEquity * 100) / 100,
        totalRealPropertyEquity: Math.round(totalRealPropertyEquity * 100) / 100,
        totalInvestmentBalance: Math.round(totalInvestmentBalance * 100) / 100,
        totalRealInvestmentBalance: Math.round(totalRealInvestmentBalance * 100) / 100,
        
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
    // Update all assets - results will automatically recompute
    this.assets.forEach(asset => {
      if (asset.type === 'investment') {
        (asset as Investment).updateInput('years', this.years);
      } else if (asset.type === 'property') {
        (asset as Property).updateInput('years', this.years);
      }
    });
  }

  setInflationRate = (value: string) => {
    this.inflationRate = value;
    this.hasUnsavedChanges = true;
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
    this.hasUnsavedChanges = true;
    // Results will automatically recompute when startingYear changes
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
    this.addInvestment('Asset 1');
    // Reset to combined tab after creating default asset
    this.activeTabId = 'combined';
    this.hasUnsavedChanges = false;
  }

  undoChanges = () => {
    // Reload from localStorage to undo unsaved changes
    this.loadFromLocalStorage();

    // If nothing in localStorage, reset to default state
    if (this.assets.size === 0) {
      this.addInvestment('Asset 1');
      this.activeTabId = 'combined';
    }

    this.hasUnsavedChanges = false;
  }
}