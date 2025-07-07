import { makeAutoObservable, computed } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { type BaseAsset, type BaseCalculationResult } from '@/features/shared/types/BaseAsset';
import { FederalTaxCalculator } from '@/features/tax/calculators/FederalTaxCalculator';
import { Section121Calculator } from '@/features/tax/calculators/Section121Calculator';
import { StateTaxCalculator } from '@/features/tax/calculators/StateTaxCalculator';
import type { FilingStatus } from '@/features/tax/types';

export type PropertyGrowthModel = 'purchase_price' | 'current_value';

export interface PropertySaleConfig {
  isPlannedForSale: boolean;
  saleYear: number | null;
  expectedSalePrice: number | null;  // null = use projected value
  useProjectedValue: boolean;
  sellingCostsPercentage: number;
  reinvestProceeds: boolean;
  targetInvestmentId: string | null;  // for reinvestment
  saleMonth: number;  // 1-12, default 6 for mid-year
  // Cost basis tracking for tax calculations
  capitalImprovements: string;  // Cost of improvements that increase basis
  originalBuyingCosts: string;  // Transaction costs from original purchase
  // Tax profile data - property-specific since each sale can have different circumstances
  filingStatus: FilingStatus;
  annualIncome: string;  // Annual income at time of sale
  state: string;  // State where property is located or owner resides
  enableStateTax: boolean;
  otherCapitalGains: string;  // Other capital gains/losses for the year
  carryoverLosses: string;  // Capital loss carryovers from previous years
  // Section 121 Primary Residence Exclusion fields
  isPrimaryResidence: boolean;  // Qualifies as primary residence
  yearsOwned: string;  // Years owned at time of sale
  yearsLived: string;  // Years lived in as primary residence
  hasUsedExclusionInLastTwoYears: boolean;  // Previously used Section 121 exclusion
  enableSection121: boolean;  // Whether to apply Section 121 exclusion
}

export interface PropertyInputs {
  purchasePrice: string;
  downPaymentPercentage: string;
  interestRate: string;
  loanTerm: string;
  inflationRate: string;
  yearsBought: string;
  propertyGrowthRate: string;
  monthlyPayment: string; // User-editable total monthly payment
  linkedInvestmentId: string; // Investment asset to withdraw monthly payments from
  propertyGrowthModel: PropertyGrowthModel; // Choose between purchase_price or current_value growth
  currentEstimatedValue: string; // Current estimated value for current_value growth model
  // Rental property fields
  isRentalProperty: boolean; // Enable rental property calculations
  monthlyRent: string; // Monthly rental income
  rentGrowthRate: string; // Annual rent growth rate percentage
  vacancyRate: string; // Expected vacancy rate percentage
  // Enhanced expense model
  maintenanceRate: string; // % of property value per year
  propertyManagementEnabled: boolean; // Toggle for property management
  listingFeeRate: string; // % of monthly rent per listing
  monthlyManagementFeeRate: string; // % of monthly rent per month
  // Sale configuration
  saleConfig: PropertySaleConfig;
}

export interface PropertyResult extends BaseCalculationResult {
  mortgageBalance: number;
  monthlyPayment: number; // Total monthly payment
  principalInterestPayment: number; // Calculated P+I portion
  otherFeesPayment: number; // Taxes, insurance, maintenance (monthly payment - P+I)
  principalPaid: number;
  interestPaid: number;
  annualCashFlow: number; // Annual net cash flow (can be positive or negative)
  // Rental property fields
  annualRentalIncome: number; // Annual rental income (after vacancy)
  // Enhanced expense breakdown
  maintenanceExpenses: number; // Annual maintenance costs
  listingExpenses: number; // Annual listing costs (vacancy-based)
  monthlyManagementExpenses: number; // Annual management fees
  totalRentalExpenses: number; // Sum of all expense components
  
  // Sale-specific fields
  saleProceeds?: number;         // Net proceeds from sale (only in sale year)
  sellingCosts?: number;         // Total selling costs (only in sale year)
  grossSalePrice?: number;       // Gross sale price (only in sale year)
  netSaleProceeds?: number;      // Net proceeds after mortgage and costs
  preSaleMortgageBalance?: number; // Mortgage balance before sale (only in sale year)
  isSaleYear?: boolean;          // Flag indicating this is the sale year
  isPostSale?: boolean;          // Flag indicating property has been sold
}

export class Property implements BaseAsset {
  id: string;
  name: string;
  enabled: boolean;
  inputs: PropertyInputs;
  portfolioStore?: {
    startingYear?: string;
    years?: string;
  }; // Will be injected by PortfolioStore

  // UI state
  showBalance = true;
  showContributions = true;
  showNetGain = true;

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
      inflationRate: '2.5',
      yearsBought: '0',
      propertyGrowthRate: '3',
      monthlyPayment: '', // Will show calculated P+I if empty
      linkedInvestmentId: '', // No linked investment by default
      propertyGrowthModel: 'purchase_price', // Default to original purchase price growth
      currentEstimatedValue: '', // Will be set when using current_value model
      // Rental property defaults
      isRentalProperty: false, // Default to non-rental property
      monthlyRent: '2000', // Default monthly rent
      rentGrowthRate: '3', // Default rent growth rate
      vacancyRate: '5', // Default vacancy rate
      // Enhanced expense model defaults
      maintenanceRate: '2', // 2% of property value annually
      propertyManagementEnabled: false, // Disabled by default
      listingFeeRate: '100', // 100% of monthly rent per placement
      monthlyManagementFeeRate: '10', // 10% of collected rent
      // Sale configuration defaults
      saleConfig: {
        isPlannedForSale: false,
        saleYear: null,
        expectedSalePrice: null,
        useProjectedValue: true,
        sellingCostsPercentage: 7,  // 7% default
        reinvestProceeds: true,
        targetInvestmentId: null,
        saleMonth: 6,  // Mid-year default
        capitalImprovements: '',  // No improvements by default
        originalBuyingCosts: '',   // No buying costs by default
        // Tax profile defaults - property-specific
        filingStatus: 'single',
        annualIncome: '75000',  // Reasonable default
        state: 'CA',  // Default state
        enableStateTax: false,  // Disabled by default for Phase 1
        otherCapitalGains: '',  // No other gains by default
        carryoverLosses: '',  // No carryover losses by default
        // Section 121 Primary Residence Exclusion defaults
        isPrimaryResidence: false,  // Default to investment property
        yearsOwned: '',  // No default years owned
        yearsLived: '',  // No default years lived
        hasUsedExclusionInLastTwoYears: false,  // No recent use
        enableSection121: true  // Enable Section 121 evaluation by default
      },
      ...initialInputs
    };

    makeAutoObservable(this, {
      results: computed,
      startingYear: computed,
      summaryData: computed,
      isPlannedForSale: computed,
      saleYear: computed,
      projectedSalePrice: computed,
      effectiveSalePrice: computed,
      sellingCosts: computed,
      netSaleProceeds: computed,
      adjustedCostBasis: computed,
      capitalGain: computed,
      federalTaxCalculation: computed,
      section121Exclusion: computed,
      federalTaxAmount: computed,
      stateTaxCalculation: computed,
      stateTaxAmount: computed,
      totalTaxAmount: computed,
      netAfterTaxProceeds: computed,
      parsedInputs: computed
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

  // Sale configuration actions
  setSaleEnabled = (enabled: boolean) => {
    this.inputs.saleConfig.isPlannedForSale = enabled;
    
    // Set default sale year to mid-point of projection if not set
    if (enabled && !this.inputs.saleConfig.saleYear) {
      const years = parseInt(this.portfolioStore?.years || '10') || 10;
      this.inputs.saleConfig.saleYear = Math.ceil(years / 2);
    }
  }

  updateSaleConfig = <K extends keyof PropertySaleConfig>(key: K, value: PropertySaleConfig[K]) => {
    this.inputs.saleConfig[key] = value;
    
    // Auto-select linked investment as target if available
    if (key === 'reinvestProceeds' && value === true && !this.inputs.saleConfig.targetInvestmentId) {
      this.inputs.saleConfig.targetInvestmentId = this.inputs.linkedInvestmentId || null;
    }
  }

  // Computed properties
  get startingYear(): number {
    return this.portfolioStore?.startingYear ? parseInt(this.portfolioStore.startingYear) : new Date().getFullYear();
  }

  // Sale computation properties
  get isPlannedForSale(): boolean {
    return this.inputs.saleConfig.isPlannedForSale;
  }

  get saleYear(): number | null {
    return this.inputs.saleConfig.saleYear;
  }

  get projectedSalePrice(): number {
    if (!this.saleYear) return 0;
    
    const parsed = this.parsedInputs;
    
    if (this.inputs.propertyGrowthModel === 'current_value') {
      return parsed.currentEstimatedValue * Math.pow(1 + parsed.propertyGrowthRate / 100, this.saleYear);
    } else {
      return parsed.purchasePrice * Math.pow(1 + parsed.propertyGrowthRate / 100, parsed.yearsBought + this.saleYear);
    }
  }

  get effectiveSalePrice(): number {
    if (!this.saleYear) return 0;
    
    return this.inputs.saleConfig.useProjectedValue 
      ? this.projectedSalePrice
      : (parseFloat(this.inputs.saleConfig.expectedSalePrice?.toString() || '0') || 0);
  }

  get sellingCosts(): number {
    if (!this.saleYear) return 0;
    
    const salePrice = this.effectiveSalePrice;
    const costsPercentage = this.inputs.saleConfig.sellingCostsPercentage || 0;
    return salePrice * (costsPercentage / 100);
  }

  get netSaleProceeds(): number {
    if (!this.saleYear) return 0;
    
    const salePrice = this.effectiveSalePrice;
    const sellingCosts = this.sellingCosts;
    
    // Calculate mortgage balance at sale year directly
    const remainingMortgage = this.calculateMortgageBalanceAtYear(this.saleYear);
    
    return salePrice - sellingCosts - remainingMortgage;
  }

  get adjustedCostBasis(): number {
    const parsed = this.parsedInputs;
    return parsed.purchasePrice + parsed.capitalImprovements + parsed.originalBuyingCosts;
  }

  get capitalGain(): number {
    if (!this.saleYear) return 0;
    
    const salePrice = this.effectiveSalePrice;
    const sellingCosts = this.sellingCosts;
    const adjustedBasis = this.adjustedCostBasis;
    
    // Capital gain = Sale price - selling costs - cost basis
    // Mortgage payoff does NOT affect capital gains calculation
    const grossProceeds = salePrice - sellingCosts;
    return Math.max(0, grossProceeds - adjustedBasis);
  }

  /**
   * Calculate federal capital gains tax using property's tax profile
   */
  get federalTaxCalculation() {
    if (!this.saleYear || !this.inputs.saleConfig.isPlannedForSale) {
      return {
        taxableGain: 0,
        taxRate: 0,
        taxAmount: 0,
        bracketInfo: { min: 0, max: 0, rate: 0 },
      };
    }

    const capitalGain = this.capitalGain;
    const annualIncome = parseFloat(this.inputs.saleConfig.annualIncome || '0') || 0;
    const otherCapitalGains = parseFloat(this.inputs.saleConfig.otherCapitalGains || '0') || 0;
    const carryoverLosses = parseFloat(this.inputs.saleConfig.carryoverLosses || '0') || 0;
    
    return FederalTaxCalculator.calculateFederalTaxWithAdjustments(
      capitalGain,
      annualIncome,
      this.inputs.saleConfig.filingStatus,
      otherCapitalGains,
      carryoverLosses
    );
  }

  /**
   * Calculate Section 121 Primary Residence Exclusion
   */
  get section121Exclusion() {
    if (!this.saleYear || !this.inputs.saleConfig.isPlannedForSale || !this.inputs.saleConfig.enableSection121) {
      return {
        isEligible: false,
        maxExclusion: 0,
        appliedExclusion: 0,
        remainingGain: this.capitalGain,
        reason: 'Sale not configured or Section 121 disabled',
      };
    }

    const capitalGain = this.capitalGain;
    const filingStatus = this.inputs.saleConfig.filingStatus;
    const yearsOwned = parseFloat(this.inputs.saleConfig.yearsOwned || '0') || 0;
    const yearsLived = parseFloat(this.inputs.saleConfig.yearsLived || '0') || 0;
    
    const requirements = {
      isPrimaryResidence: this.inputs.saleConfig.isPrimaryResidence,
      yearsOwned,
      yearsLived,
      hasUsedExclusionInLastTwoYears: this.inputs.saleConfig.hasUsedExclusionInLastTwoYears,
    };

    return Section121Calculator.calculateExclusion(capitalGain, filingStatus, requirements);
  }

  /**
   * Get the federal capital gains tax amount after Section 121 exclusion
   */
  get federalTaxAmount(): number {
    if (!this.inputs.saleConfig.enableSection121) {
      return this.federalTaxCalculation.taxAmount;
    }

    // Calculate tax on remaining gain after Section 121 exclusion plus other gains/losses
    const exclusion = this.section121Exclusion;
    const remainingPropertyGain = exclusion.remainingGain;
    
    const annualIncome = parseFloat(this.inputs.saleConfig.annualIncome || '0') || 0;
    const otherCapitalGains = parseFloat(this.inputs.saleConfig.otherCapitalGains || '0') || 0;
    const carryoverLosses = parseFloat(this.inputs.saleConfig.carryoverLosses || '0') || 0;
    
    // Total taxable gain = remaining property gain + other gains - losses
    const totalTaxableGain = remainingPropertyGain + otherCapitalGains - carryoverLosses;
    
    if (totalTaxableGain <= 0) {
      return 0;
    }

    const taxCalculation = FederalTaxCalculator.calculateFederalTax(
      totalTaxableGain,
      annualIncome,
      this.inputs.saleConfig.filingStatus
    );

    return taxCalculation.taxAmount;
  }

  /**
   * Calculate state capital gains tax
   */
  get stateTaxCalculation() {
    if (!this.saleYear || !this.inputs.saleConfig.isPlannedForSale || !this.inputs.saleConfig.enableStateTax) {
      return {
        stateCode: this.inputs.saleConfig.state || 'CA',
        stateName: 'Unknown State',
        hasCapitalGainsTax: false,
        taxableGain: 0,
        taxRate: 0,
        taxAmount: 0,
        notes: 'State tax disabled or sale not configured',
      };
    }

    // Calculate state tax on remaining gain after Section 121 exclusion
    let taxableGain = this.capitalGain;
    
    if (this.inputs.saleConfig.enableSection121) {
      const exclusion = this.section121Exclusion;
      taxableGain = exclusion.remainingGain;
    }

    // Add other capital gains and subtract carryover losses
    const otherCapitalGains = parseFloat(this.inputs.saleConfig.otherCapitalGains || '0') || 0;
    const carryoverLosses = parseFloat(this.inputs.saleConfig.carryoverLosses || '0') || 0;
    const totalTaxableGain = taxableGain + otherCapitalGains - carryoverLosses;

    return StateTaxCalculator.calculateStateTax(totalTaxableGain, this.inputs.saleConfig.state);
  }

  /**
   * Get the state capital gains tax amount
   */
  get stateTaxAmount(): number {
    return this.stateTaxCalculation.taxAmount;
  }

  /**
   * Get total tax amount (federal + state)
   */
  get totalTaxAmount(): number {
    const federalTax = this.federalTaxAmount;
    const stateTax = this.stateTaxAmount;
    return federalTax + stateTax;
  }

  /**
   * Calculate net proceeds after all taxes (federal + state)
   */
  get netAfterTaxProceeds(): number {
    if (!this.saleYear || !this.inputs.saleConfig.isPlannedForSale) return 0;
    
    const netProceeds = this.netSaleProceeds;
    const totalTax = this.totalTaxAmount;
    
    return netProceeds - totalTax;
  }

  /**
   * Legacy method: Calculate federal capital gains tax with explicit parameters
   * @deprecated Use federalTaxCalculation computed property instead
   */
  calculateFederalTax(
    annualIncome: number,
    filingStatus: FilingStatus,
    otherCapitalGains: number = 0,
    carryoverLosses: number = 0
  ) {
    if (!this.saleYear) {
      return {
        taxableGain: 0,
        taxRate: 0,
        taxAmount: 0,
        bracketInfo: { min: 0, max: 0, rate: 0 },
      };
    }

    const capitalGain = this.capitalGain;
    
    return FederalTaxCalculator.calculateFederalTaxWithAdjustments(
      capitalGain,
      annualIncome,
      filingStatus,
      otherCapitalGains,
      carryoverLosses
    );
  }

  /**
   * Legacy method: Get the federal capital gains tax amount with explicit parameters
   * @deprecated Use federalTaxAmount computed property instead
   */
  getFederalTaxAmount(
    annualIncome: number,
    filingStatus: FilingStatus,
    otherCapitalGains: number = 0,
    carryoverLosses: number = 0
  ): number {
    return this.calculateFederalTax(annualIncome, filingStatus, otherCapitalGains, carryoverLosses).taxAmount;
  }

  /**
   * Legacy method: Calculate net proceeds after all taxes with explicit parameters
   * @deprecated Use netAfterTaxProceeds computed property instead
   */
  calculateNetAfterTaxProceeds(
    annualIncome: number,
    filingStatus: FilingStatus,
    otherCapitalGains: number = 0,
    carryoverLosses: number = 0
  ): number {
    if (!this.saleYear) return 0;
    
    const netProceeds = this.netSaleProceeds;
    const federalTax = this.getFederalTaxAmount(annualIncome, filingStatus, otherCapitalGains, carryoverLosses);
    
    return netProceeds - federalTax;
  }

  // Parsed inputs computed property - eliminates duplicate parsing
  get parsedInputs() {
    return {
      // Basic property inputs
      purchasePrice: parseFloat(this.inputs.purchasePrice || '0') || 0,
      downPaymentPercentage: this.inputs.downPaymentPercentage !== undefined && this.inputs.downPaymentPercentage !== '' 
        ? parseFloat(this.inputs.downPaymentPercentage) : 20,
      interestRate: parseFloat(this.inputs.interestRate || '0') || 0,
      loanTerm: parseInt(this.inputs.loanTerm || '30') || 30,
      years: parseInt(this.portfolioStore?.years || '10') || 10,
      inflationRate: parseFloat(this.inputs.inflationRate || '0') || 0,
      yearsBought: parseInt(this.inputs.yearsBought || '0') || 0,
      propertyGrowthRate: parseFloat(this.inputs.propertyGrowthRate || '0') || 0,
      currentEstimatedValue: parseFloat(this.inputs.currentEstimatedValue || '0') || 0,
      userMonthlyPayment: this.inputs.monthlyPayment && this.inputs.monthlyPayment !== '' ? 
        parseFloat(this.inputs.monthlyPayment) : 0,
      
      // Rental property inputs
      monthlyRent: parseFloat(this.inputs.monthlyRent || '0') || 0,
      rentGrowthRate: parseFloat(this.inputs.rentGrowthRate || '0') || 0,
      vacancyRate: parseFloat(this.inputs.vacancyRate || '0') || 0,
      // Enhanced expense model inputs
      maintenanceRate: parseFloat(this.inputs.maintenanceRate || '0') || 0,
      listingFeeRate: parseFloat(this.inputs.listingFeeRate || '0') || 0,
      monthlyManagementFeeRate: parseFloat(this.inputs.monthlyManagementFeeRate || '0') || 0,
      
      // Cost basis inputs for tax calculations
      capitalImprovements: parseFloat(this.inputs.saleConfig.capitalImprovements || '0') || 0,
      originalBuyingCosts: parseFloat(this.inputs.saleConfig.originalBuyingCosts || '0') || 0,
    };
  }

  // Pre-calculates effective values with growth for a given year
  private calculateEffectiveValues(year: number) {
    const parsed = this.parsedInputs;
    
    return {
      // Property value with growth
      propertyValue: this.calculatePropertyValueForYear(year, parsed),
      
      // Rental values with growth
      monthlyRent: parsed.monthlyRent * Math.pow(1 + parsed.rentGrowthRate / 100, year),
      
      // Inflation factor
      inflationFactor: Math.pow(1 + parsed.inflationRate / 100, year),
      
      // Mortgage details
      loanAmount: parsed.purchasePrice * (1 - parsed.downPaymentPercentage / 100),
      monthlyRate: parsed.interestRate / 100 / 12,
    };
  }

  // Helper method for property value calculation
  private calculatePropertyValueForYear(year: number, parsed: any): number {
    if (this.inputs.propertyGrowthModel === 'current_value') {
      return parsed.currentEstimatedValue * Math.pow(1 + parsed.propertyGrowthRate / 100, year);
    } else {
      return parsed.purchasePrice * Math.pow(1 + parsed.propertyGrowthRate / 100, parsed.yearsBought + year);
    }
  }

  private calculateMortgageBalanceAtYear(targetYear: number): number {
    const parsed = this.parsedInputs;
    
    const downPaymentAmount = parsed.purchasePrice * (parsed.downPaymentPercentage / 100);
    const loanAmount = parsed.purchasePrice - downPaymentAmount;
    const monthlyRate = parsed.interestRate / 100 / 12;
    
    // Calculate P+I payment
    const numPayments = parsed.loanTerm * 12;
    const calculatedPIPayment = loanAmount > 0 ?
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;

    // Calculate balance after all payments up to target year
    let remainingBalance = loanAmount;
    const totalYears = parsed.yearsBought + targetYear;
    
    for (let year = 1; year <= totalYears && remainingBalance > 0; year++) {
      for (let month = 1; month <= 12 && remainingBalance > 0; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(calculatedPIPayment - interestPayment, remainingBalance);
        remainingBalance -= principalPayment;
      }
    }
    
    return remainingBalance;
  }

  // Mortgage calculation helpers
  private calculateMortgagePayment(principal: number, annualRate: number, termYears: number): number {
    if (principal <= 0) return 0;
    
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  private calculateInitialMortgageBalance(): number {
    const parsed = this.parsedInputs;
    
    const downPaymentAmount = parsed.purchasePrice * (parsed.downPaymentPercentage / 100);
    const loanAmount = parsed.purchasePrice - downPaymentAmount;
    
    if (parsed.yearsBought === 0) return loanAmount;
    
    // Calculate remaining balance after yearsBought
    const monthlyRate = parsed.interestRate / 100 / 12;
    const piPayment = this.calculateMortgagePayment(loanAmount, parsed.interestRate, parsed.loanTerm);
    
    let balance = loanAmount;
    for (let year = 1; year <= parsed.yearsBought && balance > 0; year++) {
      for (let month = 1; month <= 12 && balance > 0; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.min(piPayment - interestPayment, balance);
        balance -= principalPayment;
      }
    }
    
    return balance;
  }

  private amortizeMortgageYear(
    startingBalance: number, 
    monthlyRate: number, 
    piPayment: number, 
    monthsToCalculate: number = 12
  ): { endingBalance: number; totalPrincipal: number; totalInterest: number } {
    let balance = startingBalance;
    let totalPrincipal = 0;
    let totalInterest = 0;
    
    for (let month = 1; month <= monthsToCalculate && balance > 0; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = Math.min(piPayment - interestPayment, balance);
      
      totalInterest += interestPayment;
      totalPrincipal += principalPayment;
      balance -= principalPayment;
    }
    
    return {
      endingBalance: balance,
      totalPrincipal,
      totalInterest
    };
  }

  // Property value calculation helpers
  private calculatePropertyValue(year: number): number {
    const parsed = this.parsedInputs;
    return this.calculatePropertyValueForYear(year, parsed);
  }

  // Rental calculation helpers
  private calculateRentalIncome(year: number, monthsOwned: number = 12): number {
    if (!this.inputs.isRentalProperty) return 0;
    
    const parsed = this.parsedInputs;
    const effectiveValues = this.calculateEffectiveValues(year);
    
    const grossAnnualRent = effectiveValues.monthlyRent * monthsOwned;
    
    return grossAnnualRent * (1 - parsed.vacancyRate / 100);
  }

  private calculateRentalExpenses(year: number, monthsOwned: number = 12): number {
    if (!this.inputs.isRentalProperty) return 0;
    
    const effectiveValues = this.calculateEffectiveValues(year);
    
    // Use new enhanced expense model
    const maintenanceExpenses = this.calculateMaintenanceExpenses(effectiveValues, monthsOwned);
    const listingExpenses = this.calculateListingExpenses(effectiveValues, monthsOwned);
    const managementExpenses = this.calculateMonthlyManagementExpenses(effectiveValues, monthsOwned);
    
    return maintenanceExpenses + listingExpenses + managementExpenses;
  }

  // Enhanced expense calculation methods
  private calculateMaintenanceExpenses(effectiveValues: any, monthsOwned: number = 12): number {
    if (!this.inputs.isRentalProperty) return 0;
    
    const parsed = this.parsedInputs;
    return effectiveValues.propertyValue * (parsed.maintenanceRate / 100) * (monthsOwned / 12);
  }

  private calculateListingExpenses(effectiveValues: any, monthsOwned: number = 12): number {
    if (!this.inputs.isRentalProperty || !this.inputs.propertyManagementEnabled) return 0;
    
    const parsed = this.parsedInputs;
    
    // Calculate listing events based on tenant turnover frequency
    // Vacancy rate represents % of time vacant. Higher vacancy = shorter average tenancy = more turnover
    // Formula: If vacancy rate is V%, then average tenancy is roughly (100-V)/V * average_vacant_period
    // Simplified: annualListingEvents ≈ vacancyRate / (average_vacant_months / 12)
    // Assuming average vacancy period is 1-2 months, we can estimate turnover frequency
    
    let annualListingEvents = 0;
    if (parsed.vacancyRate > 0) {
      // More realistic calculation: 
      // If vacancy rate is 5%, assume average vacancy period is 1 month, occupied period is 19 months
      // So tenant turnover happens every 20 months = 0.6 times per year
      // General formula: turnover_frequency = 12 / (occupied_months + vacant_months)
      // Where vacant_months ≈ 1-2 months typically, occupied_months = vacant_months * (100-vacancyRate)/vacancyRate
      
      const assumedVacantMonthsPerTurnover = 1.5; // Typical time to find new tenant
      const occupiedMonthsPerTurnover = assumedVacantMonthsPerTurnover * (100 - parsed.vacancyRate) / parsed.vacancyRate;
      const totalCycleLength = occupiedMonthsPerTurnover + assumedVacantMonthsPerTurnover;
      
      annualListingEvents = (12 / totalCycleLength) * (monthsOwned / 12);
    }
    
    return effectiveValues.monthlyRent * (parsed.listingFeeRate / 100) * annualListingEvents;
  }

  private calculateMonthlyManagementExpenses(effectiveValues: any, monthsOwned: number = 12): number {
    if (!this.inputs.isRentalProperty || !this.inputs.propertyManagementEnabled) return 0;
    
    const parsed = this.parsedInputs;
    const effectiveRentalIncome = effectiveValues.monthlyRent * monthsOwned * (1 - parsed.vacancyRate / 100);
    
    return effectiveRentalIncome * (parsed.monthlyManagementFeeRate / 100);
  }


  // Cash flow calculation helpers
  private calculateAnnualCashFlow(
    rentalIncome: number,
    rentalExpenses: number,
    monthlyPayment: number,
    monthsOwned: number,
    saleProceeds: number = 0,
    reinvestInLinked: boolean = false
  ): number {
    const mortgagePayments = monthlyPayment * monthsOwned;
    
    if (this.inputs.isRentalProperty) {
      let cashFlow = rentalIncome - rentalExpenses - mortgagePayments;
      if (reinvestInLinked) {
        cashFlow += saleProceeds;
      }
      return cashFlow;
    } else {
      let cashFlow = -mortgagePayments;
      if (reinvestInLinked) {
        cashFlow += saleProceeds;
      }
      return cashFlow;
    }
  }

  get results(): PropertyResult[] {
    return this.calculateProjection(this.startingYear);
  }

  private createYear0Result(baseYear: number): PropertyResult {
    const initialBalance = this.calculateInitialMortgageBalance();
    const initialPropertyValue = this.calculatePropertyValue(0);
    
    // Use parsed inputs
    const parsed = this.parsedInputs;
    
    // Calculate loan amount and P+I payment
    const downPaymentAmount = parsed.purchasePrice * (parsed.downPaymentPercentage / 100);
    const loanAmount = parsed.purchasePrice - downPaymentAmount;
    const calculatedPIPayment = this.calculateMortgagePayment(loanAmount, parsed.interestRate, parsed.loanTerm);
    
    // Determine payments
    const totalMonthlyPayment = parsed.userMonthlyPayment > 0 ? parsed.userMonthlyPayment : calculatedPIPayment;
    const otherFeesPayment = Math.max(0, totalMonthlyPayment - calculatedPIPayment);
    
    // Adjust for paid-off mortgage
    let year0TotalPayment = totalMonthlyPayment;
    let year0PIPayment = calculatedPIPayment;
    let year0OtherFees = otherFeesPayment;
    
    if (initialBalance <= 0) {
      if (parsed.userMonthlyPayment > 0) {
        year0TotalPayment = parsed.userMonthlyPayment;
        year0PIPayment = 0;
        year0OtherFees = parsed.userMonthlyPayment;
      } else {
        year0TotalPayment = 0;
        year0PIPayment = 0;
        year0OtherFees = 0;
      }
    }
    
    return {
      year: 0,
      actualYear: baseYear,
      balance: Math.round(initialPropertyValue * 100) / 100,
      realBalance: Math.round(initialPropertyValue * 100) / 100,
      mortgageBalance: Math.round(initialBalance * 100) / 100,
      monthlyPayment: Math.round(year0TotalPayment * 100) / 100,
      principalInterestPayment: Math.round(year0PIPayment * 100) / 100,
      otherFeesPayment: Math.round(year0OtherFees * 100) / 100,
      principalPaid: 0,
      interestPaid: 0,
      annualCashFlow: 0,
      annualRentalIncome: 0,
      // Enhanced expense breakdown
      maintenanceExpenses: 0,
      listingExpenses: 0,
      monthlyManagementExpenses: 0,
      totalRentalExpenses: 0
    };
  }

  private createPostSaleResult(year: number, baseYear: number): PropertyResult {
    return {
      year,
      actualYear: baseYear + year,
      balance: 0,
      realBalance: 0,
      mortgageBalance: 0,
      monthlyPayment: 0,
      principalInterestPayment: 0,
      otherFeesPayment: 0,
      principalPaid: 0,
      interestPaid: 0,
      annualCashFlow: 0,
      annualRentalIncome: 0,
      // Enhanced expense breakdown
      maintenanceExpenses: 0,
      listingExpenses: 0,
      monthlyManagementExpenses: 0,
      totalRentalExpenses: 0,
      isSaleYear: false,
      isPostSale: true
    };
  }

  private calculateProjection = (startingYear: number): PropertyResult[] => {
    const projections: PropertyResult[] = [];
    const baseYear = startingYear;
    
    // Use parsed inputs
    const parsed = this.parsedInputs;
    
    // Calculate initial values using parsed inputs
    const downPaymentAmount = parsed.purchasePrice * (parsed.downPaymentPercentage / 100);
    const loanAmount = parsed.purchasePrice - downPaymentAmount;
    
    const calculatedPIPayment = this.calculateMortgagePayment(loanAmount, parsed.interestRate, parsed.loanTerm);
    const totalMonthlyPayment = parsed.userMonthlyPayment > 0 ? parsed.userMonthlyPayment : calculatedPIPayment;
    const monthlyRate = parsed.interestRate / 100 / 12;
    
    // Add Year 0
    projections.push(this.createYear0Result(baseYear));
    
    // Track mortgage balance
    let remainingBalance = this.calculateInitialMortgageBalance();

    // Calculate year-by-year mortgage amortization for the investment period
    for (let year = 1; year <= parsed.years; year++) {
      // Check sale status
      const isSaleYear = this.isPlannedForSale && this.saleYear === year;
      const isPostSale = this.isPlannedForSale && this.saleYear && year > this.saleYear;
      
      // Handle post-sale years
      if (isPostSale) {
        projections.push(this.createPostSaleResult(year, baseYear));
        continue;
      }

      // Calculate months owned (partial year for sale)
      const monthsOwned = isSaleYear ? (this.inputs.saleConfig.saleMonth || 6) : 12;
      
      // Amortize mortgage for the year
      const preSaleMortgageBalance = remainingBalance;
      const amortization = this.amortizeMortgageYear(remainingBalance, monthlyRate, calculatedPIPayment, monthsOwned);
      remainingBalance = amortization.endingBalance;
      
      // Determine actual payments after mortgage payoff
      let actualTotalPayment = totalMonthlyPayment;
      let actualPIPayment = calculatedPIPayment;
      
      if (remainingBalance <= 0 && !isSaleYear) {
        if (parsed.userMonthlyPayment > 0) {
          actualTotalPayment = parsed.userMonthlyPayment;
          actualPIPayment = 0;
        } else {
          actualTotalPayment = 0;
          actualPIPayment = 0;
        }
      }

      // Calculate property value
      let propertyValue = this.calculatePropertyValue(year);
      const inflationFactor = Math.pow(1 + parsed.inflationRate / 100, year);

      // Calculate rental income and expenses
      const annualRentalIncome = this.calculateRentalIncome(year, monthsOwned);
      const annualRentalExpenses = this.calculateRentalExpenses(year, monthsOwned);
      
      // Handle sale calculations
      let saleProceeds = 0;
      let sellingCosts = 0;
      let grossSalePrice = 0;
      let netSaleProceeds = 0;
      let reinvestInLinked = false;
      
      if (isSaleYear) {
        grossSalePrice = this.effectiveSalePrice;
        sellingCosts = this.sellingCosts;
        netSaleProceeds = grossSalePrice - sellingCosts - remainingBalance;
        saleProceeds = this.netAfterTaxProceeds;
        
        reinvestInLinked = this.inputs.saleConfig.reinvestProceeds && 
                          this.inputs.saleConfig.targetInvestmentId === this.inputs.linkedInvestmentId;
        
        propertyValue = 0; // Property value becomes 0 after sale
      }

      // Calculate annual cash flow
      const annualCashFlow = this.calculateAnnualCashFlow(
        annualRentalIncome,
        annualRentalExpenses,
        actualTotalPayment,
        monthsOwned,
        saleProceeds,
        reinvestInLinked
      );

      // Create result
      const result: PropertyResult = {
        year,
        actualYear: baseYear + year,
        balance: Math.round(propertyValue * 100) / 100,
        realBalance: Math.round((propertyValue / inflationFactor) * 100) / 100,
        mortgageBalance: isSaleYear ? 0 : Math.round(remainingBalance * 100) / 100,
        monthlyPayment: isSaleYear ? 0 : Math.round(actualTotalPayment * 100) / 100,
        principalInterestPayment: isSaleYear ? 0 : Math.round(actualPIPayment * 100) / 100,
        otherFeesPayment: isSaleYear ? 0 : Math.round(Math.max(0, actualTotalPayment - actualPIPayment) * 100) / 100,
        principalPaid: Math.round(amortization.totalPrincipal * 100) / 100,
        interestPaid: Math.round(amortization.totalInterest * 100) / 100,
        annualCashFlow: Math.round(annualCashFlow * 100) / 100,
        annualRentalIncome: Math.round(annualRentalIncome * 100) / 100,
        // Enhanced expense breakdown
        maintenanceExpenses: Math.round(this.calculateMaintenanceExpenses(this.calculateEffectiveValues(year), monthsOwned) * 100) / 100,
        listingExpenses: Math.round(this.calculateListingExpenses(this.calculateEffectiveValues(year), monthsOwned) * 100) / 100,
        monthlyManagementExpenses: Math.round(this.calculateMonthlyManagementExpenses(this.calculateEffectiveValues(year), monthsOwned) * 100) / 100,
        totalRentalExpenses: Math.round(annualRentalExpenses * 100) / 100,
        isSaleYear,
        isPostSale: false
      };

      // Add sale-specific fields
      if (isSaleYear) {
        result.saleProceeds = Math.round(saleProceeds * 100) / 100;
        result.sellingCosts = Math.round(sellingCosts * 100) / 100;
        result.grossSalePrice = Math.round(grossSalePrice * 100) / 100;
        result.netSaleProceeds = Math.round(netSaleProceeds * 100) / 100;
        result.preSaleMortgageBalance = Math.round(preSaleMortgageBalance * 100) / 100;
      }

      projections.push(result);

      // Clear remaining balance after sale
      if (isSaleYear) {
        remainingBalance = 0;
      }
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
    // Return the calculated monthly payment, not the final year's payment
    // This is what the user would expect to see as their monthly payment
    const parsed = this.parsedInputs;
    
    if (parsed.userMonthlyPayment > 0) {
      return parsed.userMonthlyPayment;
    } else {
      return this.calculatedPrincipalInterestPayment;
    }
  }

  get remainingMortgageBalance() {
    return this.finalResult?.mortgageBalance || 0;
  }

  get calculatedPrincipalInterestPayment() {
    const parsed = this.parsedInputs;
    
    const downPaymentAmount = parsed.purchasePrice * (parsed.downPaymentPercentage / 100);
    const loanAmount = parsed.purchasePrice - downPaymentAmount;
    
    const calculatedPIPayment = this.calculateMortgagePayment(loanAmount, parsed.interestRate, parsed.loanTerm);
    return Math.round(calculatedPIPayment * 100) / 100;
  }

  get validationErrors(): string[] {
    return this.validateInputs();
  }

  private validateInputs(): string[] {
    const errors: string[] = [];
    
    // Basic validations
    errors.push(...this.validateBasicInputs());
    
    // Sale validations
    if (this.inputs.saleConfig.isPlannedForSale) {
      errors.push(...this.validateSaleConfiguration());
    }
    
    // Rental property validations
    if (this.inputs.isRentalProperty) {
      errors.push(...this.validateRentalInputs());
    }
    
    return errors;
  }

  private validateBasicInputs(): string[] {
    const errors: string[] = [];
    const yearsBought = parseInt(this.inputs.yearsBought || '0') || 0;
    const years = parseInt(this.portfolioStore?.years || '10') || 10;
    const currentEstimatedValue = parseFloat(this.inputs.currentEstimatedValue || '0') || 0;
    
    if (yearsBought < 0) {
      errors.push('Years bought cannot be negative');
    }
    if (yearsBought > years) {
      errors.push('Years bought cannot exceed projection years');
    }
    
    if (this.inputs.propertyGrowthModel === 'current_value' && currentEstimatedValue <= 0) {
      errors.push('Current estimated value must be positive when using current value growth model');
    }
    
    return errors;
  }

  private validateSaleConfiguration(): string[] {
    const errors: string[] = [];
    const years = parseInt(this.portfolioStore?.years || '10') || 10;
    const saleYear = this.inputs.saleConfig.saleYear;
    const saleMonth = this.inputs.saleConfig.saleMonth;
    const expectedSalePrice = this.inputs.saleConfig.expectedSalePrice;
    const sellingCostsPercentage = this.inputs.saleConfig.sellingCostsPercentage;
    
    // Validate sale year
    if (!saleYear || saleYear <= 0) {
      errors.push('Sale year must be specified and greater than 0');
    } else if (saleYear > years) {
      errors.push('Sale year must be between 1 and projection years');
    }
    
    // Validate sale month
    if (saleMonth < 1 || saleMonth > 12) {
      errors.push('Sale month must be between 1 and 12');
    }
    
    // Validate expected sale price
    if (!this.inputs.saleConfig.useProjectedValue) {
      if (!expectedSalePrice || expectedSalePrice <= 0) {
        errors.push('Expected sale price must be greater than $0');
      } else if (expectedSalePrice > 10000000) {
        errors.push('Expected sale price cannot exceed $10,000,000');
      }
    }
    
    // Validate selling costs
    if (sellingCostsPercentage < 0 || sellingCostsPercentage > 20) {
      errors.push('Selling costs must be between 0% and 20%');
    }
    
    // Validate reinvestment target
    if (this.inputs.saleConfig.reinvestProceeds && 
        !this.inputs.saleConfig.targetInvestmentId && 
        !this.inputs.linkedInvestmentId) {
      errors.push('Target investment must be selected when reinvesting proceeds');
    }
    
    // Warning conditions
    if (saleYear && saleYear <= 2) {
      errors.push('Selling shortly after purchase may incur additional costs and limit appreciation');
    }
    
    if (sellingCostsPercentage > 8) {
      errors.push('Selling costs exceed typical range of 6-8%');
    }
    
    // Check for underwater sale
    if (this.effectiveSalePrice > 0 && saleYear) {
      const netProceeds = this.netSaleProceeds;
      if (netProceeds < 0) {
        errors.push('Property sale will result in a loss after mortgage payoff and selling costs');
      }
    }
    
    return errors;
  }

  private validateRentalInputs(): string[] {
    const errors: string[] = [];
    const monthlyRent = parseFloat(this.inputs.monthlyRent || '0');
    const rentGrowthRate = parseFloat(this.inputs.rentGrowthRate || '0');
    const vacancyRate = parseFloat(this.inputs.vacancyRate || '0');
    // Enhanced expense model validation
    const maintenanceRate = parseFloat(this.inputs.maintenanceRate || '0');
    const listingFeeRate = parseFloat(this.inputs.listingFeeRate || '0');
    const monthlyManagementFeeRate = parseFloat(this.inputs.monthlyManagementFeeRate || '0');
    
    // Validate monthly rent
    if (monthlyRent <= 0) {
      errors.push('Monthly rent must be greater than $0');
    }
    if (monthlyRent > 50000) {
      errors.push('Monthly rent cannot exceed $50,000');
    }
    
    // Validate rent growth rate
    if (rentGrowthRate < -10) {
      errors.push('Rent growth rate cannot be less than -10%');
    }
    if (rentGrowthRate > 20) {
      errors.push('Rent growth rate cannot exceed 20%');
    }
    
    // Validate vacancy rate
    if (vacancyRate < 0) {
      errors.push('Vacancy rate cannot be negative');
    }
    if (vacancyRate > 50) {
      errors.push('Vacancy rate cannot exceed 50%');
    }
    
    // Validate maintenance rate
    if (maintenanceRate < 0) {
      errors.push('Maintenance rate cannot be negative');
    }
    if (maintenanceRate > 10) {
      errors.push('Maintenance rate cannot exceed 10% of property value');
    }
    
    // Validate property management fees (only if enabled)
    if (this.inputs.propertyManagementEnabled) {
      if (listingFeeRate < 0) {
        errors.push('Listing fee rate cannot be negative');
      }
      if (listingFeeRate > 200) {
        errors.push('Listing fee rate cannot exceed 200% of monthly rent');
      }
      
      if (monthlyManagementFeeRate < 0) {
        errors.push('Monthly management fee rate cannot be negative');
      }
      if (monthlyManagementFeeRate > 50) {
        errors.push('Monthly management fee rate cannot exceed 50% of rent');
      }
    }
    
    // Business logic validations - estimate total expenses for comparison
    const grossAnnualRent = monthlyRent * 12;
    const estimatedPropertyValue = parseFloat(this.inputs.purchasePrice || '500000') || 500000;
    const estimatedAnnualMaintenance = estimatedPropertyValue * (maintenanceRate / 100);
    const estimatedAnnualListing = this.inputs.propertyManagementEnabled ? 
      monthlyRent * (listingFeeRate / 100) * (vacancyRate / 100) : 0;
    const estimatedAnnualManagement = this.inputs.propertyManagementEnabled ?
      grossAnnualRent * (1 - vacancyRate / 100) * (monthlyManagementFeeRate / 100) : 0;
    const totalEstimatedExpenses = estimatedAnnualMaintenance + estimatedAnnualListing + estimatedAnnualManagement;
    
    if (totalEstimatedExpenses > grossAnnualRent * 2) {
      errors.push('Total estimated expenses seem unreasonably high compared to rental income');
    }
    
    if (totalEstimatedExpenses > grossAnnualRent * 0.8) {
      errors.push('Warning: Expenses exceed 80% of rental income, which may indicate unrealistic values');
    }
    
    return errors;
  }

  // Summary calculations for UI
  get summaryData() {
    const finalResult = this.finalResult;
    if (!finalResult || !this.hasResults) return null;

    const purchasePrice = parseFloat(this.inputs.purchasePrice || '0') || 0;
    if (purchasePrice <= 0) return null;
    const downPaymentPercentage = parseFloat(this.inputs.downPaymentPercentage || '20') || 20;
    const interestRate = parseFloat(this.inputs.interestRate || '0') || 0;
    const loanTerm = parseInt(this.inputs.loanTerm || '30') || 30;
    
    const downPaymentAmount = purchasePrice * (downPaymentPercentage / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const monthlyPayment = finalResult.monthlyPayment || this.calculatedPrincipalInterestPayment;
    const remainingBalance = finalResult.mortgageBalance || 0;
    const totalPaid = monthlyPayment * 12 * loanTerm;
    const totalInterest = totalPaid - loanAmount;
    const paidOff = remainingBalance === 0;
    
    // Get current year's cash flow
    const currentCashFlow = finalResult.annualCashFlow || 0;
    const monthlyCashFlow = currentCashFlow / 12;
    const isPositiveCashFlow = currentCashFlow > 0;

    return {
      purchasePrice,
      downPaymentPercentage,
      downPaymentAmount,
      loanAmount,
      interestRate,
      loanTerm,
      monthlyPayment,
      remainingBalance,
      totalPaid,
      totalInterest,
      paidOff,
      currentCashFlow,
      monthlyCashFlow,
      isPositiveCashFlow
    };
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
      showNetGain: this.showNetGain
    };
  }

  static fromJSON(data: { id: string; name: string; type: 'property'; enabled: boolean; inputs: Partial<PropertyInputs>; showBalance?: boolean; showContributions?: boolean; showNetGain?: boolean; }): Property {
    // Migrate old annualExpenses to maintenance rate if needed
    let migratedMaintenanceRate = '2';
    if ((data.inputs as any).annualExpenses && !data.inputs.maintenanceRate) {
      const oldExpenses = parseFloat((data.inputs as any).annualExpenses) || 8000;
      const purchasePrice = parseFloat(data.inputs.purchasePrice || '500000') || 500000;
      // Convert old flat expenses to maintenance rate percentage
      migratedMaintenanceRate = String(Math.min(10, Math.max(0.5, (oldExpenses / purchasePrice) * 100)));
    }

    // Handle backward compatibility for new fields
    const inputs = {
      ...data.inputs,
      propertyGrowthModel: data.inputs.propertyGrowthModel || 'purchase_price',
      currentEstimatedValue: data.inputs.currentEstimatedValue || '',
      // Rental property backward compatibility
      isRentalProperty: data.inputs.isRentalProperty ?? false,
      monthlyRent: data.inputs.monthlyRent || '2000',
      rentGrowthRate: data.inputs.rentGrowthRate || '3',
      vacancyRate: data.inputs.vacancyRate || '5',
      // Enhanced expense model with backward compatibility
      maintenanceRate: data.inputs.maintenanceRate || migratedMaintenanceRate,
      propertyManagementEnabled: data.inputs.propertyManagementEnabled ?? false,
      listingFeeRate: data.inputs.listingFeeRate || '100',
      monthlyManagementFeeRate: data.inputs.monthlyManagementFeeRate || '10',
      // Sale configuration backward compatibility
      saleConfig: {
        isPlannedForSale: false,
        saleYear: null,
        expectedSalePrice: null,
        useProjectedValue: true,
        sellingCostsPercentage: 7,
        reinvestProceeds: true,
        targetInvestmentId: null,
        saleMonth: 6,
        capitalImprovements: '',
        originalBuyingCosts: '',
        // Tax profile backward compatibility
        filingStatus: 'single' as FilingStatus,
        annualIncome: '75000',
        state: 'CA',
        enableStateTax: false,
        otherCapitalGains: '',
        carryoverLosses: '',
        ...data.inputs.saleConfig
      } as PropertySaleConfig
    };
    
    const property = new Property(data.name, inputs);
    property.id = data.id;
    property.enabled = data.enabled;
    property.showBalance = data.showBalance ?? true;
    property.showContributions = data.showContributions ?? true;
    property.showNetGain = data.showNetGain ?? true;
    return property;
  }
}