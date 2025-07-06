import { Property } from '@/features/property/stores/Property';

describe('Property - parsedInputs Computed Property', () => {
  describe('basic property inputs parsing', () => {
    it('should correctly parse all basic property inputs with defaults', () => {
      const property = new Property('Parse Test');
      property.portfolioStore = { years: '10' };
      
      const parsed = property.parsedInputs;
      
      // Check defaults are applied
      expect(parsed.purchasePrice).toBe(500000);
      expect(parsed.downPaymentPercentage).toBe(20);
      expect(parsed.interestRate).toBe(7);
      expect(parsed.loanTerm).toBe(30);
      expect(parsed.years).toBe(10);
      expect(parsed.inflationRate).toBe(2.5);
      expect(parsed.yearsBought).toBe(0);
      expect(parsed.propertyGrowthRate).toBe(3);
      expect(parsed.currentEstimatedValue).toBe(0);
      expect(parsed.userMonthlyPayment).toBe(0);
    });

    it('should correctly parse custom property inputs', () => {
      const property = new Property('Custom Parse Test', {
        purchasePrice: '750000',
        downPaymentPercentage: '25',
        interestRate: '6.5',
        loanTerm: '15',
        inflationRate: '3.2',
        yearsBought: '2',
        propertyGrowthRate: '4.5',
        currentEstimatedValue: '800000',
        monthlyPayment: '4500'
      });
      property.portfolioStore = { years: '20' };
      
      const parsed = property.parsedInputs;
      
      expect(parsed.purchasePrice).toBe(750000);
      expect(parsed.downPaymentPercentage).toBe(25);
      expect(parsed.interestRate).toBe(6.5);
      expect(parsed.loanTerm).toBe(15);
      expect(parsed.years).toBe(20);
      expect(parsed.inflationRate).toBe(3.2);
      expect(parsed.yearsBought).toBe(2);
      expect(parsed.propertyGrowthRate).toBe(4.5);
      expect(parsed.currentEstimatedValue).toBe(800000);
      expect(parsed.userMonthlyPayment).toBe(4500);
    });

    it('should handle empty and invalid string inputs with defaults', () => {
      const property = new Property('Empty Parse Test', {
        purchasePrice: '',
        downPaymentPercentage: '',
        interestRate: 'invalid',
        loanTerm: '',
        inflationRate: '',
        yearsBought: '',
        propertyGrowthRate: '',
        currentEstimatedValue: '',
        monthlyPayment: ''
      });
      property.portfolioStore = { years: '10' }; // default years
      
      const parsed = property.parsedInputs;
      
      expect(parsed.purchasePrice).toBe(0);
      expect(parsed.downPaymentPercentage).toBe(20); // Default when empty
      expect(parsed.interestRate).toBe(0);
      expect(parsed.loanTerm).toBe(30);
      expect(parsed.years).toBe(10);
      expect(parsed.inflationRate).toBe(0);
      expect(parsed.yearsBought).toBe(0);
      expect(parsed.propertyGrowthRate).toBe(0);
      expect(parsed.currentEstimatedValue).toBe(0);
      expect(parsed.userMonthlyPayment).toBe(0);
    });

    it('should handle zero down payment percentage correctly', () => {
      const property = new Property('Zero Down Test', {
        downPaymentPercentage: '0'
      });
      
      const parsed = property.parsedInputs;
      expect(parsed.downPaymentPercentage).toBe(0);
    });
  });

  describe('rental property inputs parsing', () => {
    it('should correctly parse rental property inputs with defaults', () => {
      const property = new Property('Rental Parse Test', {
        isRentalProperty: true
      });
      property.portfolioStore = { years: '10' };
      
      const parsed = property.parsedInputs;
      
      expect(parsed.monthlyRent).toBe(2000);
      expect(parsed.rentGrowthRate).toBe(3);
      expect(parsed.vacancyRate).toBe(5);
      expect(parsed.maintenanceRate).toBe(2);
      expect(parsed.listingFeeRate).toBe(100);
      expect(parsed.monthlyManagementFeeRate).toBe(10);
    });

    it('should correctly parse custom rental property inputs', () => {
      const property = new Property('Custom Rental Parse Test', {
        isRentalProperty: true,
        monthlyRent: '3500',
        rentGrowthRate: '4',
        vacancyRate: '8',
        maintenanceRate: '2.5',
        propertyManagementEnabled: true,
        listingFeeRate: '150',
        monthlyManagementFeeRate: '10'
      });
      property.portfolioStore = { years: '10' };
      
      const parsed = property.parsedInputs;
      
      expect(parsed.monthlyRent).toBe(3500);
      expect(parsed.rentGrowthRate).toBe(4);
      expect(parsed.vacancyRate).toBe(8);
      expect(parsed.maintenanceRate).toBe(2.5);
      expect(parsed.listingFeeRate).toBe(150);
      expect(parsed.monthlyManagementFeeRate).toBe(10);
    });
  });

  describe('input reactivity', () => {
    it('should update parsed values when inputs change', () => {
      const property = new Property('Reactivity Test');
      property.portfolioStore = { years: '10' };
      
      // Initial values
      expect(property.parsedInputs.purchasePrice).toBe(500000);
      expect(property.parsedInputs.interestRate).toBe(7);
      
      // Update inputs
      property.updateInput('purchasePrice', '600000');
      property.updateInput('interestRate', '6');
      
      // Check parsed values updated
      expect(property.parsedInputs.purchasePrice).toBe(600000);
      expect(property.parsedInputs.interestRate).toBe(6);
    });
  });

  describe('effectiveValues method', () => {
    it('should calculate effective values for year 0', () => {
      const property = new Property('Effective Values Test', {
        purchasePrice: '500000',
        propertyGrowthRate: '3',
        isRentalProperty: true,
        monthlyRent: '2000',
        rentGrowthRate: '3',
        maintenanceRate: '2',
        propertyManagementEnabled: false,
        inflationRate: '2',
        downPaymentPercentage: '20',
        interestRate: '7'
      });
      property.portfolioStore = { years: '10' };
      
      const effectiveValues = (property as any).calculateEffectiveValues(0);
      
      // Year 0 should have base values (no growth applied)
      expect(effectiveValues.propertyValue).toBe(500000);
      expect(effectiveValues.monthlyRent).toBe(2000);
      // Test maintenance expense calculation separately
      const maintenanceExpenses = (property as any).calculateMaintenanceExpenses(effectiveValues, 12);
      expect(maintenanceExpenses).toBeCloseTo(10000, 0); // 2% of 500k
      expect(effectiveValues.inflationFactor).toBe(1);
      expect(effectiveValues.loanAmount).toBe(400000); // 80% of purchase price
      expect(effectiveValues.monthlyRate).toBeCloseTo(0.0058333, 5); // 7% / 12
    });

    it('should calculate effective values with growth for future years', () => {
      const property = new Property('Growth Test', {
        purchasePrice: '500000',
        propertyGrowthRate: '3',
        isRentalProperty: true,
        monthlyRent: '2000',
        rentGrowthRate: '3',
        maintenanceRate: '2',
        propertyManagementEnabled: false,
        inflationRate: '2'
      });
      property.portfolioStore = { years: '10' };
      
      const effectiveValues = (property as any).calculateEffectiveValues(5);
      
      // Year 5 should have growth applied
      expect(effectiveValues.propertyValue).toBeCloseTo(579637, 0); // 500000 * 1.03^5
      expect(effectiveValues.monthlyRent).toBeCloseTo(2318.55, 2); // 2000 * 1.03^5
      // Test maintenance expense calculation separately
      const maintenanceExpenses = (property as any).calculateMaintenanceExpenses(effectiveValues, 12);
      expect(maintenanceExpenses).toBeCloseTo(11592.74, 1); // 2% of grown property value
      expect(effectiveValues.inflationFactor).toBeCloseTo(1.1041, 4); // 1.02^5
    });
  });
});