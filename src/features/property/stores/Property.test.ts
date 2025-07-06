import { Property } from '@/features/property/stores/Property';

describe('Property', () => {
  it('should create a property with default values', () => {
    const property = new Property();

    expect(property.name).toBe('New Property');
    expect(property.type).toBe('property');
    expect(property.enabled).toBe(true);
    expect(property.inputs.purchasePrice).toBe('500000');
    expect(property.inputs.downPaymentPercentage).toBe('20');
    expect(property.inputs.interestRate).toBe('7');
    expect(property.inputs.loanTerm).toBe('30');
    expect(property.inputs.years).toBe('10');
    expect(property.inputs.inflationRate).toBe('2.5');
    expect(property.inputs.yearsBought).toBe('0');
    expect(property.inputs.propertyGrowthRate).toBe('3');
  });

  it('should create a property with custom values', () => {
    const property = new Property('My House', {
      purchasePrice: '750000',
      downPaymentPercentage: '20',
      interestRate: '6.5',
      loanTerm: '15',
      years: '5',
      inflationRate: '3'
    });

    expect(property.name).toBe('My House');
    expect(property.inputs.purchasePrice).toBe('750000');
    expect(property.inputs.downPaymentPercentage).toBe('20');
    expect(property.inputs.interestRate).toBe('6.5');
    expect(property.inputs.loanTerm).toBe('15');
    expect(property.inputs.years).toBe('5');
    expect(property.inputs.inflationRate).toBe('3');
  });

  it('should calculate mortgage projections correctly', () => {
    const property = new Property('Test Property', {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '7',
      loanTerm: '30',
      years: '10',
      inflationRate: '2.5'
    });

    expect(property.hasResults).toBe(true);
    expect(property.results.length).toBe(11); // Year 0 + 10 years

    const year0 = property.results[0];
    expect(year0.year).toBe(0);
    expect(year0.mortgageBalance).toBe(400000); // 500k - 100k (20%) down payment
    expect(year0.principalPaid).toBe(0);
    expect(year0.interestPaid).toBe(0);

    const year1 = property.results[1];
    expect(year1.year).toBe(1);
    expect(year1.mortgageBalance).toBeLessThan(400000); // Should decrease
    expect(year1.principalPaid).toBeGreaterThan(0);
    expect(year1.interestPaid).toBeGreaterThan(0);
    expect(year1.monthlyPayment).toBeGreaterThan(0);

    const finalResult = property.finalResult;
    expect(finalResult?.year).toBe(10);
    expect(finalResult?.mortgageBalance).toBeGreaterThan(0); // Should still have balance after 10 years of 30-year loan
    expect(finalResult?.mortgageBalance).toBeLessThan(400000); // But less than original
  });

  it('should calculate monthly payment correctly', () => {
    const property = new Property('Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '10'
    });

    const loanAmount = 320000; // 400k - 80k (20%)
    const monthlyRate = 0.06 / 12; // 6% annual = 0.5% monthly
    const numPayments = 30 * 12; // 360 payments
    
    // Standard mortgage formula
    const expectedMonthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    expect(property.monthlyPayment).toBeCloseTo(expectedMonthlyPayment, 2);
  });

  it('should calculate balance for investment period only', () => {
    const property = new Property('Test Property', {
      purchasePrice: '300000',
      downPaymentPercentage: '20',
      interestRate: '5',
      loanTerm: '30',
      years: '10' // Investment period is 10 years
    });

    const finalResult = property.finalResult;
    expect(finalResult?.year).toBe(10); // Should only project for 10 years
    expect(finalResult?.mortgageBalance).toBeGreaterThan(0); // Should still have balance after 10 years of 30-year loan
  });

  it('should handle zero down payment', () => {
    const property = new Property('Test Property', {
      purchasePrice: '200000',
      downPaymentPercentage: '0',
      interestRate: '6.5',
      loanTerm: '30',
      years: '5',
      yearsBought: '0',
      propertyGrowthRate: '0'
    });

    const year0 = property.results[0];
    expect(year0.mortgageBalance).toBe(200000); // Full purchase price as loan amount
    expect(year0.balance).toBe(200000); // Property value should equal purchase price with 0% growth
    
    const year1 = property.results[1];
    expect(year1.monthlyPayment).toBeGreaterThan(0);
    expect(year1.mortgageBalance).toBeLessThan(200000);
  });

  it('should update inputs and recalculate', () => {
    const property = new Property();
    const initialBalance = property.remainingMortgageBalance;

    property.updateInput('interestRate', '5');
    const newBalance = property.remainingMortgageBalance;

    expect(property.inputs.interestRate).toBe('5');
    // Lower interest rate should result in lower remaining balance after same period
    expect(newBalance).toBeLessThan(initialBalance);
  });

  it('should serialize and deserialize correctly', () => {
    const original = new Property('Test Property', {
      purchasePrice: '600000',
      downPaymentPercentage: '20',
      interestRate: '6.5',
      loanTerm: '25',
      years: '15',
      inflationRate: '3'
    });
    original.setShowBalance(false);
    original.setShowContributions(false);

    const json = original.toJSON();
    const restored = Property.fromJSON(json);

    expect(restored.name).toBe(original.name);
    expect(restored.type).toBe(original.type);
    expect(restored.enabled).toBe(original.enabled);
    expect(restored.inputs).toEqual(original.inputs);
    expect(restored.showBalance).toBe(original.showBalance);
    expect(restored.showContributions).toBe(original.showContributions);
  });

  it('should handle different loan terms', () => {
    const property15 = new Property('15 Year Loan', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '15',
      years: '15'
    });

    const property30 = new Property('30 Year Loan', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '15'
    });

    // 15-year loan should have higher monthly payment
    expect(property15.monthlyPayment).toBeGreaterThan(property30.monthlyPayment);
    
    // But lower remaining balance after 15 years (should be 0 for 15-year loan)
    expect(property15.remainingMortgageBalance).toBe(0);
    expect(property30.remainingMortgageBalance).toBeGreaterThan(0);
  });

  it('should handle different property growth models', () => {
    // Test case from the prompt:
    // Purchase price $400k, 3 years ago, 3% growth:
    // - Purchase price model: $400k × (1.03)^(3+year)  
    // - Current value model: $450k × (1.03)^year
    
    const propertyPurchasePrice = new Property('Purchase Price Growth', {
      purchasePrice: '400000',
      yearsBought: '3',
      propertyGrowthRate: '3',
      years: '2',
      propertyGrowthModel: 'purchase_price'
    });

    const propertyCurrentValue = new Property('Current Value Growth', {
      purchasePrice: '400000',
      yearsBought: '3',
      propertyGrowthRate: '3',
      years: '2',
      propertyGrowthModel: 'current_value',
      currentEstimatedValue: '450000'
    });

    // Purchase price model: $400k × (1.03)^(3+1) = $400k × 1.125509 = $450,204
    const purchasePriceYear1 = propertyPurchasePrice.results[1];
    expect(purchasePriceYear1.balance).toBeCloseTo(450204, 0);

    // Current value model: $450k × (1.03)^1 = $450k × 1.03 = $463,500
    const currentValueYear1 = propertyCurrentValue.results[1];
    expect(currentValueYear1.balance).toBeCloseTo(463500, 0);
    
    // Current value model should grow from the estimated value, not purchase price
    expect(currentValueYear1.balance).toBeGreaterThan(purchasePriceYear1.balance);
  });

  it('should calculate real values with inflation', () => {
    const property = new Property('Test Property', {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '7',
      loanTerm: '30',
      years: '5',
      inflationRate: '3'
    });

    const year5 = property.results[5];
    expect(year5.realBalance).toBeLessThan(year5.balance); // Real value should be less due to inflation
  });

  it('should account for years ago bought in mortgage balance', () => {
    // Property bought 5 years ago, analyzing next 10 years
    const property = new Property('Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '10',
      yearsBought: '5',
      propertyGrowthRate: '0'
    });

    // Compare with same property just purchased
    const newProperty = new Property('New Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '10',
      yearsBought: '0',
      propertyGrowthRate: '0'
    });

    const year0Old = property.results[0];
    const year0New = newProperty.results[0];

    // Property owned for 5 years should have lower mortgage balance
    expect(year0Old.mortgageBalance).toBeLessThan(year0New.mortgageBalance);
    
    // Year 10 for old property should be like year 15 for new property
    const year10Old = property.results[10];
    const year15New = newProperty.results[10]; // This is actually year 10 of new property
    
    // After 10 more years, the 5-year head start should show significant difference
    expect(year10Old.mortgageBalance).toBeLessThan(year15New.mortgageBalance);
  });

  it('should handle editable monthly payment', () => {
    const property = new Property('Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '5',
      monthlyPayment: '2500' // Higher than calculated P+I
    });

    const finalResult = property.finalResult;
    expect(finalResult?.monthlyPayment).toBe(2500);
    expect(finalResult?.principalInterestPayment).toBeLessThan(2500); // P+I should be less than total
    expect(finalResult?.otherFeesPayment).toBeGreaterThan(0); // Should have other fees
    expect(finalResult?.otherFeesPayment).toBe(2500 - (finalResult?.principalInterestPayment || 0));
  });

  it('should autopopulate monthly payment with calculated P+I', () => {
    const property = new Property('Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '5'
      // monthlyPayment not specified - should default to empty string
    });

    // The calculatedPrincipalInterestPayment should be available
    expect(property.calculatedPrincipalInterestPayment).toBeGreaterThan(0);
    expect(property.calculatedPrincipalInterestPayment).toBeCloseTo(1918.56, 0);
    
    // The monthly payment in results should use calculated P+I when input is empty
    expect(property.finalResult?.monthlyPayment).toBe(property.calculatedPrincipalInterestPayment);
    expect(property.finalResult?.principalInterestPayment).toBe(property.calculatedPrincipalInterestPayment);
    expect(property.finalResult?.otherFeesPayment).toBe(0);
  });

  it('should handle linkedInvestmentId field', () => {
    const property = new Property('Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '5',
      linkedInvestmentId: 'test-investment-id'
    });

    expect(property.inputs.linkedInvestmentId).toBe('test-investment-id');
    
    // Should default to empty string when not specified
    const property2 = new Property('Test Property 2');
    expect(property2.inputs.linkedInvestmentId).toBe('');
  });

  it('should calculate mortgage balance using P+I only, not total payment', () => {
    // Create two identical properties - one with higher total payment
    const propertyPI = new Property('P+I Only', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '10',
      monthlyPayment: '' // Will use calculated P+I
    });

    const propertyTotal = new Property('Higher Total', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '10',
      monthlyPayment: '2500' // Much higher than P+I
    });

    // Mortgage balance should be the same for both properties
    // because it only considers P+I payments, not total payment
    const finalPI = propertyPI.finalResult;
    const finalTotal = propertyTotal.finalResult;

    expect(finalPI?.mortgageBalance).toBe(finalTotal?.mortgageBalance);
    expect(finalPI?.principalInterestPayment).toBe(finalTotal?.principalInterestPayment);
    
    // But total monthly payments should be different
    expect(finalPI?.monthlyPayment).toBeLessThan(finalTotal?.monthlyPayment || 0);
    
    // And other fees should be different
    expect(finalPI?.otherFeesPayment).toBe(0);
    expect(finalTotal?.otherFeesPayment).toBeGreaterThan(0);
  });

  describe('Rental Property Features', () => {
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
        years: '5',
        isRentalProperty: true,
        monthlyRent: '3000',     // $3000/month = $36k/year
        rentGrowthRate: '3',
        vacancyRate: '5',        // 5% vacancy
        annualExpenses: '8000',  // $8k/year expenses (lower)
        expenseGrowthRate: '2'   // Lower expense growth
      });

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
        years: '3',
        isRentalProperty: true,
        monthlyRent: '1500',     // $1500/month = $18k/year (low rent)
        rentGrowthRate: '2',
        vacancyRate: '10',       // 10% vacancy
        annualExpenses: '15000', // $15k/year expenses (high)
        expenseGrowthRate: '4'
      });

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
        years: '5',
        isRentalProperty: true,
        monthlyRent: '2500',
        rentGrowthRate: '4',     // 4% annual rent growth
        vacancyRate: '5',
        annualExpenses: '10000',
        expenseGrowthRate: '2'   // 2% annual expense growth
      });

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
        years: '15',                 // Projection longer than loan
        isRentalProperty: true,
        monthlyRent: '2000',
        rentGrowthRate: '3',
        vacancyRate: '5',
        annualExpenses: '8000',
        expenseGrowthRate: '2'
      });

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
        years: '5',
        isRentalProperty: false // Explicitly non-rental
      });

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
});