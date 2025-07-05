import { makeAutoObservable, computed } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { type BaseAsset, type BaseCalculationResult } from '@/features/shared/types/BaseAsset';

export interface PropertyInputs {
  purchasePrice: string;
  downPaymentPercentage: string;
  interestRate: string;
  loanTerm: string;
  years: string;
  inflationRate: string;
  yearsBought: string;
  propertyGrowthRate: string;
  monthlyPayment: string; // User-editable total monthly payment
  linkedInvestmentId: string; // Investment asset to withdraw monthly payments from
}

export interface PropertyResult extends BaseCalculationResult {
  mortgageBalance: number;
  monthlyPayment: number; // Total monthly payment
  principalInterestPayment: number; // Calculated P+I portion
  otherFeesPayment: number; // Taxes, insurance, maintenance (monthly payment - P+I)
  principalPaid: number;
  interestPaid: number;
}

export class Property implements BaseAsset {
  id: string;
  name: string;
  enabled: boolean;
  inputs: PropertyInputs;
  portfolioStore?: {
    startingYear?: string;
  }; // Will be injected by PortfolioStore

  // UI state
  showBalance = true;
  showContributions = true;
  showNetGain = true;
  showNominal = true;
  showReal = true;

  constructor(name: string = 'New Property', initialInputs?: Partial<PropertyInputs>) {
    this.id = uuidv4();
    this.name = name;
    this.enabled = true;

    // Default inputs
    this.inputs = {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '7',
      loanTerm: '30',
      years: '10',
      inflationRate: '2.5',
      yearsBought: '0',
      propertyGrowthRate: '3',
      monthlyPayment: '', // Will show calculated P+I if empty
      linkedInvestmentId: '', // No linked investment by default
      ...initialInputs
    };

    makeAutoObservable(this, {
      results: computed,
      startingYear: computed
    });
  }

  // Actions
  setName = (name: string) => {
    this.name = name;
  }

  setEnabled = (enabled: boolean) => {
    this.enabled = enabled;
  }

  updateInput = <K extends keyof PropertyInputs>(key: K, value: PropertyInputs[K]) => {
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

  get results(): PropertyResult[] {
    return this.calculateProjection(this.startingYear);
  }

  private calculateProjection = (startingYear: number): PropertyResult[] => {
    const projections: PropertyResult[] = [];
    const purchasePrice = parseFloat(this.inputs.purchasePrice || '0') || 0;
    const downPaymentPercentage = this.inputs.downPaymentPercentage !== undefined ? parseFloat(this.inputs.downPaymentPercentage) : 20;
    const interestRate = parseFloat(this.inputs.interestRate || '0') || 0;
    const loanTerm = parseInt(this.inputs.loanTerm || '30') || 30;
    const investmentYears = parseInt(this.inputs.years || '10') || 10;
    const inflationRate = parseFloat(this.inputs.inflationRate || '0') || 0;
    const yearsBought = parseInt(this.inputs.yearsBought || '0') || 0;
    const propertyGrowthRate = this.inputs.propertyGrowthRate !== undefined ? parseFloat(this.inputs.propertyGrowthRate) : 3;
    const userMonthlyPayment = this.inputs.monthlyPayment && this.inputs.monthlyPayment !== '' ? 
      parseFloat(this.inputs.monthlyPayment) : 0;
    const baseYear = startingYear;

    const downPaymentAmount = purchasePrice * (downPaymentPercentage / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    // Calculate standard P+I payment using mortgage formula
    const calculatedPIPayment = loanAmount > 0 ?
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;

    // Use user-provided payment if specified, otherwise use calculated P+I
    const totalMonthlyPayment = userMonthlyPayment > 0 ? userMonthlyPayment : calculatedPIPayment;
    // Other fees = total payment - P+I (taxes, insurance, maintenance, etc.)
    const otherFeesPayment = Math.max(0, totalMonthlyPayment - calculatedPIPayment);

    // Calculate mortgage balance after yearsBought years of payments (using P+I only)
    let remainingBalance = loanAmount;
    for (let pastYear = 1; pastYear <= yearsBought; pastYear++) {
      for (let month = 1; month <= 12 && remainingBalance > 0; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(calculatedPIPayment - interestPayment, remainingBalance);
        remainingBalance -= principalPayment;
      }
    }

    // Add year 0 (current state at start of investment period)
    const initialPropertyValue = purchasePrice * Math.pow(1 + propertyGrowthRate / 100, yearsBought);
    projections.push({
      year: 0,
      actualYear: baseYear,
      balance: Math.round(initialPropertyValue * 100) / 100,
      realBalance: Math.round(initialPropertyValue * 100) / 100,
      mortgageBalance: Math.round(remainingBalance * 100) / 100,
      monthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
      principalInterestPayment: Math.round(calculatedPIPayment * 100) / 100,
      otherFeesPayment: Math.round(otherFeesPayment * 100) / 100,
      principalPaid: 0,
      interestPaid: 0
    });

    // Calculate year-by-year mortgage amortization for the investment period
    for (let year = 1; year <= investmentYears; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      // Calculate 12 monthly payments for this year (using P+I only for mortgage balance)
      for (let month = 1; month <= 12 && remainingBalance > 0; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(calculatedPIPayment - interestPayment, remainingBalance);

        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        remainingBalance -= principalPayment;
      }

      // Calculate property value appreciation
      const totalYearsSinceOwnership = yearsBought + year;
      const propertyValue = purchasePrice * Math.pow(1 + propertyGrowthRate / 100, totalYearsSinceOwnership);
      const inflationFactor = Math.pow(1 + inflationRate / 100, year);

      projections.push({
        year,
        actualYear: baseYear + year,
        balance: Math.round(propertyValue * 100) / 100,
        realBalance: Math.round((propertyValue / inflationFactor) * 100) / 100,
        mortgageBalance: Math.round(remainingBalance * 100) / 100,
        monthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
        principalInterestPayment: Math.round(calculatedPIPayment * 100) / 100,
        otherFeesPayment: Math.round(otherFeesPayment * 100) / 100,
        principalPaid: Math.round(yearlyPrincipal * 100) / 100,
        interestPaid: Math.round(yearlyInterest * 100) / 100
      });
    }

    return projections;
  }

  // Computed values
  get type() {
    return 'property' as const;
  }

  get hasResults() {
    return this.results.length > 0;
  }

  get finalResult() {
    return this.results[this.results.length - 1] || null;
  }

  get monthlyPayment() {
    return this.finalResult?.monthlyPayment || 0;
  }

  get remainingMortgageBalance() {
    return this.finalResult?.mortgageBalance || 0;
  }

  get calculatedPrincipalInterestPayment() {
    const purchasePrice = parseFloat(this.inputs.purchasePrice || '0') || 0;
    const downPaymentPercentage = this.inputs.downPaymentPercentage !== undefined ? parseFloat(this.inputs.downPaymentPercentage) : 20;
    const interestRate = parseFloat(this.inputs.interestRate || '0') || 0;
    const loanTerm = parseInt(this.inputs.loanTerm || '30') || 30;
    
    const downPaymentAmount = purchasePrice * (downPaymentPercentage / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    // Calculate standard P+I payment using mortgage formula
    const calculatedPIPayment = loanAmount > 0 ?
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;
      
    return Math.round(calculatedPIPayment * 100) / 100;
  }

  // Serialization for localStorage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: 'property' as const,
      enabled: this.enabled,
      inputs: this.inputs,
      showBalance: this.showBalance,
      showContributions: this.showContributions,
      showNetGain: this.showNetGain,
      showNominal: this.showNominal,
      showReal: this.showReal
    };
  }

  static fromJSON(data: ReturnType<Property['toJSON']>): Property {
    const property = new Property(data.name, data.inputs);
    property.id = data.id;
    property.enabled = data.enabled;
    property.showBalance = data.showBalance ?? true;
    property.showContributions = data.showContributions ?? true;
    property.showNetGain = data.showNetGain ?? true;
    property.showNominal = data.showNominal ?? true;
    property.showReal = data.showReal ?? true;
    return property;
  }
}