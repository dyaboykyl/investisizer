import { makeAutoObservable, computed } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { type BaseAsset, type BaseCalculationResult } from '@/features/shared/types/BaseAsset';

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
}

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
  propertyGrowthModel: PropertyGrowthModel; // Choose between purchase_price or current_value growth
  currentEstimatedValue: string; // Current estimated value for current_value growth model
  // Rental property fields
  isRentalProperty: boolean; // Enable rental property calculations
  monthlyRent: string; // Monthly rental income
  rentGrowthRate: string; // Annual rent growth rate percentage
  vacancyRate: string; // Expected vacancy rate percentage
  annualExpenses: string; // Total annual expenses (maintenance, taxes, insurance, etc.)
  expenseGrowthRate: string; // Annual expense growth rate percentage
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
  annualRentalExpenses: number; // Annual rental expenses
  
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
      years: '10',
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
      annualExpenses: '8000', // Default annual expenses
      expenseGrowthRate: '3', // Default expense growth rate
      // Sale configuration defaults
      saleConfig: {
        isPlannedForSale: false,
        saleYear: null,
        expectedSalePrice: null,
        useProjectedValue: true,
        sellingCostsPercentage: 7,  // 7% default
        reinvestProceeds: true,
        targetInvestmentId: null,
        saleMonth: 6  // Mid-year default
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
      netSaleProceeds: computed
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
      const years = parseInt(this.inputs.years || '10') || 10;
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
    
    // Use existing property growth calculation
    const purchasePrice = parseFloat(this.inputs.purchasePrice || '0') || 0;
    const propertyGrowthRate = parseFloat(this.inputs.propertyGrowthRate || '0') || 0;
    const yearsBought = parseInt(this.inputs.yearsBought || '0') || 0;
    
    if (this.inputs.propertyGrowthModel === 'current_value') {
      const currentEstimatedValue = parseFloat(this.inputs.currentEstimatedValue || '0') || 0;
      return currentEstimatedValue * Math.pow(1 + propertyGrowthRate / 100, this.saleYear);
    } else {
      return purchasePrice * Math.pow(1 + propertyGrowthRate / 100, yearsBought + this.saleYear);
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

  private calculateMortgageBalanceAtYear(targetYear: number): number {
    const purchasePrice = parseFloat(this.inputs.purchasePrice || '0') || 0;
    const downPaymentPercentage = parseFloat(this.inputs.downPaymentPercentage || '20') || 20;
    const interestRate = parseFloat(this.inputs.interestRate || '0') || 0;
    const yearsBought = parseInt(this.inputs.yearsBought || '0') || 0;
    
    const downPaymentAmount = purchasePrice * (downPaymentPercentage / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const monthlyRate = interestRate / 100 / 12;
    
    // Calculate P+I payment
    const loanTerm = parseInt(this.inputs.loanTerm || '30') || 30;
    const numPayments = loanTerm * 12;
    const calculatedPIPayment = loanAmount > 0 ?
      loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1) : 0;

    // Calculate balance after all payments up to target year
    let remainingBalance = loanAmount;
    const totalYears = yearsBought + targetYear;
    
    for (let year = 1; year <= totalYears && remainingBalance > 0; year++) {
      for (let month = 1; month <= 12 && remainingBalance > 0; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(calculatedPIPayment - interestPayment, remainingBalance);
        remainingBalance -= principalPayment;
      }
    }
    
    return remainingBalance;
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

    // Calculate initial property value based on growth model
    let initialPropertyValue: number;
    if (this.inputs.propertyGrowthModel === 'current_value') {
      // Use current estimated value as the base
      const currentEstimatedValue = parseFloat(this.inputs.currentEstimatedValue || '0') || 0;
      initialPropertyValue = currentEstimatedValue;
    } else {
      // Default: grow from purchase price
      initialPropertyValue = purchasePrice * Math.pow(1 + propertyGrowthRate / 100, yearsBought);
    }
    
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
      interestPaid: 0,
      annualCashFlow: 0, // No cash flow in year 0
      annualRentalIncome: 0, // No rental income in year 0
      annualRentalExpenses: 0 // No rental expenses in year 0
    });

    // Calculate year-by-year mortgage amortization for the investment period
    for (let year = 1; year <= investmentYears; year++) {
      // Check if this is the sale year
      const isSaleYear = this.isPlannedForSale && this.saleYear === year;
      const isPostSale = this.isPlannedForSale && this.saleYear && year > this.saleYear;
      
      // Skip calculations for post-sale years
      if (isPostSale) {
        projections.push({
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
          annualRentalExpenses: 0,
          isSaleYear: false,
          isPostSale: true
        });
        continue;
      }

      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      let monthsOwned = 12; // Default to full year

      // Handle partial year calculations for sale year
      if (isSaleYear) {
        const saleMonth = this.inputs.saleConfig.saleMonth || 6;
        monthsOwned = saleMonth; // Property owned for this many months
      }

      // Calculate monthly payments for months owned (using P+I only for mortgage balance)
      for (let month = 1; month <= monthsOwned && remainingBalance > 0; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(calculatedPIPayment - interestPayment, remainingBalance);

        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        remainingBalance -= principalPayment;
      }
      
      // Determine actual payments after mortgage payoff
      let actualTotalPayment = totalMonthlyPayment;
      let actualPIPayment = calculatedPIPayment;
      
      if (remainingBalance <= 0 && !isSaleYear) {
        // Mortgage is paid off (but not due to sale)
        if (userMonthlyPayment > 0) {
          // Custom payment: continue paying the custom amount
          actualTotalPayment = userMonthlyPayment;
          actualPIPayment = 0; // No more P+I
        } else {
          // Standard payment: stop paying when mortgage is paid off
          actualTotalPayment = 0;
          actualPIPayment = 0;
        }
      }

      // Calculate property value appreciation based on growth model
      let propertyValue: number;
      if (this.inputs.propertyGrowthModel === 'current_value') {
        // Grow from current estimated value
        const currentEstimatedValue = parseFloat(this.inputs.currentEstimatedValue || '0') || 0;
        propertyValue = currentEstimatedValue * Math.pow(1 + propertyGrowthRate / 100, year);
      } else {
        // Default: grow from purchase price
        const totalYearsSinceOwnership = yearsBought + year;
        propertyValue = purchasePrice * Math.pow(1 + propertyGrowthRate / 100, totalYearsSinceOwnership);
      }
      const inflationFactor = Math.pow(1 + inflationRate / 100, year);

      // Calculate annual cash flow and rental components
      let annualCashFlow: number;
      let annualRentalIncome: number = 0;
      let annualRentalExpenses: number = 0;
      
      if (this.inputs.isRentalProperty && !isPostSale) {
        // Rental property: calculate net cash flow (prorated if sale year)
        const rentGrowthRate = parseFloat(this.inputs.rentGrowthRate || '0') || 0;
        const vacancyRate = parseFloat(this.inputs.vacancyRate || '0') || 0;
        const expenseGrowthRate = parseFloat(this.inputs.expenseGrowthRate || '0') || 0;
        
        // Calculate rental income with growth and vacancy
        const baseMonthlyRent = parseFloat(this.inputs.monthlyRent || '0') || 0;
        const monthlyRent = baseMonthlyRent * Math.pow(1 + rentGrowthRate / 100, year);
        const grossAnnualRent = monthlyRent * monthsOwned; // Prorated for sale year
        annualRentalIncome = grossAnnualRent * (1 - vacancyRate / 100);
        
        // Calculate expenses with growth
        const baseAnnualExpenses = parseFloat(this.inputs.annualExpenses || '0') || 0;
        const fullYearExpenses = baseAnnualExpenses * Math.pow(1 + expenseGrowthRate / 100, year);
        annualRentalExpenses = fullYearExpenses * (monthsOwned / 12); // Prorated for sale year
        
        // Calculate net cash flow: income - expenses - mortgage payments
        const annualMortgagePayment = actualTotalPayment * monthsOwned;
        annualCashFlow = annualRentalIncome - annualRentalExpenses - annualMortgagePayment;
      } else if (!isPostSale) {
        // Non-rental property: cash flow is negative mortgage payment
        annualCashFlow = -(actualTotalPayment * monthsOwned);
      } else {
        // Post-sale: no cash flow
        annualCashFlow = 0;
      }

      // Sale calculations
      let saleProceeds = 0;
      let sellingCosts = 0;
      let grossSalePrice = 0;
      let netSaleProceeds = 0;

      // Store pre-sale mortgage balance
      const preSaleMortgageBalance = remainingBalance;
      
      if (isSaleYear) {
        // Calculate sale proceeds
        grossSalePrice = this.effectiveSalePrice;
        sellingCosts = this.sellingCosts;
        netSaleProceeds = grossSalePrice - sellingCosts - remainingBalance;
        saleProceeds = netSaleProceeds;
        
        // Only add sale proceeds to cash flow if they're being reinvested into the linked investment
        if (this.inputs.saleConfig.reinvestProceeds && 
            this.inputs.saleConfig.targetInvestmentId === this.inputs.linkedInvestmentId) {
          annualCashFlow += saleProceeds;
        }
        
        // Property value becomes 0 after sale
        propertyValue = 0;
      }

      const result: PropertyResult = {
        year,
        actualYear: baseYear + year,
        balance: Math.round(propertyValue * 100) / 100,
        realBalance: Math.round((propertyValue / inflationFactor) * 100) / 100,
        mortgageBalance: isSaleYear ? 0 : Math.round(remainingBalance * 100) / 100,
        monthlyPayment: isSaleYear ? 0 : Math.round(actualTotalPayment * 100) / 100,
        principalInterestPayment: isSaleYear ? 0 : Math.round(actualPIPayment * 100) / 100,
        otherFeesPayment: isSaleYear ? 0 : Math.round(Math.max(0, actualTotalPayment - actualPIPayment) * 100) / 100,
        principalPaid: Math.round(yearlyPrincipal * 100) / 100,
        interestPaid: Math.round(yearlyInterest * 100) / 100,
        annualCashFlow: Math.round(annualCashFlow * 100) / 100,
        annualRentalIncome: Math.round(annualRentalIncome * 100) / 100,
        annualRentalExpenses: Math.round(annualRentalExpenses * 100) / 100,
        isSaleYear,
        isPostSale: false
      };

      // Add sale-specific fields only for sale year
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
    const userMonthlyPayment = this.inputs.monthlyPayment && this.inputs.monthlyPayment !== '' ? 
      parseFloat(this.inputs.monthlyPayment) : 0;
    
    if (userMonthlyPayment > 0) {
      return userMonthlyPayment;
    } else {
      return this.calculatedPrincipalInterestPayment;
    }
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

  get validationErrors(): string[] {
    const errors: string[] = [];
    const yearsBought = parseInt(this.inputs.yearsBought || '0') || 0;
    const years = parseInt(this.inputs.years || '0') || 0;
    const currentEstimatedValue = parseFloat(this.inputs.currentEstimatedValue || '0') || 0;
    
    // Validate yearsBought
    if (yearsBought < 0) {
      errors.push('Years bought cannot be negative');
    }
    if (yearsBought > years) {
      errors.push('Years bought cannot exceed projection years');
    }
    
    // Validate current estimated value when using current value growth model
    if (this.inputs.propertyGrowthModel === 'current_value' && currentEstimatedValue <= 0) {
      errors.push('Current estimated value must be positive when using current value growth model');
    }
    
    // Sale configuration validations
    if (this.inputs.saleConfig.isPlannedForSale) {
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
      
      // Validate expected sale price if not using projected value
      if (!this.inputs.saleConfig.useProjectedValue) {
        if (!expectedSalePrice || expectedSalePrice <= 0) {
          errors.push('Expected sale price must be greater than $0');
        } else if (expectedSalePrice > 10000000) {
          errors.push('Expected sale price cannot exceed $10,000,000');
        }
      }
      
      // Validate selling costs percentage
      if (sellingCostsPercentage < 0 || sellingCostsPercentage > 20) {
        errors.push('Selling costs must be between 0% and 20%');
      }
      
      // Business logic validations for sale
      if (saleYear && saleYear <= yearsBought) {
        errors.push(`Sale year (${saleYear}) must be after years already owned (${yearsBought})`);
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
      
      // Check for underwater sale (property value < mortgage + costs)
      if (this.effectiveSalePrice > 0 && saleYear) {
        const netProceeds = this.netSaleProceeds;
        if (netProceeds < 0) {
          errors.push('Property sale will result in a loss after mortgage payoff and selling costs');
        }
      }
    }
    
    // Rental property validations
    if (this.inputs.isRentalProperty) {
      const monthlyRent = parseFloat(this.inputs.monthlyRent || '0');
      const rentGrowthRate = parseFloat(this.inputs.rentGrowthRate || '0');
      const vacancyRate = parseFloat(this.inputs.vacancyRate || '0');
      const annualExpenses = parseFloat(this.inputs.annualExpenses || '0');
      const expenseGrowthRate = parseFloat(this.inputs.expenseGrowthRate || '0');
      
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
      
      // Validate annual expenses
      if (annualExpenses < 0) {
        errors.push('Annual expenses cannot be negative');
      }
      if (annualExpenses > 100000) {
        errors.push('Annual expenses cannot exceed $100,000');
      }
      
      // Validate expense growth rate
      if (expenseGrowthRate < 0) {
        errors.push('Expense growth rate cannot be negative');
      }
      if (expenseGrowthRate > 15) {
        errors.push('Expense growth rate cannot exceed 15%');
      }
      
      // Business logic validations
      const grossAnnualRent = monthlyRent * 12;
      if (annualExpenses > grossAnnualRent * 2) {
        errors.push('Annual expenses seem unreasonably high compared to rental income');
      }
      
      // Check for realistic rent-to-expense ratio
      if (annualExpenses > grossAnnualRent * 0.8) {
        errors.push('Warning: Expenses exceed 80% of rental income, which may indicate unrealistic values');
      }
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
      annualExpenses: data.inputs.annualExpenses || '8000',
      expenseGrowthRate: data.inputs.expenseGrowthRate || '3',
      // Sale configuration backward compatibility
      saleConfig: data.inputs.saleConfig || {
        isPlannedForSale: false,
        saleYear: null,
        expectedSalePrice: null,
        useProjectedValue: true,
        sellingCostsPercentage: 7,
        reinvestProceeds: true,
        targetInvestmentId: null,
        saleMonth: 6
      }
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