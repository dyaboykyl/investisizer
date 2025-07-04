import { Property } from './Property';

describe('Property', () => {
  it('should create a property with default values', () => {
    const property = new Property();

    expect(property.name).toBe('New Property');
    expect(property.type).toBe('property');
    expect(property.enabled).toBe(true);
    expect(property.inputs.purchasePrice).toBe('500000');
    expect(property.inputs.downPayment).toBe('100000');
    expect(property.inputs.interestRate).toBe('7');
    expect(property.inputs.loanTerm).toBe('30');
    expect(property.inputs.years).toBe('10');
    expect(property.inputs.inflationRate).toBe('2.5');
  });

  it('should create a property with custom values', () => {
    const property = new Property('My House', {
      purchasePrice: '750000',
      downPayment: '150000',
      interestRate: '6.5',
      loanTerm: '15',
      years: '5',
      inflationRate: '3'
    });

    expect(property.name).toBe('My House');
    expect(property.inputs.purchasePrice).toBe('750000');
    expect(property.inputs.downPayment).toBe('150000');
    expect(property.inputs.interestRate).toBe('6.5');
    expect(property.inputs.loanTerm).toBe('15');
    expect(property.inputs.years).toBe('5');
    expect(property.inputs.inflationRate).toBe('3');
  });

  it('should calculate mortgage projections correctly', () => {
    const property = new Property('Test Property', {
      purchasePrice: '500000',
      downPayment: '100000',
      interestRate: '7',
      loanTerm: '30',
      years: '10',
      inflationRate: '2.5'
    });

    expect(property.hasResults).toBe(true);
    expect(property.results.length).toBe(11); // Year 0 + 10 years

    const year0 = property.results[0];
    expect(year0.year).toBe(0);
    expect(year0.mortgageBalance).toBe(400000); // 500k - 100k down payment
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
      downPayment: '80000',
      interestRate: '6',
      loanTerm: '30',
      years: '10'
    });

    const loanAmount = 320000; // 400k - 80k
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
      downPayment: '60000',
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
      downPayment: '0',
      interestRate: '6.5',
      loanTerm: '30',
      years: '5'
    });

    const year0 = property.results[0];
    expect(year0.mortgageBalance).toBe(200000); // Full purchase price
    
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
      downPayment: '120000',
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
      downPayment: '80000',
      interestRate: '6',
      loanTerm: '15',
      years: '15'
    });

    const property30 = new Property('30 Year Loan', {
      purchasePrice: '400000',
      downPayment: '80000',
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
      downPayment: '100000',
      interestRate: '7',
      loanTerm: '30',
      years: '5',
      inflationRate: '3'
    });

    const year5 = property.results[5];
    expect(year5.realBalance).toBeLessThan(year5.balance); // Real value should be less due to inflation
  });
});