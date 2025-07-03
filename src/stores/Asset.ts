import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';

export interface AssetInputs {
  initialAmount: string;
  years: string;
  rateOfReturn: string;
  inflationRate: string;
  annualContribution: string;
}

export interface AssetCalculationResult {
  year: number;
  balance: number;
  realBalance: number;
  annualContribution: number;
  realAnnualContribution: number;
  totalEarnings: number;
  realTotalEarnings: number;
  yearlyGain: number;
  realYearlyGain: number;
}

export class Asset {
  id: string;
  name: string;
  enabled: boolean;
  inputs: AssetInputs;
  results: AssetCalculationResult[] = [];
  
  // UI state
  showBalance = true;
  showContributions = true;
  showNetGain = true;
  showNominal = true;
  showReal = true;

  constructor(name: string = 'New Asset', initialInputs?: Partial<AssetInputs>) {
    this.id = uuidv4();
    this.name = name;
    this.enabled = true;
    
    // Default inputs
    this.inputs = {
      initialAmount: '10000',
      years: '10',
      rateOfReturn: '7',
      inflationRate: '2.5',
      annualContribution: '5000',
      ...initialInputs
    };
    
    makeAutoObservable(this);
    
    // Calculate initial projection
    this.calculateProjection();
  }

  // Actions
  setName = (name: string) => {
    this.name = name;
  }

  setEnabled = (enabled: boolean) => {
    this.enabled = enabled;
  }

  updateInput = <K extends keyof AssetInputs>(key: K, value: AssetInputs[K]) => {
    this.inputs[key] = value;
    this.calculateProjection();
  }

  setShowBalance = (value: boolean) => {
    this.showBalance = value;
  }

  setShowContributions = (value: boolean) => {
    this.showContributions = value;
  }

  setShowNetGain = (value: boolean) => {
    this.showNetGain = value;
  }

  setShowNominal = (value: boolean) => {
    this.showNominal = value;
  }

  setShowReal = (value: boolean) => {
    this.showReal = value;
  }

  calculateProjection = () => {
    const projections: AssetCalculationResult[] = [];
    const initialAmountNum = parseFloat(this.inputs.initialAmount) || 0;
    const yearsNum = parseInt(this.inputs.years) || 1;
    const rateOfReturnNum = parseFloat(this.inputs.rateOfReturn) || 0;
    const inflationRateNum = parseFloat(this.inputs.inflationRate) || 0;
    const annualContributionNum = parseFloat(this.inputs.annualContribution) || 0;
    
    let balance = initialAmountNum;
    let totalContributions = initialAmountNum;
    
    for (let year = 1; year <= yearsNum; year++) {
      const previousBalance = balance;
      balance = balance * (1 + rateOfReturnNum / 100) + annualContributionNum;
      totalContributions += annualContributionNum;
      const totalEarnings = balance - totalContributions;
      const yearlyGain = balance - previousBalance - annualContributionNum;
      
      // Calculate real values (adjusted for inflation)
      const inflationFactor = Math.pow(1 + inflationRateNum / 100, year);
      const realBalance = balance / inflationFactor;
      const realTotalEarnings = totalEarnings / inflationFactor;
      const realAnnualContribution = annualContributionNum / inflationFactor;
      const realYearlyGain = yearlyGain / inflationFactor;
      
      projections.push({
        year,
        balance: Math.round(balance * 100) / 100,
        realBalance: Math.round(realBalance * 100) / 100,
        annualContribution: annualContributionNum,
        realAnnualContribution: Math.round(realAnnualContribution * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        realTotalEarnings: Math.round(realTotalEarnings * 100) / 100,
        yearlyGain: Math.round(yearlyGain * 100) / 100,
        realYearlyGain: Math.round(realYearlyGain * 100) / 100
      });
    }
    
    this.results = projections;
  }

  // Computed values
  get hasResults() {
    return this.results.length > 0;
  }

  get finalResult() {
    return this.results[this.results.length - 1] || null;
  }

  get annualContributionNumber() {
    return parseFloat(this.inputs.annualContribution) || 0;
  }
  
  // Serialization for localStorage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      enabled: this.enabled,
      inputs: this.inputs,
      showBalance: this.showBalance,
      showContributions: this.showContributions,
      showNetGain: this.showNetGain,
      showNominal: this.showNominal,
      showReal: this.showReal
    };
  }
  
  static fromJSON(data: ReturnType<Asset['toJSON']>): Asset {
    const asset = new Asset(data.name, data.inputs);
    asset.id = data.id;
    asset.enabled = data.enabled;
    asset.showBalance = data.showBalance ?? true;
    asset.showContributions = data.showContributions ?? true;
    asset.showNetGain = data.showNetGain ?? true;
    asset.showNominal = data.showNominal ?? true;
    asset.showReal = data.showReal ?? true;
    return asset;
  }
}