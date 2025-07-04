import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { type BaseAsset, type BaseCalculationResult } from './BaseAsset';

export interface InvestmentInputs {
  initialAmount: string;
  years: string;
  rateOfReturn: string;
  inflationRate: string;
  annualContribution: string;
}

export interface InvestmentResult extends BaseCalculationResult {
  annualContribution: number;
  realAnnualContribution: number;
  totalEarnings: number;
  realTotalEarnings: number;
  yearlyGain: number;
  realYearlyGain: number;
}

export class Investment implements BaseAsset {
  id: string;
  name: string;
  enabled: boolean;
  inputs: InvestmentInputs;
  results: InvestmentResult[] = [];

  // Investment-specific settings
  inflationAdjustedContributions = false;

  // UI state
  showBalance = true;
  showContributions = true;
  showNetGain = true;
  showNominal = true;
  showReal = true;

  constructor(name: string = 'New Investment', initialInputs?: Partial<InvestmentInputs>) {
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

  setInflationAdjustedContributions = (value: boolean) => {
    this.inflationAdjustedContributions = value;
    this.calculateProjection();
  }

  updateInput = <K extends keyof InvestmentInputs>(key: K, value: InvestmentInputs[K]) => {
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

  calculateProjection = (startingYear?: number) => {
    const projections: InvestmentResult[] = [];
    const initialAmountNum = parseFloat(this.inputs.initialAmount) || 0;
    const yearsNum = parseInt(this.inputs.years) || 1;
    const rateOfReturnNum = parseFloat(this.inputs.rateOfReturn) || 0;
    const inflationRateNum = parseFloat(this.inputs.inflationRate) || 0;
    const annualContributionNum = parseFloat(this.inputs.annualContribution) || 0;
    const baseYear = startingYear || new Date().getFullYear();

    let balance = initialAmountNum;
    let totalContributed = 0; // Only track ongoing contributions (not initial amount)
    let totalWithdrawn = 0; // Track total money withdrawn

    // Add year 0
    projections.push({
      year: 0,
      actualYear: baseYear,
      balance: Math.round(balance * 100) / 100,
      realBalance: Math.round(balance * 100) / 100,
      annualContribution: 0,
      realAnnualContribution: 0,
      totalEarnings: 0,
      realTotalEarnings: 0,
      yearlyGain: 0,
      realYearlyGain: 0
    });

    for (let year = 1; year <= yearsNum; year++) {
      const previousBalance = balance;

      // Calculate contribution for this year
      let yearContribution = annualContributionNum;
      if (this.inflationAdjustedContributions) {
        // When inflation-adjusted, the nominal contribution increases each year
        // to maintain the same real purchasing power
        yearContribution = annualContributionNum * Math.pow(1 + inflationRateNum / 100, year);
      }

      balance = balance * (1 + rateOfReturnNum / 100) + yearContribution;

      // Track contributions vs withdrawals separately (not including initial amount)
      if (yearContribution > 0) {
        totalContributed += yearContribution;
      } else {
        totalWithdrawn += Math.abs(yearContribution);
      }

      // Calculate earnings: balance - initial investment - net contributions
      const netContributions = totalContributed - totalWithdrawn;
      const totalEarnings = balance - initialAmountNum - netContributions;
      const yearlyGain = balance - previousBalance - yearContribution;

      // Calculate real values (adjusted for inflation)
      const inflationFactor = Math.pow(1 + inflationRateNum / 100, year);
      const realBalance = balance / inflationFactor;
      const realTotalEarnings = totalEarnings / inflationFactor;

      // For real annual contribution, when inflation adjustment is enabled,
      // we want to show the constant real purchasing power
      let realAnnualContribution;
      if (this.inflationAdjustedContributions) {
        // When inflation-adjusted, the real contribution stays constant at the entered amount
        realAnnualContribution = annualContributionNum;
      } else {
        // When not inflation-adjusted, show the declining real value
        realAnnualContribution = yearContribution / inflationFactor;
      }

      const realYearlyGain = yearlyGain / inflationFactor;

      projections.push({
        year,
        actualYear: baseYear + year,
        balance: Math.round(balance * 100) / 100,
        realBalance: Math.round(realBalance * 100) / 100,
        annualContribution: Math.round(yearContribution * 100) / 100,
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
  get type() {
    return 'investment' as const;
  }

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
      type: 'investment' as const,
      enabled: this.enabled,
      inputs: this.inputs,
      inflationAdjustedContributions: this.inflationAdjustedContributions,
      showBalance: this.showBalance,
      showContributions: this.showContributions,
      showNetGain: this.showNetGain,
      showNominal: this.showNominal,
      showReal: this.showReal
    };
  }

  static fromJSON(data: ReturnType<Investment['toJSON']>): Investment {
    const investment = new Investment(data.name, data.inputs);
    investment.id = data.id;
    investment.enabled = data.enabled;
    investment.inflationAdjustedContributions = data.inflationAdjustedContributions ?? false;
    investment.showBalance = data.showBalance ?? true;
    investment.showContributions = data.showContributions ?? true;
    investment.showNetGain = data.showNetGain ?? true;
    investment.showNominal = data.showNominal ?? true;
    investment.showReal = data.showReal ?? true;
    return investment;
  }
}