import { makeAutoObservable } from 'mobx';

export interface CalculationResult {
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

export class InvestmentStore {
  // Input parameters
  initialAmount = '10000';
  years = '10';
  rateOfReturn = '7';
  inflationRate = '2.5';
  annualContribution = '5000';
  
  // Calculation results
  results: CalculationResult[] = [];
  
  // UI state
  showBalance = true;
  showContributions = true;
  showNetGain = true;
  showNominal = true;
  showReal = true;

  constructor() {
    makeAutoObservable(this);
  }

  // Actions
  setInitialAmount(value: string) {
    this.initialAmount = value;
  }

  setYears(value: string) {
    this.years = value;
  }

  setRateOfReturn(value: string) {
    this.rateOfReturn = value;
  }

  setInflationRate(value: string) {
    this.inflationRate = value;
  }

  setAnnualContribution(value: string) {
    this.annualContribution = value;
  }

  setShowBalance(value: boolean) {
    this.showBalance = value;
  }

  setShowContributions(value: boolean) {
    this.showContributions = value;
  }

  setShowNetGain(value: boolean) {
    this.showNetGain = value;
  }

  setShowNominal(value: boolean) {
    this.showNominal = value;
  }

  setShowReal(value: boolean) {
    this.showReal = value;
  }

  calculateProjection() {
    const projections: CalculationResult[] = [];
    const initialAmountNum = parseFloat(this.initialAmount) || 0;
    const yearsNum = parseInt(this.years) || 1;
    const rateOfReturnNum = parseFloat(this.rateOfReturn) || 0;
    const inflationRateNum = parseFloat(this.inflationRate) || 0;
    const annualContributionNum = parseFloat(this.annualContribution) || 0;
    
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
    return parseFloat(this.annualContribution) || 0;
  }
}

export const investmentStore = new InvestmentStore();