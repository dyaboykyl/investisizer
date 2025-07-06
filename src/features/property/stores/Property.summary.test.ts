import { Property } from '@/features/property/stores/Property';

describe('Property - Summary Data', () => {
  it('should return null when purchase price is 0', () => {
    const property = new Property('Test Property', {
      purchasePrice: '0'
    });
    property.portfolioStore = { years: '5' };
    
    expect(property.summaryData).toBeNull();
  });

  it('should calculate summary data correctly for basic property', () => {
    const property = new Property('Test Property', {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '7',
      loanTerm: '30'
    });
    property.portfolioStore = { years: '10' };

    const summary = property.summaryData;
    expect(summary).not.toBeNull();
    expect(summary!.purchasePrice).toBe(500000);
    expect(summary!.downPaymentPercentage).toBe(20);
    expect(summary!.downPaymentAmount).toBe(100000); // 20% of 500000
    expect(summary!.loanAmount).toBe(400000); // 500000 - 100000
    expect(summary!.interestRate).toBe(7);
    expect(summary!.loanTerm).toBe(30);
    expect(summary!.monthlyPayment).toBeGreaterThan(0);
    expect(summary!.paidOff).toBe(false); // Should not be paid off after 10 years
  });

  it('should calculate total interest correctly', () => {
    const property = new Property('Test Property', {
      purchasePrice: '300000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '15' // Shorter term
    });
    property.portfolioStore = { years: '15' };

    // Debug the property calculation
    expect(property.hasResults).toBe(true);
    const finalResult = property.finalResult;
    expect(finalResult).not.toBeNull();
    
    const summary = property.summaryData;
    expect(summary).not.toBeNull();
    
    const expectedLoanAmount = 240000; // 300000 - 60000
    expect(summary!.loanAmount).toBe(expectedLoanAmount);
    
    // Check if the monthly payment calculation works
    const calculatedPI = property.calculatedPrincipalInterestPayment;
    expect(calculatedPI).toBeGreaterThan(0); // P&I should be positive
    
    expect(summary!.monthlyPayment).toBeGreaterThan(0); // Monthly payment should be positive
    expect(summary!.totalPaid).toBeGreaterThan(expectedLoanAmount); // Total paid should exceed loan amount
    expect(summary!.totalInterest).toBeGreaterThan(0);
    expect(summary!.paidOff).toBe(true); // Should be paid off after full term
  });

  it('should handle cash flow calculations for non-rental property', () => {
    const property = new Property('Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '25',
      interestRate: '5.5',
      loanTerm: '30',
      isRentalProperty: false
    });
    property.portfolioStore = { years: '5' };

    const summary = property.summaryData;
    expect(summary).not.toBeNull();
    
    // For non-rental property, cash flow should be negative (mortgage payments)
    expect(summary!.currentCashFlow).toBeLessThan(0);
    expect(summary!.isPositiveCashFlow).toBe(false);
    expect(summary!.monthlyCashFlow).toBeLessThan(0);
  });

  it('should handle cash flow calculations for rental property', () => {
    const property = new Property('Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '25',
      interestRate: '5.5',
      loanTerm: '30',
      isRentalProperty: true,
      monthlyRent: '2500',
      vacancyRate: '5',
      maintenanceRate: '2'
    });
    property.portfolioStore = { years: '5' };

    const summary = property.summaryData;
    expect(summary).not.toBeNull();
    
    // Monthly cash flow should be calculated as (rent - mortgage payment - expenses/12)
    const expectedMonthlyCashFlow = summary!.currentCashFlow / 12;
    
    expect(Math.abs(summary!.monthlyCashFlow - expectedMonthlyCashFlow)).toBeLessThan(0.01);
    
    // Cash flow could be positive or negative depending on the numbers
    if (summary!.currentCashFlow > 0) {
      expect(summary!.isPositiveCashFlow).toBe(true);
    } else {
      expect(summary!.isPositiveCashFlow).toBe(false);
    }
  });

  it('should detect when property is paid off', () => {
    const property = new Property('Test Property', {
      purchasePrice: '200000',
      downPaymentPercentage: '50', // Large down payment
      interestRate: '8',
      loanTerm: '10' // Short term
    });
    property.portfolioStore = { years: '10' }; // Full term

    const summary = property.summaryData;
    expect(summary).not.toBeNull();
    expect(summary!.paidOff).toBe(true);
    expect(summary!.remainingBalance).toBe(0);
  });

  it('should handle custom monthly payment', () => {
    const property = new Property('Test Property', {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '7',
      loanTerm: '30',
      monthlyPayment: '3500' // Custom payment higher than P&I
    });
    property.portfolioStore = { years: '10' };

    const summary = property.summaryData;
    expect(summary).not.toBeNull();
    expect(summary!.monthlyPayment).toBe(3500); // Should use custom payment
    
    // With higher payment, should pay off faster
    const calculatedPI = property.calculatedPrincipalInterestPayment;
    expect(summary!.monthlyPayment).toBeGreaterThan(calculatedPI);
  });

  it('should calculate down payment amount correctly with different percentages', () => {
    const testCases = [
      { price: 100000, percentage: 10, expected: 10000 },
      { price: 500000, percentage: 20, expected: 100000 },
      { price: 750000, percentage: 25, expected: 187500 },
      { price: 1000000, percentage: 30, expected: 300000 }
    ];

    testCases.forEach(({ price, percentage, expected }) => {
      const property = new Property('Test Property', {
        purchasePrice: price.toString(),
        downPaymentPercentage: percentage.toString()
      });
      property.portfolioStore = { years: '5' };

      const summary = property.summaryData;
      expect(summary).not.toBeNull();
      expect(summary!.downPaymentAmount).toBe(expected);
      expect(summary!.loanAmount).toBe(price - expected);
    });
  });
});