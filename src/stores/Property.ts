import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { type BaseAsset, type BaseCalculationResult } from './BaseAsset';

export interface PropertyInputs {
  purchasePrice: string;
  downPayment: string;
  interestRate: string;
  loanTerm: string;
  years: string;
  inflationRate: string;
}

export interface PropertyResult extends BaseCalculationResult {
  mortgageBalance: number;
  monthlyPayment: number;
  principalPaid: number;
  interestPaid: number;
}

export class Property implements BaseAsset {
  id: string;
  name: string;
  enabled: boolean;
  inputs: PropertyInputs;
  results: PropertyResult[] = [];

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
      downPayment: '100000',
      interestRate: '7',
      loanTerm: '30',
      years: '10',
      inflationRate: '2.5',
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

  updateInput = <K extends keyof PropertyInputs>(key: K, value: PropertyInputs[K]) => {
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

  calculateProjection = (startingYear?: number) => {
    const projections: PropertyResult[] = [];
    const purchasePrice = parseFloat(this.inputs.purchasePrice || '0') || 0;
    const downPayment = parseFloat(this.inputs.downPayment || '0') || 0;
    const interestRate = parseFloat(this.inputs.interestRate || '0') || 0;
    const loanTerm = parseInt(this.inputs.loanTerm || '30') || 30;
    const investmentYears = parseInt(this.inputs.years || '10') || 10;
    const inflationRate = parseFloat(this.inputs.inflationRate || '0') || 0;
    const baseYear = startingYear || new Date().getFullYear();

    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    // Calculate monthly payment using standard mortgage formula
    const monthlyPayment = loanAmount > 0 ? 
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;

    // Add year 0 (initial state)
    projections.push({
      year: 0,
      actualYear: baseYear,
      balance: purchasePrice,
      realBalance: purchasePrice,
      mortgageBalance: loanAmount,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      principalPaid: 0,
      interestPaid: 0
    });

    let remainingBalance = loanAmount;
    let totalInterestPaid = 0;

    // Calculate year-by-year mortgage amortization for the investment period
    for (let year = 1; year <= investmentYears; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      // Calculate 12 monthly payments for this year
      for (let month = 1; month <= 12 && remainingBalance > 0; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);
        
        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        remainingBalance -= principalPayment;
      }

      totalInterestPaid += yearlyInterest;

      // For property, we'll track the mortgage balance as the main metric
      const inflationFactor = Math.pow(1 + inflationRate / 100, year);

      projections.push({
        year,
        actualYear: baseYear + year,
        balance: purchasePrice, // Property value (simplified - not appreciating)
        realBalance: purchasePrice / inflationFactor,
        mortgageBalance: Math.round(remainingBalance * 100) / 100,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        principalPaid: Math.round(yearlyPrincipal * 100) / 100,
        interestPaid: Math.round(yearlyInterest * 100) / 100
      });
    }

    this.results = projections;
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