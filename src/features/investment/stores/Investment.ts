import { makeAutoObservable, computed } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { type BaseAsset, type BaseCalculationResult } from '@/features/shared/types/BaseAsset';

export interface InvestmentInputs {
  initialAmount: string;
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
  annualInvestmentGain: number; // Annual investment gain from returns only
  realAnnualInvestmentGain: number; // Real annual investment gain from returns only
  propertyCashFlow: number; // Property cash flow for this year (positive = contribution, negative = withdrawal)
  realPropertyCashFlow: number; // Real property cash flow adjusted for inflation
}

export class Investment implements BaseAsset {
  id: string;
  name: string;
  enabled: boolean;
  inputs: InvestmentInputs;
  portfolioStore?: {
    startingYear?: string;
    years?: string;
    getLinkedPropertyCashFlows?: (id: string) => number[];
  }; // Will be injected by PortfolioStore

  // Investment-specific settings
  inflationAdjustedContributions = false;

  // UI state
  showBalance = true;
  showContributions = true;
  showNetGain = true;

  constructor(name: string = 'New Investment', initialInputs?: Partial<InvestmentInputs>) {
    this.id = uuidv4();
    this.name = name;
    this.enabled = true;

    // Default inputs
    this.inputs = {
      initialAmount: '10000',
      rateOfReturn: '7',
      inflationRate: '2.5',
      annualContribution: '5000',
      ...initialInputs
    };

    makeAutoObservable(this, {
      results: computed,
      startingYear: computed,
      summaryData: computed
    });
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
  }

  updateInput = <K extends keyof InvestmentInputs>(key: K, value: InvestmentInputs[K]) => {
    this.inputs[key] = value;
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

  // Computed properties
  get startingYear(): number {
    return this.portfolioStore?.startingYear ? parseInt(this.portfolioStore.startingYear) : new Date().getFullYear();
  }

  get linkedPropertyCashFlows(): number[] {
    return this.portfolioStore?.getLinkedPropertyCashFlows?.(this.id) || [];
  }

  get results(): InvestmentResult[] {
    return this.calculateProjection(this.startingYear, this.linkedPropertyCashFlows);
  }

  private calculateProjection = (startingYear: number, linkedPropertyCashFlows: number[]): InvestmentResult[] => {
    const projections: InvestmentResult[] = [];
    const initialAmountNum = parseFloat(this.inputs.initialAmount) || 0;
    const yearsNum = parseInt(this.portfolioStore?.years || '10') || 1;
    const rateOfReturnNum = parseFloat(this.inputs.rateOfReturn) || 0;
    const inflationRateNum = parseFloat(this.inputs.inflationRate) || 0;
    const annualContributionNum = parseFloat(this.inputs.annualContribution) || 0;
    const baseYear = startingYear;

    let balance = initialAmountNum;
    let realBalance = initialAmountNum; // Track real balance separately
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
      realYearlyGain: 0,
      annualInvestmentGain: 0,
      realAnnualInvestmentGain: 0,
      propertyCashFlow: 0,
      realPropertyCashFlow: 0
    });

    for (let year = 1; year <= yearsNum; year++) {
      const previousBalance = balance;
      const previousRealBalance = realBalance;

      // Calculate contribution for this year
      let yearContribution = annualContributionNum;
      if (this.inflationAdjustedContributions) {
        // When inflation-adjusted, the nominal contribution increases each year
        // to maintain the same real purchasing power
        yearContribution = annualContributionNum * Math.pow(1 + inflationRateNum / 100, year);
      }

      // Apply property cash flows BEFORE growth calculation
      const propertyCashFlow = linkedPropertyCashFlows?.[year - 1] || 0;
      const availableBalance = balance + propertyCashFlow;
      
      // Calculate growth on available balance after cash flows
      const balanceAfterGrowth = availableBalance * (1 + rateOfReturnNum / 100);
      
      // Add contributions after growth
      balance = balanceAfterGrowth + yearContribution;

      // Calculate real balance using real rate of return
      // Real rate = (1 + nominal rate) / (1 + inflation rate) - 1
      const realGrowthFactor = (1 + rateOfReturnNum / 100) / (1 + inflationRateNum / 100);
      const inflationFactor = Math.pow(1 + inflationRateNum / 100, year);
      
      // Apply property cash flows to real balance (in current year real terms)
      const realPropertyCashFlow = propertyCashFlow / inflationFactor;
      const realAvailableBalance = realBalance + realPropertyCashFlow;
      
      // Apply real growth
      const realBalanceAfterGrowth = realAvailableBalance * realGrowthFactor;
      
      // Add real contribution
      let realYearContribution;
      if (this.inflationAdjustedContributions) {
        // Real value stays constant when inflation-adjusted
        realYearContribution = annualContributionNum;
      } else {
        // Real value declines when not inflation-adjusted
        realYearContribution = yearContribution / inflationFactor;
      }
      
      realBalance = realBalanceAfterGrowth + realYearContribution;

      // Track contributions vs withdrawals separately (not including initial amount)
      if (yearContribution > 0) {
        totalContributed += yearContribution;
      } else {
        totalWithdrawn += Math.abs(yearContribution);
      }

      // Track property cash flows (positive = contributed, negative = withdrawn)
      if (propertyCashFlow > 0) {
        totalContributed += propertyCashFlow;
      } else if (propertyCashFlow < 0) {
        totalWithdrawn += Math.abs(propertyCashFlow);
      }

      // Calculate earnings: balance - initial investment - net contributions
      const netContributions = totalContributed - totalWithdrawn;
      const totalEarnings = balance - initialAmountNum - netContributions;
      const yearlyGain = balance - previousBalance;
      
      // For display purposes, we'll show contribution and property cash flow separately
      const netYearContribution = yearContribution + propertyCashFlow;

      // Calculate real values (adjusted for inflation)
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

      // Calculate real yearly gain (change in real balance)
      const realYearlyGain = realBalance - previousRealBalance;

      // Calculate annual investment gain (growth only, excluding contributions)
      const annualInvestmentGain = yearlyGain - netYearContribution;
      
      // Calculate real annual investment gain (growth only on real balance)
      // This is the real growth excluding contributions and cash flows
      const realNetContribution = realYearContribution + realPropertyCashFlow;
      const realAnnualInvestmentGain = realYearlyGain - realNetContribution;

      projections.push({
        year,
        actualYear: baseYear + year,
        balance: Math.round(balance * 100) / 100,
        realBalance: Math.round(realBalance * 100) / 100,
        annualContribution: Math.round(yearContribution * 100) / 100, // Only direct contribution
        realAnnualContribution: Math.round(realAnnualContribution * 100) / 100, // Only direct contribution
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        realTotalEarnings: Math.round(realTotalEarnings * 100) / 100,
        yearlyGain: Math.round(yearlyGain * 100) / 100,
        realYearlyGain: Math.round(realYearlyGain * 100) / 100,
        annualInvestmentGain: Math.round(annualInvestmentGain * 100) / 100,
        realAnnualInvestmentGain: Math.round(realAnnualInvestmentGain * 100) / 100,
        propertyCashFlow: Math.round(propertyCashFlow * 100) / 100,
        realPropertyCashFlow: Math.round(realPropertyCashFlow * 100) / 100
      });
    }

    return projections;
  }

  // Other computed values
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

  get warnings(): string[] {
    const warnings: string[] = [];
    const results = this.results;
    
    // Check for negative balances
    const negativeBalances = results.filter(r => r.balance < 0);
    if (negativeBalances.length > 0) {
      warnings.push(`Investment balance goes negative starting in year ${negativeBalances[0].year} due to property cash flows`);
    }
    
    // Check for excessive negative cash flows
    const linkedCashFlows = this.linkedPropertyCashFlows;
    const totalWithdrawals = linkedCashFlows.reduce((sum, cf) => sum + (cf < 0 ? Math.abs(cf) : 0), 0);
    const annualContribution = this.annualContributionNumber;
    const totalContributions = annualContribution * parseInt(this.portfolioStore?.years || '10');
    
    if (totalWithdrawals > totalContributions * 2) {
      warnings.push(`Property cash outflows ($${totalWithdrawals.toLocaleString()}) significantly exceed investment contributions ($${totalContributions.toLocaleString()})`);
    }
    
    return warnings;
  }

  // Summary calculations for UI
  get summaryData() {
    const finalResult = this.finalResult;
    if (!finalResult) return null;

    const initialAmount = parseFloat(this.inputs.initialAmount) || 0;
    const annualContribution = parseFloat(this.inputs.annualContribution) || 0;
    const years = parseInt(this.portfolioStore?.years || '10') || 0;

    // Get linked properties
    const linkedProperties = this.portfolioStore ? 
      (this.portfolioStore as any).properties?.filter(
        (property: any) => property.enabled && property.inputs.linkedInvestmentId === this.id
      ) || [] : [];

    let totalManualContributed = 0;
    let totalManualWithdrawn = 0;
    let totalPropertyCashFlow = 0;

    // Calculate manual contributions/withdrawals over the years
    for (let year = 1; year <= years; year++) {
      let yearContribution = annualContribution;
      if (this.inflationAdjustedContributions) {
        const inflationRate = parseFloat(this.inputs.inflationRate) || 0;
        yearContribution = annualContribution * Math.pow(1 + inflationRate / 100, year);
      }

      if (yearContribution > 0) {
        totalManualContributed += yearContribution;
      } else {
        totalManualWithdrawn += Math.abs(yearContribution);
      }
    }

    // Calculate property cash flows over the years
    for (let year = 1; year <= years; year++) {
      for (const property of linkedProperties) {
        const monthlyPayment = parseFloat(property.inputs.monthlyPayment) || property.calculatedPrincipalInterestPayment;
        const annualPayment = monthlyPayment * 12;
        totalPropertyCashFlow += annualPayment;
      }
    }

    const totalContributed = totalManualContributed;
    const totalWithdrawn = totalManualWithdrawn + totalPropertyCashFlow;
    const netContributions = totalContributed - totalWithdrawn;
    const totalEarnings = finalResult.balance - initialAmount - netContributions;
    const totalReturn = initialAmount > 0 ? (totalEarnings / initialAmount) * 100 : 0;
    const finalNetGain = finalResult.balance - initialAmount;
    const realFinalNetGain = finalResult.realBalance - initialAmount;

    return {
      initialAmount,
      totalManualContributed,
      totalManualWithdrawn,
      totalPropertyCashFlow,
      totalContributed,
      totalWithdrawn,
      netContributions,
      totalEarnings,
      totalReturn,
      finalNetGain,
      realFinalNetGain,
      linkedProperties
    };
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
      showNetGain: this.showNetGain
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
    return investment;
  }
}