import { Property } from './Property';

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
});