import { Property } from '@/features/property/stores/Property';

describe('Property - Rental Features', () => {
  it('should have rental property defaults when enabled', () => {
    const property = new Property('Rental Property', {
      isRentalProperty: true
    });

    expect(property.inputs.isRentalProperty).toBe(true);
    expect(property.inputs.monthlyRent).toBe('2000');
    expect(property.inputs.rentGrowthRate).toBe('3');
    expect(property.inputs.vacancyRate).toBe('5');
    expect(property.inputs.annualExpenses).toBe('8000');
    expect(property.inputs.expenseGrowthRate).toBe('3');
  });

  it('should calculate positive cash flow for profitable rental property', () => {
    const property = new Property('Profitable Rental', {
      purchasePrice: '300000',  // Lower purchase price for better cash flow
      downPaymentPercentage: '25',
      interestRate: '6',
      loanTerm: '30',
      isRentalProperty: true,
      monthlyRent: '3000',     // $3000/month = $36k/year
      rentGrowthRate: '3',
      vacancyRate: '5',        // 5% vacancy
      annualExpenses: '8000',  // $8k/year expenses (lower)
      expenseGrowthRate: '2'   // Lower expense growth
    });
    property.portfolioStore = { years: '5' };

    expect(property.hasResults).toBe(true);
    const year1 = property.results[1];
    
    // Calculate expected cash flow for year 1 (with growth applied)
    const grownMonthlyRent = 3000 * Math.pow(1 + 3/100, 1); // 3% growth in year 1
    const expectedRentalIncome = grownMonthlyRent * 12 * 0.95; // with 5% vacancy
    const grownExpenses = 8000 * Math.pow(1 + 2/100, 1); // 2% growth in year 1
    const expectedMortgagePayment = year1.monthlyPayment * 12;
    const expectedCashFlow = expectedRentalIncome - grownExpenses - expectedMortgagePayment;
    
    expect(year1.annualCashFlow).toBeCloseTo(expectedCashFlow, 0);
    expect(year1.annualCashFlow).toBeGreaterThan(0); // Should be positive cash flow
  });

  it('should calculate negative cash flow for unprofitable rental property', () => {
    const property = new Property('Unprofitable Rental', {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '7',
      loanTerm: '30',
      isRentalProperty: true,
      monthlyRent: '1500',     // $1500/month = $18k/year (low rent)
      rentGrowthRate: '2',
      vacancyRate: '10',       // 10% vacancy
      annualExpenses: '15000', // $15k/year expenses (high)
      expenseGrowthRate: '4'
    });
    property.portfolioStore = { years: '3' };

    const year1 = property.results[1];
    
    // Calculate expected cash flow for year 1 (with growth applied)
    const grownMonthlyRent = 1500 * Math.pow(1 + 2/100, 1); // 2% growth in year 1
    const expectedRentalIncome = grownMonthlyRent * 12 * 0.9; // with 10% vacancy
    const grownExpenses = 15000 * Math.pow(1 + 4/100, 1); // 4% growth in year 1
    const expectedMortgagePayment = year1.monthlyPayment * 12;
    const expectedCashFlow = expectedRentalIncome - grownExpenses - expectedMortgagePayment;
    
    expect(year1.annualCashFlow).toBeCloseTo(expectedCashFlow, 0);
    expect(year1.annualCashFlow).toBeLessThan(0); // Should be negative cash flow
  });

  it('should calculate cash flow growth over time', () => {
    const property = new Property('Growing Rental', {
      purchasePrice: '400000',
      downPaymentPercentage: '25',
      interestRate: '6',
      loanTerm: '30',
      isRentalProperty: true,
      monthlyRent: '2500',
      rentGrowthRate: '4',     // 4% annual rent growth
      vacancyRate: '5',
      annualExpenses: '10000',
      expenseGrowthRate: '2'   // 2% annual expense growth
    });
    property.portfolioStore = { years: '5' };

    const year1 = property.results[1];
    const year3 = property.results[3];
    const year5 = property.results[5];

    // Cash flow should generally increase over time due to higher rent growth vs expense growth
    // (4% rent growth vs 2% expense growth)
    expect(year3.annualCashFlow).toBeGreaterThan(year1.annualCashFlow);
    expect(year5.annualCashFlow).toBeGreaterThan(year3.annualCashFlow);
  });

  it('should handle rental property validation correctly', () => {
    const property = new Property('Rental with Issues', {
      isRentalProperty: true,
      monthlyRent: '0',        // Invalid: too low
      rentGrowthRate: '25',    // Invalid: too high
      vacancyRate: '60',       // Invalid: too high
      annualExpenses: '-1000', // Invalid: negative
      expenseGrowthRate: '20'  // Invalid: too high
    });

    const errors = property.validationErrors;
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('Monthly rent must be greater than $0');
    expect(errors).toContain('Rent growth rate cannot exceed 20%');
    expect(errors).toContain('Vacancy rate cannot exceed 50%');
    expect(errors).toContain('Annual expenses cannot be negative');
    expect(errors).toContain('Expense growth rate cannot exceed 15%');
  });

  it('should validate realistic rent-to-expense ratios', () => {
    const property = new Property('Unrealistic Rental', {
      isRentalProperty: true,
      monthlyRent: '1000',     // $12k/year
      annualExpenses: '30000'  // $30k/year expenses (250% of rent!)
    });

    const errors = property.validationErrors;
    expect(errors.some(error => error.includes('unreasonably high'))).toBe(true);
  });

  it('should warn about high expense ratios', () => {
    const property = new Property('High Expense Rental', {
      isRentalProperty: true,
      monthlyRent: '2000',     // $24k/year
      annualExpenses: '20000'  // $20k/year expenses (83% of rent)
    });

    const errors = property.validationErrors;
    expect(errors.some(error => error.includes('exceed 80%'))).toBe(true);
  });

  it('should handle mortgage payoff with rental property', () => {
    const property = new Property('Rental with Short Loan', {
      purchasePrice: '200000',
      downPaymentPercentage: '50',  // High down payment for faster payoff
      interestRate: '5',
      loanTerm: '10',              // Short loan term
      isRentalProperty: true,
      monthlyRent: '2000',
      rentGrowthRate: '3',
      vacancyRate: '5',
      annualExpenses: '8000',
      expenseGrowthRate: '2'
    });
    property.portfolioStore = { years: '15' };

    // Find when mortgage is paid off
    const paidOffYear = property.results.find(result => result.mortgageBalance === 0);
    expect(paidOffYear).toBeDefined();
    expect(paidOffYear!.year).toBeLessThanOrEqual(10);

    // After payoff, cash flow should increase (no more mortgage payments)
    const yearBeforePayoff = property.results[paidOffYear!.year - 1];
    const yearAfterPayoff = property.results[paidOffYear!.year + 1];
    
    if (yearAfterPayoff) {
      expect(yearAfterPayoff.annualCashFlow).toBeGreaterThan(yearBeforePayoff.annualCashFlow);
    }
  });

  it('should backward compatibility with non-rental properties', () => {
    const property = new Property('Non-Rental Property', {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '7',
      loanTerm: '30',
      isRentalProperty: false // Explicitly non-rental
    });
    property.portfolioStore = { years: '5' };

    const year1 = property.results[1];
    
    // For non-rental properties, cash flow should be negative mortgage payment
    const expectedCashFlow = -(year1.monthlyPayment * 12);
    expect(year1.annualCashFlow).toBeCloseTo(expectedCashFlow, 0);
    expect(year1.annualCashFlow).toBeLessThan(0); // Always negative for non-rental
  });

  it('should properly serialize and deserialize rental property data', () => {
    const originalProperty = new Property('Rental Property', {
      isRentalProperty: true,
      monthlyRent: '2500',
      rentGrowthRate: '4',
      vacancyRate: '7',
      annualExpenses: '12000',
      expenseGrowthRate: '3'
    });

    const serialized = originalProperty.toJSON();
    const deserializedProperty = Property.fromJSON(serialized);

    expect(deserializedProperty.inputs.isRentalProperty).toBe(true);
    expect(deserializedProperty.inputs.monthlyRent).toBe('2500');
    expect(deserializedProperty.inputs.rentGrowthRate).toBe('4');
    expect(deserializedProperty.inputs.vacancyRate).toBe('7');
    expect(deserializedProperty.inputs.annualExpenses).toBe('12000');
    expect(deserializedProperty.inputs.expenseGrowthRate).toBe('3');
  });
});