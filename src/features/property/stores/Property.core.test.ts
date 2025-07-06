import { Property } from '@/features/property/stores/Property';

describe('Property - Core Functionality', () => {
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

    // Should only have results for year 0 through 10 (11 total)
    expect(property.results.length).toBe(11);
    expect(property.results[0].year).toBe(0);
    expect(property.results[10].year).toBe(10);
  });

  it('should handle zero down payment', () => {
    const property = new Property('Zero Down Property', {
      purchasePrice: '200000',
      downPaymentPercentage: '0',
      interestRate: '7',
      loanTerm: '30',
      years: '5'
    });

    const year0 = property.results[0];
    expect(year0.mortgageBalance).toBe(200000); // Full purchase price
  });

  it('should update inputs and recalculate', () => {
    const property = new Property();
    const originalBalance = property.finalResult?.balance;

    property.updateInput('purchasePrice', '600000');
    const newBalance = property.finalResult?.balance;

    expect(newBalance).not.toBe(originalBalance);
    expect(newBalance).toBeGreaterThan(originalBalance || 0);
  });

  it('should serialize and deserialize correctly', () => {
    const originalProperty = new Property('Serialization Test', {
      purchasePrice: '450000',
      downPaymentPercentage: '25',
      interestRate: '6.5',
      years: '8'
    });

    const serialized = originalProperty.toJSON();
    const deserializedProperty = Property.fromJSON(serialized);

    expect(deserializedProperty.name).toBe(originalProperty.name);
    expect(deserializedProperty.inputs.purchasePrice).toBe(originalProperty.inputs.purchasePrice);
    expect(deserializedProperty.inputs.downPaymentPercentage).toBe(originalProperty.inputs.downPaymentPercentage);
    expect(deserializedProperty.inputs.interestRate).toBe(originalProperty.inputs.interestRate);
    expect(deserializedProperty.finalResult?.balance).toBe(originalProperty.finalResult?.balance);
  });

  it('should handle different loan terms', () => {
    const property15 = new Property('15 Year Loan', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '15',
      years: '10'
    });

    const property30 = new Property('30 Year Loan', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '10'
    });

    // 15-year loan should have higher monthly payment but pay down faster
    expect(property15.monthlyPayment).toBeGreaterThan(property30.monthlyPayment);
    expect(property15.finalResult?.mortgageBalance).toBeLessThan(property30.finalResult?.mortgageBalance || 0);
  });

  it('should handle different property growth models', () => {
    const purchasePriceProperty = new Property('Purchase Price Growth', {
      purchasePrice: '400000',
      propertyGrowthRate: '3',
      yearsBought: '2',
      propertyGrowthModel: 'purchase_price',
      years: '5'
    });

    const currentValueProperty = new Property('Current Value Growth', {
      purchasePrice: '400000',
      propertyGrowthRate: '3',
      yearsBought: '2',
      propertyGrowthModel: 'current_value',
      currentEstimatedValue: '450000',
      years: '5'
    });

    // Different growth models should yield different property values
    expect(purchasePriceProperty.finalResult?.balance).not.toBe(currentValueProperty.finalResult?.balance);
  });

  it('should calculate real values with inflation', () => {
    const property = new Property('Inflation Test', {
      purchasePrice: '400000',
      propertyGrowthRate: '3',
      inflationRate: '2',
      years: '5'
    });

    const finalResult = property.finalResult;
    expect(finalResult?.realBalance).toBeLessThan(finalResult?.balance || 0);
  });

  it('should account for years ago bought in mortgage balance', () => {
    const newProperty = new Property('New Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      yearsBought: '0',
      years: '5'
    });

    const oldProperty = new Property('Old Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      yearsBought: '5', // Already owned for 5 years
      years: '5'
    });

    // Old property should have lower initial mortgage balance
    expect(oldProperty.results[0].mortgageBalance).toBeLessThan(newProperty.results[0].mortgageBalance);
  });

  it('should handle editable monthly payment', () => {
    const property = new Property('Custom Payment Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      monthlyPayment: '2500', // Custom payment higher than calculated
      years: '10'
    });

    expect(property.monthlyPayment).toBe(2500);
    
    // Should pay down faster with higher payment
    const calculatedPaymentProperty = new Property('Calculated Payment Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      monthlyPayment: '', // Use calculated payment
      years: '10'
    });

    expect(property.finalResult?.mortgageBalance).toBeLessThanOrEqual(calculatedPaymentProperty.finalResult?.mortgageBalance || 0);
  });

  it('should autopopulate monthly payment with calculated P+I', () => {
    const property = new Property('Auto Payment Property', {
      purchasePrice: '300000',
      downPaymentPercentage: '20',
      interestRate: '5',
      loanTerm: '30',
      monthlyPayment: '' // Empty should use calculated
    });

    expect(property.monthlyPayment).toBe(property.calculatedPrincipalInterestPayment);
    expect(property.monthlyPayment).toBeGreaterThan(0);
  });

  it('should handle linkedInvestmentId field', () => {
    const property = new Property('Linked Property', {
      linkedInvestmentId: 'investment-123'
    });

    expect(property.inputs.linkedInvestmentId).toBe('investment-123');
  });

  it('should calculate mortgage balance using P+I only, not total payment', () => {
    const property = new Property('P+I Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      monthlyPayment: '3000', // Higher than P+I (includes taxes, insurance, etc.)
      years: '10'
    });

    const calculatedPI = property.calculatedPrincipalInterestPayment;
    expect(calculatedPI).toBeLessThan(3000);

    // Mortgage balance should be calculated based on P+I only, not the $3000 total payment
    // This means it should pay down at the standard P+I rate, not the accelerated $3000 rate
    const standardProperty = new Property('Standard Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      monthlyPayment: calculatedPI.toString(),
      years: '10'
    });

    expect(property.finalResult?.mortgageBalance).toBeCloseTo(standardProperty.finalResult?.mortgageBalance || 0, 2);
  });
});