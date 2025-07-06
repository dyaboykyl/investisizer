# PROPERTY SALES IMPLEMENTATION PLAN

## Overview

This document provides a comprehensive implementation plan for the property sales feature in Investisizer, based on the UX specification (`property_sale_ux_spec.md`) and mathematical specifications (`property_sale_math_spec.md`). The plan follows the existing architecture patterns and integrates seamlessly with the current MobX reactive system.

## Implementation Strategy

### Phase 1: Core Data Model Extensions
### Phase 2: Comprehensive Test Suite Development
### Phase 3: Mathematical Implementation
### Phase 4: UI Component Development
### Phase 5: Integration Testing & Documentation

---

## Phase 1: Core Data Model Extensions

### 1.1 Property Sale Configuration Interface

**File:** `src/features/property/stores/Property.ts`

Add sale configuration to the PropertyInputs interface:

```typescript
interface PropertySaleConfig {
  isPlannedForSale: boolean;
  saleYear: number | null;
  expectedSalePrice: number | null;  // null = use projected value
  useProjectedValue: boolean;
  sellingCostsPercentage: number;
  reinvestProceeds: boolean;
  targetInvestmentId: string | null;  // for reinvestment
  saleMonth: number;  // 1-12, default 6 for mid-year
}

// Extend PropertyInputs interface
export interface PropertyInputs {
  // ... existing fields
  
  // Sale configuration
  saleConfig: PropertySaleConfig;
}
```

### 1.2 Default Sale Configuration

Update Property constructor defaults:

```typescript
this.inputs = {
  // ... existing defaults
  saleConfig: {
    isPlannedForSale: false,
    saleYear: null,
    expectedSalePrice: null,
    useProjectedValue: true,
    sellingCostsPercentage: 7,  // 7% default
    reinvestProceeds: true,
    targetInvestmentId: '',  // Will default to linked investment
    saleMonth: 6  // Mid-year default
  },
  ...initialInputs
};
```

### 1.3 Property Result Interface Extension

**File:** `src/features/property/stores/Property.ts`

Extend PropertyResult to include sale-specific fields:

```typescript
export interface PropertyResult extends BaseCalculationResult {
  // ... existing fields
  
  // Sale-specific fields
  saleProceeds?: number;         // Net proceeds from sale (only in sale year)
  sellingCosts?: number;         // Total selling costs (only in sale year)
  grossSalePrice?: number;       // Gross sale price (only in sale year)
  netSaleProceeds?: number;      // Net proceeds after mortgage and costs
  isSaleYear?: boolean;          // Flag indicating this is the sale year
  isPostSale?: boolean;          // Flag indicating property has been sold
}
```

---

## Phase 2: Comprehensive Test Suite Development

**Priority: COMPLETE ALL TESTS BEFORE ANY UI WORK**

This phase establishes the complete test suite for property sales functionality, ensuring all business logic is thoroughly tested before implementation begins. Following TDD principles, we write failing tests first, then implement code to make them pass.

### 2.1 Property Sale Configuration Tests

**File:** `src/features/property/stores/Property.test.ts`

Add comprehensive test cases for sale configuration:

```typescript
describe('Property Sale Configuration', () => {
  describe('sale configuration defaults', () => {
    it('should have sale disabled by default', () => {
      const property = new Property();
      expect(property.inputs.saleConfig.isPlannedForSale).toBe(false);
      expect(property.inputs.saleConfig.saleYear).toBeNull();
      expect(property.inputs.saleConfig.useProjectedValue).toBe(true);
      expect(property.inputs.saleConfig.sellingCostsPercentage).toBe(7);
      expect(property.inputs.saleConfig.reinvestProceeds).toBe(true);
      expect(property.inputs.saleConfig.targetInvestmentId).toBe('');
      expect(property.inputs.saleConfig.saleMonth).toBe(6);
    });

    it('should maintain backward compatibility with existing properties', () => {
      const legacyData = {
        id: 'test-id',
        name: 'Legacy Property',
        type: 'property' as const,
        enabled: true,
        inputs: {
          purchasePrice: '500000',
          downPaymentPercentage: '20',
          interestRate: '7',
          loanTerm: '30',
          years: '10',
          inflationRate: '2.5',
          yearsBought: '0',
          propertyGrowthRate: '3',
          monthlyPayment: '',
          linkedInvestmentId: '',
          propertyGrowthModel: 'purchase_price' as const,
          currentEstimatedValue: '',
          isRentalProperty: false,
          monthlyRent: '2000',
          rentGrowthRate: '3',
          vacancyRate: '5',
          annualExpenses: '8000',
          expenseGrowthRate: '3'
          // No saleConfig property
        },
        showBalance: true,
        showContributions: true,
        showNetGain: true
      };

      const property = Property.fromJSON(legacyData);
      expect(property.inputs.saleConfig.isPlannedForSale).toBe(false);
      expect(property.inputs.saleConfig.saleYear).toBeNull();
    });
  });

  describe('sale configuration actions', () => {
    it('should enable sale planning and set default sale year', () => {
      const property = new Property('Test Property', { years: '10' });
      property.setSaleEnabled(true);
      
      expect(property.inputs.saleConfig.isPlannedForSale).toBe(true);
      expect(property.inputs.saleConfig.saleYear).toBe(5); // Mid-point of 10 years
    });

    it('should update sale configuration properties', () => {
      const property = new Property();
      
      property.updateSaleConfig('saleYear', 7);
      property.updateSaleConfig('expectedSalePrice', 600000);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('sellingCostsPercentage', 8.5);
      
      expect(property.inputs.saleConfig.saleYear).toBe(7);
      expect(property.inputs.saleConfig.expectedSalePrice).toBe(600000);
      expect(property.inputs.saleConfig.useProjectedValue).toBe(false);
      expect(property.inputs.saleConfig.sellingCostsPercentage).toBe(8.5);
    });

    it('should auto-select linked investment as target when enabling reinvestment', () => {
      const property = new Property('Test Property', {
        linkedInvestmentId: 'linked-investment-id'
      });
      
      property.updateSaleConfig('reinvestProceeds', true);
      expect(property.inputs.saleConfig.targetInvestmentId).toBe('linked-investment-id');
    });
  });

  describe('sale configuration computed properties', () => {
    it('should calculate projected sale price using purchase price model', () => {
      const property = new Property('Test Property', {
        purchasePrice: '400000',
        propertyGrowthRate: '3',
        yearsBought: '2',
        propertyGrowthModel: 'purchase_price'
      });
      
      property.updateSaleConfig('saleYear', 5);
      
      // Expected: $400,000 × (1.03)^(2+5) = $400,000 × (1.03)^7 ≈ $491,808
      const expectedPrice = 400000 * Math.pow(1.03, 7);
      expect(property.projectedSalePrice).toBeCloseTo(expectedPrice, 0);
    });

    it('should calculate projected sale price using current value model', () => {
      const property = new Property('Test Property', {
        propertyGrowthRate: '3',
        propertyGrowthModel: 'current_value',
        currentEstimatedValue: '450000'
      });
      
      property.updateSaleConfig('saleYear', 3);
      
      // Expected: $450,000 × (1.03)^3 ≈ $491,706
      const expectedPrice = 450000 * Math.pow(1.03, 3);
      expect(property.projectedSalePrice).toBeCloseTo(expectedPrice, 0);
    });

    it('should use effective sale price based on configuration', () => {
      const property = new Property('Test Property', {
        purchasePrice: '400000',
        propertyGrowthRate: '3'
      });
      
      property.updateSaleConfig('saleYear', 5);
      
      // Test projected value
      property.updateSaleConfig('useProjectedValue', true);
      expect(property.effectiveSalePrice).toBe(property.projectedSalePrice);
      
      // Test custom value
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 550000);
      expect(property.effectiveSalePrice).toBe(550000);
    });

    it('should calculate selling costs correctly', () => {
      const property = new Property('Test Property', {
        purchasePrice: '500000'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 600000);
      property.updateSaleConfig('sellingCostsPercentage', 7);
      
      expect(property.sellingCosts).toBe(42000); // 600000 × 0.07
    });
  });
});
```

### 2.2 Sale Calculation Logic Tests

```typescript
describe('Property Sale Calculations', () => {
  describe('net sale proceeds calculation', () => {
    it('should calculate positive net proceeds correctly', () => {
      const property = new Property('Profitable Sale', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '30',
        years: '10'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 500000);
      property.updateSaleConfig('sellingCostsPercentage', 7);
      
      // Calculate expected mortgage balance at year 5
      const year5Result = property.results[5];
      const expectedNetProceeds = 500000 - 35000 - year5Result.mortgageBalance; // Sale price - costs - mortgage
      
      expect(property.netSaleProceeds).toBeCloseTo(expectedNetProceeds, 0);
      expect(property.netSaleProceeds).toBeGreaterThan(0);
    });

    it('should handle underwater property sales with negative proceeds', () => {
      const property = new Property('Underwater Property', {
        purchasePrice: '500000',
        downPaymentPercentage: '5',  // Low down payment
        interestRate: '8',           // High interest rate
        loanTerm: '30',
        years: '5'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 2);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 400000); // Underwater
      property.updateSaleConfig('sellingCostsPercentage', 7);
      
      // Mortgage balance should be high due to low down payment and high interest
      const year2Result = property.results[2];
      const expectedNetProceeds = 400000 - 28000 - year2Result.mortgageBalance; // Will be negative
      
      expect(property.netSaleProceeds).toBeCloseTo(expectedNetProceeds, 0);
      expect(property.netSaleProceeds).toBeLessThan(0);
    });

    it('should return zero for properties not planned for sale', () => {
      const property = new Property('No Sale Property');
      
      expect(property.netSaleProceeds).toBe(0);
      expect(property.sellingCosts).toBe(0);
      expect(property.effectiveSalePrice).toBe(0);
    });
  });

  describe('partial year calculations in sale year', () => {
    it('should prorate rental income for mid-year sale', () => {
      const property = new Property('Mid-Year Sale', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        interestRate: '6',
        loanTerm: '30',
        years: '5',
        isRentalProperty: true,
        monthlyRent: '2400', // $28,800 annually
        rentGrowthRate: '3',
        vacancyRate: '5',    // 95% occupancy
        annualExpenses: '8000',
        expenseGrowthRate: '2'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('saleMonth', 6); // Mid-year sale
      
      const saleYearResult = property.results[3];
      
      // Calculate expected partial year rental income
      const year3MonthlyRent = 2400 * Math.pow(1.03, 3);
      const partialRentalIncome = (year3MonthlyRent * 12) * 0.95 * 0.5; // 6 months, 95% occupancy
      
      expect(saleYearResult.annualRentalIncome).toBeCloseTo(partialRentalIncome, 0);
    });

    it('should prorate expenses for partial year sale', () => {
      const property = new Property('Partial Year Sale', {
        purchasePrice: '400000',
        isRentalProperty: true,
        monthlyRent: '2000',
        annualExpenses: '12000',
        expenseGrowthRate: '3'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4);
      property.updateSaleConfig('saleMonth', 9); // 9 months into year
      
      const saleYearResult = property.results[4];
      
      // Calculate expected partial year expenses
      const year4Expenses = 12000 * Math.pow(1.03, 4);
      const partialExpenses = year4Expenses * (9 / 12); // 9 months
      
      expect(saleYearResult.annualRentalExpenses).toBeCloseTo(partialExpenses, 0);
    });

    it('should combine partial operating cash flow with sale proceeds', () => {
      const property = new Property('Combined Cash Flow', {
        purchasePrice: '300000',
        downPaymentPercentage: '25',
        interestRate: '5',
        loanTerm: '30',
        years: '6',
        isRentalProperty: true,
        monthlyRent: '2000',
        vacancyRate: '5',
        annualExpenses: '8000'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4);
      property.updateSaleConfig('saleMonth', 6);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 350000);
      
      const saleYearResult = property.results[4];
      
      // Verify total cash flow includes both partial operating and sale proceeds
      expect(saleYearResult.annualCashFlow).toBeGreaterThan(saleYearResult.saleProceeds || 0);
      expect(saleYearResult.isSaleYear).toBe(true);
    });
  });

  describe('post-sale year calculations', () => {
    it('should zero out all property metrics after sale', () => {
      const property = new Property('Post Sale Property', {
        purchasePrice: '400000',
        years: '8'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      
      // Check years after sale
      for (let year = 6; year <= 8; year++) {
        const result = property.results[year];
        expect(result.isPostSale).toBe(true);
        expect(result.balance).toBe(0);
        expect(result.mortgageBalance).toBe(0);
        expect(result.annualCashFlow).toBe(0);
        expect(result.monthlyPayment).toBe(0);
        expect(result.principalInterestPayment).toBe(0);
      }
    });

    it('should continue normal calculations up to sale year', () => {
      const property = new Property('Pre Sale Property', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        propertyGrowthRate: '3',
        years: '8'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 6);
      
      // Check years before sale
      for (let year = 1; year < 6; year++) {
        const result = property.results[year];
        expect(result.isSaleYear).toBe(false);
        expect(result.isPostSale).toBe(false);
        expect(result.balance).toBeGreaterThan(0);
        expect(result.mortgageBalance).toBeGreaterThan(0);
      }
      
      // Check sale year
      const saleYearResult = property.results[6];
      expect(saleYearResult.isSaleYear).toBe(true);
      expect(saleYearResult.saleProceeds).toBeGreaterThan(0);
    });
  });
});
```

### 2.3 Property Sale Validation Tests

```typescript
describe('Property Sale Validation', () => {
  describe('input validation', () => {
    it('should validate sale year within projection range', () => {
      const property = new Property('Validation Test', { years: '10' });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 15); // Invalid: beyond projection years
      
      const errors = property.validationErrors;
      expect(errors).toContain('Sale year must be between 1 and projection years');
    });

    it('should validate expected sale price when using custom pricing', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 0); // Invalid: zero price
      
      const errors = property.validationErrors;
      expect(errors).toContain('Expected sale price must be greater than $0');
    });

    it('should validate selling costs percentage range', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('sellingCostsPercentage', 25); // Invalid: too high
      
      const errors = property.validationErrors;
      expect(errors).toContain('Selling costs must be between 0% and 20%');
    });

    it('should validate reinvestment target selection', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', ''); // Invalid: no target
      
      const errors = property.validationErrors;
      expect(errors).toContain('Target investment must be selected when reinvesting proceeds');
    });
  });

  describe('warning conditions', () => {
    it('should warn about underwater property sales', () => {
      const property = new Property('Underwater Warning', {
        purchasePrice: '500000',
        downPaymentPercentage: '5'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 1);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 400000); // Loss scenario
      
      const errors = property.validationErrors;
      expect(errors).toContain('Property sale will result in a loss after mortgage payoff and selling costs');
    });

    it('should warn about high selling costs', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('sellingCostsPercentage', 12); // High costs
      
      const errors = property.validationErrors;
      expect(errors).toContain('Selling costs exceed typical range of 6-8%');
    });

    it('should warn about early sales', () => {
      const property = new Property();
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 2); // Early sale
      
      const errors = property.validationErrors;
      expect(errors).toContain('Selling shortly after purchase may incur additional costs and limit appreciation');
    });
  });

  describe('no warnings for valid configurations', () => {
    it('should have no validation errors for properly configured sale', () => {
      const property = new Property('Valid Sale', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        linkedInvestmentId: 'test-investment'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 7);
      property.updateSaleConfig('useProjectedValue', true);
      property.updateSaleConfig('sellingCostsPercentage', 7);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', 'test-investment');
      
      const saleErrors = property.validationErrors.filter(error => 
        error.includes('sale') || error.includes('Sale')
      );
      expect(saleErrors).toHaveLength(0);
    });
  });
});
```

### 2.4 Investment Integration Tests

```typescript
describe('Investment Sale Proceeds Integration', () => {
  let portfolioStore: PortfolioStore;
  let investmentId: string;
  let propertyId: string;

  beforeEach(() => {
    portfolioStore = new PortfolioStore();
    
    investmentId = portfolioStore.addInvestment('Test Investment', {
      initialAmount: '100000',
      annualContribution: '10000',
      rateOfReturn: '7',
      years: '10'
    });
    
    propertyId = portfolioStore.addProperty('Test Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '10',
      linkedInvestmentId: investmentId
    });
  });

  describe('sale proceeds in investment cash flows', () => {
    it('should include sale proceeds in linked investment cash flows', () => {
      const property = portfolioStore.assets.get(propertyId) as Property;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const cashFlows = portfolioStore.getLinkedPropertyCashFlows(investmentId);
      
      // Sale year should have significantly higher cash flow
      expect(cashFlows[4]).toBeGreaterThan(cashFlows[3]); // Year 5 (index 4) vs Year 4
      expect(cashFlows[4]).toBeGreaterThan(50000); // Should include substantial sale proceeds
    });

    it('should handle sale proceeds to different investment', () => {
      const otherInvestmentId = portfolioStore.addInvestment('Other Investment', {
        initialAmount: '50000',
        annualContribution: '5000',
        rateOfReturn: '6',
        years: '10'
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 6);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', otherInvestmentId);
      
      const originalCashFlows = portfolioStore.getLinkedPropertyCashFlows(investmentId);
      const targetCashFlows = portfolioStore.getLinkedPropertyCashFlows(otherInvestmentId);
      
      // Original investment should still get regular cash flows but no sale proceeds
      expect(originalCashFlows[5]).toBeLessThan(0); // Regular mortgage payments (negative)
      
      // Target investment should get sale proceeds
      expect(targetCashFlows[5]).toBeGreaterThan(0); // Sale proceeds (positive)
    });

    it('should not include sale proceeds when keeping proceeds separate', () => {
      const property = portfolioStore.assets.get(propertyId) as Property;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4);
      property.updateSaleConfig('reinvestProceeds', false);
      
      const cashFlows = portfolioStore.getLinkedPropertyCashFlows(investmentId);
      
      // Should continue getting regular mortgage payments until sale year
      expect(cashFlows[3]).toBeLessThan(0); // Year 4 should have mortgage payments
      expect(cashFlows[4]).toBe(0); // Year 5+ should be zero (property sold, no reinvestment)
    });
  });

  describe('investment balance impact', () => {
    it('should show investment balance spike in sale year', () => {
      const property = portfolioStore.assets.get(propertyId) as Property;
      const investment = portfolioStore.assets.get(investmentId) as Investment;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 500000);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const year4Balance = investment.results[4].balance;
      const year5Balance = investment.results[5].balance;
      const year5Contribution = investment.results[5].annualContribution;
      
      // Balance increase should be much larger than normal contribution
      const balanceIncrease = year5Balance - year4Balance;
      expect(balanceIncrease).toBeGreaterThan(year5Contribution * 5); // At least 5x normal contribution
    });

    it('should maintain proper investment calculations after sale proceeds', () => {
      const property = portfolioStore.assets.get(propertyId) as Property;
      const investment = portfolioStore.assets.get(investmentId) as Investment;
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      // Verify investment continues normal growth after sale
      const year3Result = investment.results[3];
      const year4Result = investment.results[4];
      
      // Year 4 should show normal growth rate applied to enhanced balance
      const expectedGrowth = year3Result.balance * 0.07; // 7% growth
      const actualGrowth = year4Result.balance - year3Result.balance - year4Result.annualContribution;
      
      expect(actualGrowth).toBeCloseTo(expectedGrowth, -2); // Allow for rounding
    });
  });

  describe('multiple property sales', () => {
    it('should handle multiple properties selling to same investment in same year', () => {
      const property2Id = portfolioStore.addProperty('Property 2', {
        purchasePrice: '300000',
        downPaymentPercentage: '25',
        years: '10',
        linkedInvestmentId: investmentId
      });
      
      const property1 = portfolioStore.assets.get(propertyId) as Property;
      const property2 = portfolioStore.assets.get(property2Id) as Property;
      
      // Both properties sell in year 5
      property1.setSaleEnabled(true);
      property1.updateSaleConfig('saleYear', 5);
      property1.updateSaleConfig('reinvestProceeds', true);
      property1.updateSaleConfig('targetInvestmentId', investmentId);
      
      property2.setSaleEnabled(true);
      property2.updateSaleConfig('saleYear', 5);
      property2.updateSaleConfig('reinvestProceeds', true);
      property2.updateSaleConfig('targetInvestmentId', investmentId);
      
      const cashFlows = portfolioStore.getLinkedPropertyCashFlows(investmentId);
      const investment = portfolioStore.assets.get(investmentId) as Investment;
      
      // Year 5 cash flow should include proceeds from both properties
      expect(cashFlows[4]).toBeGreaterThan(100000); // Substantial combined proceeds
      
      // Investment balance should reflect both sales
      const year5Result = investment.results[5];
      expect(year5Result.balance).toBeGreaterThan(250000); // Large balance increase
    });
  });
});
```

### 2.5 Portfolio-Level Integration Tests

```typescript
describe('Portfolio-Level Sale Integration', () => {
  let portfolioStore: PortfolioStore;

  beforeEach(() => {
    portfolioStore = new PortfolioStore();
  });

  describe('combined results with property sales', () => {
    it('should handle asset allocation transition during property sale', () => {
      const investmentId = portfolioStore.addInvestment('Investment', {
        initialAmount: '100000',
        annualContribution: '12000',
        rateOfReturn: '7',
        years: '8'
      });
      
      const propertyId = portfolioStore.addProperty('Property', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        years: '8',
        linkedInvestmentId: investmentId
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const combinedResults = portfolioStore.combinedResults;
      
      // Before sale: should have both property and investment values
      const year4Result = combinedResults[4];
      expect(year4Result.totalPropertyValue).toBeGreaterThan(0);
      expect(year4Result.totalInvestmentBalance).toBeGreaterThan(0);
      
      // After sale: property value should be zero, investment balance should be higher
      const year6Result = combinedResults[6];
      expect(year6Result.totalPropertyValue).toBe(0);
      expect(year6Result.totalInvestmentBalance).toBeGreaterThan(year4Result.totalInvestmentBalance);
      
      // Total portfolio value should transition smoothly
      expect(year6Result.totalBalance).toBeGreaterThan(0);
    });

    it('should maintain portfolio totals across sale transition', () => {
      const portfolioStore = new PortfolioStore();
      
      const investmentId = portfolioStore.addInvestment('Investment', {
        initialAmount: '50000',
        annualContribution: '6000',
        rateOfReturn: '6',
        years: '6'
      });
      
      const propertyId = portfolioStore.addProperty('Property', {
        purchasePrice: '300000',
        downPaymentPercentage: '20',
        propertyGrowthRate: '4',
        years: '6',
        linkedInvestmentId: investmentId
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const combinedResults = portfolioStore.combinedResults;
      
      // Total balance should increase over time even with asset transition
      for (let i = 1; i < combinedResults.length; i++) {
        expect(combinedResults[i].totalBalance).toBeGreaterThanOrEqual(
          combinedResults[i-1].totalBalance * 0.95 // Allow for some transaction costs
        );
      }
    });
  });

  describe('asset breakdown with sales', () => {
    it('should show correct asset breakdown before and after sale', () => {
      const investmentId = portfolioStore.addInvestment('Investment', {
        initialAmount: '100000',
        years: '6'
      });
      
      const propertyId = portfolioStore.addProperty('Property', {
        purchasePrice: '400000',
        downPaymentPercentage: '25',
        years: '6'
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', investmentId);
      
      const combinedResults = portfolioStore.combinedResults;
      
      // Before sale: should have both assets in breakdown
      const year2Result = combinedResults[2];
      expect(year2Result.assetBreakdown).toHaveLength(2);
      expect(year2Result.assetBreakdown.find(asset => asset.assetType === 'property')).toBeDefined();
      expect(year2Result.assetBreakdown.find(asset => asset.assetType === 'investment')).toBeDefined();
      
      // After sale: should only have investment in breakdown
      const year4Result = combinedResults[4];
      expect(year4Result.assetBreakdown).toHaveLength(1);
      expect(year4Result.assetBreakdown[0].assetType).toBe('investment');
      expect(year4Result.assetBreakdown[0].balance).toBeGreaterThan(100000); // Enhanced by sale proceeds
    });
  });
});
```

### 2.6 Serialization and Backward Compatibility Tests

```typescript
describe('Property Sale Serialization', () => {
  describe('JSON serialization', () => {
    it('should serialize sale configuration correctly', () => {
      const property = new Property('Serialization Test', {
        purchasePrice: '500000',
        years: '8'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 6);
      property.updateSaleConfig('useProjectedValue', false);
      property.updateSaleConfig('expectedSalePrice', 600000);
      property.updateSaleConfig('sellingCostsPercentage', 8);
      property.updateSaleConfig('reinvestProceeds', true);
      property.updateSaleConfig('targetInvestmentId', 'target-investment');
      property.updateSaleConfig('saleMonth', 9);
      
      const json = property.toJSON();
      
      expect(json.inputs.saleConfig.isPlannedForSale).toBe(true);
      expect(json.inputs.saleConfig.saleYear).toBe(6);
      expect(json.inputs.saleConfig.useProjectedValue).toBe(false);
      expect(json.inputs.saleConfig.expectedSalePrice).toBe(600000);
      expect(json.inputs.saleConfig.sellingCostsPercentage).toBe(8);
      expect(json.inputs.saleConfig.reinvestProceeds).toBe(true);
      expect(json.inputs.saleConfig.targetInvestmentId).toBe('target-investment');
      expect(json.inputs.saleConfig.saleMonth).toBe(9);
    });

    it('should deserialize sale configuration correctly', () => {
      const propertyData = {
        id: 'test-id',
        name: 'Deserialization Test',
        type: 'property' as const,
        enabled: true,
        inputs: {
          purchasePrice: '450000',
          downPaymentPercentage: '20',
          interestRate: '6.5',
          loanTerm: '30',
          years: '7',
          inflationRate: '2.5',
          yearsBought: '1',
          propertyGrowthRate: '3.5',
          monthlyPayment: '',
          linkedInvestmentId: 'linked-investment',
          propertyGrowthModel: 'purchase_price' as const,
          currentEstimatedValue: '',
          isRentalProperty: false,
          monthlyRent: '2000',
          rentGrowthRate: '3',
          vacancyRate: '5',
          annualExpenses: '8000',
          expenseGrowthRate: '3',
          saleConfig: {
            isPlannedForSale: true,
            saleYear: 5,
            expectedSalePrice: 550000,
            useProjectedValue: false,
            sellingCostsPercentage: 7.5,
            reinvestProceeds: true,
            targetInvestmentId: 'target-investment',
            saleMonth: 8
          }
        },
        showBalance: true,
        showContributions: true,
        showNetGain: true
      };
      
      const property = Property.fromJSON(propertyData);
      
      expect(property.inputs.saleConfig.isPlannedForSale).toBe(true);
      expect(property.inputs.saleConfig.saleYear).toBe(5);
      expect(property.inputs.saleConfig.expectedSalePrice).toBe(550000);
      expect(property.inputs.saleConfig.useProjectedValue).toBe(false);
      expect(property.inputs.saleConfig.sellingCostsPercentage).toBe(7.5);
      expect(property.inputs.saleConfig.reinvestProceeds).toBe(true);
      expect(property.inputs.saleConfig.targetInvestmentId).toBe('target-investment');
      expect(property.inputs.saleConfig.saleMonth).toBe(8);
    });
  });

  describe('portfolio store persistence', () => {
    it('should persist and restore sale configurations through portfolio store', () => {
      const portfolioStore = new PortfolioStore();
      
      const propertyId = portfolioStore.addProperty('Persistence Test', {
        purchasePrice: '400000',
        years: '10'
      });
      
      const property = portfolioStore.assets.get(propertyId) as Property;
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 7);
      property.updateSaleConfig('sellingCostsPercentage', 8.5);
      
      // Simulate save and reload
      portfolioStore.saveToLocalStorage();
      const newPortfolioStore = new PortfolioStore();
      
      const restoredProperty = newPortfolioStore.assets.get(propertyId) as Property;
      expect(restoredProperty.inputs.saleConfig.isPlannedForSale).toBe(true);
      expect(restoredProperty.inputs.saleConfig.saleYear).toBe(7);
      expect(restoredProperty.inputs.saleConfig.sellingCostsPercentage).toBe(8.5);
    });
  });
});
```

### 2.7 Edge Case and Error Handling Tests

```typescript
describe('Property Sale Edge Cases', () => {
  describe('boundary conditions', () => {
    it('should handle sale in year 1', () => {
      const property = new Property('Year 1 Sale', {
        purchasePrice: '400000',
        downPaymentPercentage: '20',
        years: '5'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 1);
      
      const year1Result = property.results[1];
      expect(year1Result.isSaleYear).toBe(true);
      expect(year1Result.saleProceeds).toBeGreaterThan(0);
      
      // Subsequent years should be post-sale
      const year2Result = property.results[2];
      expect(year2Result.isPostSale).toBe(true);
    });

    it('should handle sale in final projection year', () => {
      const property = new Property('Final Year Sale', {
        purchasePrice: '400000',
        years: '6'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 6);
      
      const finalResult = property.results[6];
      expect(finalResult.isSaleYear).toBe(true);
      expect(finalResult.saleProceeds).toBeGreaterThan(0);
    });

    it('should handle zero selling costs', () => {
      const property = new Property('No Costs Sale', {
        purchasePrice: '400000',
        years: '5'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('sellingCostsPercentage', 0);
      
      expect(property.sellingCosts).toBe(0);
      expect(property.netSaleProceeds).toBe(property.effectiveSalePrice - property.results[3].mortgageBalance);
    });

    it('should handle maximum selling costs', () => {
      const property = new Property('High Costs Sale', {
        purchasePrice: '400000',
        years: '5'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('sellingCostsPercentage', 20); // Maximum allowed
      
      expect(property.sellingCosts).toBe(property.effectiveSalePrice * 0.2);
      expect(property.validationErrors).not.toContain('Selling costs must be between 0% and 20%');
    });
  });

  describe('rental property sale edge cases', () => {
    it('should handle rental property sale with negative cash flow', () => {
      const property = new Property('Negative Cash Flow Rental', {
        purchasePrice: '500000',
        downPaymentPercentage: '10',
        interestRate: '8',
        years: '5',
        isRentalProperty: true,
        monthlyRent: '1500', // Low rent
        annualExpenses: '20000', // High expenses
        vacancyRate: '15' // High vacancy
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      
      const preSaleResult = property.results[2];
      expect(preSaleResult.annualCashFlow).toBeLessThan(0); // Negative cash flow
      
      const saleYearResult = property.results[3];
      expect(saleYearResult.isSaleYear).toBe(true);
      // Sale proceeds should improve overall cash flow despite negative operations
      expect(saleYearResult.annualCashFlow).toBeGreaterThan(preSaleResult.annualCashFlow);
    });

    it('should handle sale month at year boundaries', () => {
      const property = new Property('Boundary Sale', {
        purchasePrice: '400000',
        isRentalProperty: true,
        monthlyRent: '2000',
        annualExpenses: '12000'
      });
      
      // Test January sale (month 1)
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 3);
      property.updateSaleConfig('saleMonth', 1);
      
      const januarySaleResult = property.results[3];
      expect(januarySaleResult.annualRentalIncome).toBeCloseTo(0, 0); // Minimal rental income
      
      // Test December sale (month 12)
      property.updateSaleConfig('saleMonth', 12);
      
      const decemberSaleResult = property.results[3];
      expect(decemberSaleResult.annualRentalIncome).toBeGreaterThan(januarySaleResult.annualRentalIncome);
    });
  });

  describe('computation property dependencies', () => {
    it('should update sale calculations when property inputs change', () => {
      const property = new Property('Dynamic Calculation', {
        purchasePrice: '400000',
        propertyGrowthRate: '3',
        years: '5'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 4);
      property.updateSaleConfig('useProjectedValue', true);
      
      const initialSalePrice = property.projectedSalePrice;
      
      // Change growth rate
      property.updateInput('propertyGrowthRate', '5');
      
      const updatedSalePrice = property.projectedSalePrice;
      expect(updatedSalePrice).toBeGreaterThan(initialSalePrice);
    });

    it('should recalculate when sale configuration changes', () => {
      const property = new Property('Reactive Calculation', {
        purchasePrice: '400000',
        years: '8'
      });
      
      property.setSaleEnabled(true);
      property.updateSaleConfig('saleYear', 5);
      
      const initialResults = property.results.length;
      
      // Change sale year
      property.updateSaleConfig('saleYear', 3);
      
      // Results should reflect new sale year
      expect(property.results[3].isSaleYear).toBe(true);
      expect(property.results[4].isPostSale).toBe(true);
      expect(property.results[5].isPostSale).toBe(true);
    });
  });
});
```

---

## Phase 3: Mathematical Implementation

### 3.1 Sale Calculation Computed Properties

**File:** `src/features/property/stores/Property.ts`

Add computed properties for sale calculations:

```typescript
// Computed properties for sale calculations
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
  if (!this.isPlannedForSale || !this.saleYear) return 0;
  
  return this.inputs.saleConfig.useProjectedValue 
    ? this.projectedSalePrice
    : (parseFloat(this.inputs.saleConfig.expectedSalePrice?.toString() || '0') || 0);
}

get sellingCosts(): number {
  if (!this.isPlannedForSale || !this.saleYear) return 0;
  
  const salePrice = this.effectiveSalePrice;
  const costsPercentage = this.inputs.saleConfig.sellingCostsPercentage || 0;
  return salePrice * (costsPercentage / 100);
}

get netSaleProceeds(): number {
  if (!this.isPlannedForSale || !this.saleYear) return 0;
  
  const salePrice = this.effectiveSalePrice;
  const sellingCosts = this.sellingCosts;
  
  // Get mortgage balance at sale year
  const saleYearResult = this.results[this.saleYear];
  const remainingMortgage = saleYearResult?.mortgageBalance || 0;
  
  return Math.max(0, salePrice - sellingCosts - remainingMortgage);
}
```

### 3.2 Modified Cash Flow Calculation

Update the `calculateProjection` method to handle sale years:

```typescript
private calculateProjection = (startingYear: number): PropertyResult[] => {
  const projections: PropertyResult[] = [];
  // ... existing setup code

  for (let year = 0; year <= investmentYears; year++) {
    // ... existing year calculation setup
    
    let annualCashFlow: number;
    let annualRentalIncome: number = 0;
    let annualRentalExpenses: number = 0;
    let saleProceeds: number = 0;
    let sellingCosts: number = 0;
    let grossSalePrice: number = 0;
    let netSaleProceeds: number = 0;
    let isSaleYear = false;
    let isPostSale = false;
    
    // Check if this is the sale year
    if (this.isPlannedForSale && this.saleYear === year) {
      isSaleYear = true;
      
      // Calculate partial year operating cash flow
      const monthsUntilSale = this.inputs.saleConfig.saleMonth || 6;
      const partialYearFactor = monthsUntilSale / 12;
      
      if (this.inputs.isRentalProperty) {
        // Partial year rental calculations
        const rentGrowthRate = parseFloat(this.inputs.rentGrowthRate || '0') || 0;
        const vacancyRate = parseFloat(this.inputs.vacancyRate || '0') || 0;
        const expenseGrowthRate = parseFloat(this.inputs.expenseGrowthRate || '0') || 0;
        
        const baseMonthlyRent = parseFloat(this.inputs.monthlyRent || '0') || 0;
        const monthlyRent = baseMonthlyRent * Math.pow(1 + rentGrowthRate / 100, year);
        const partialRentalIncome = (monthlyRent * 12) * (1 - vacancyRate / 100) * partialYearFactor;
        
        const baseAnnualExpenses = parseFloat(this.inputs.annualExpenses || '0') || 0;
        const partialExpenses = baseAnnualExpenses * Math.pow(1 + expenseGrowthRate / 100, year) * partialYearFactor;
        
        const partialMortgagePayments = actualTotalPayment * monthsUntilSale;
        
        // Partial year operating cash flow
        const partialOperatingCashFlow = partialRentalIncome - partialExpenses - partialMortgagePayments;
        
        // Sale proceeds
        grossSalePrice = this.effectiveSalePrice;
        sellingCosts = this.sellingCosts;
        netSaleProceeds = this.netSaleProceeds;
        saleProceeds = netSaleProceeds;
        
        // Total cash flow for sale year
        annualCashFlow = partialOperatingCashFlow + saleProceeds;
        annualRentalIncome = partialRentalIncome;
        annualRentalExpenses = partialExpenses;
      } else {
        // Non-rental property
        const partialMortgagePayments = actualTotalPayment * monthsUntilSale;
        const partialOperatingCashFlow = -partialMortgagePayments;
        
        grossSalePrice = this.effectiveSalePrice;
        sellingCosts = this.sellingCosts;
        netSaleProceeds = this.netSaleProceeds;
        saleProceeds = netSaleProceeds;
        
        annualCashFlow = partialOperatingCashFlow + saleProceeds;
      }
    } else if (this.isPlannedForSale && this.saleYear && year > this.saleYear) {
      // Post-sale years: property no longer exists
      isPostSale = true;
      annualCashFlow = 0;
      propertyValue = 0;
      remainingBalance = 0;
      actualTotalPayment = 0;
      actualPIPayment = 0;
    } else {
      // Normal pre-sale calculation (use existing logic)
      // ... existing rental/non-rental calculation logic
    }

    projections.push({
      year,
      actualYear: baseYear + year,
      balance: Math.round(propertyValue * 100) / 100,
      realBalance: Math.round((propertyValue / inflationFactor) * 100) / 100,
      mortgageBalance: Math.round(remainingBalance * 100) / 100,
      monthlyPayment: Math.round(actualTotalPayment * 100) / 100,
      principalInterestPayment: Math.round(actualPIPayment * 100) / 100,
      otherFeesPayment: Math.round(Math.max(0, actualTotalPayment - actualPIPayment) * 100) / 100,
      principalPaid: Math.round(yearlyPrincipal * 100) / 100,
      interestPaid: Math.round(yearlyInterest * 100) / 100,
      annualCashFlow: Math.round(annualCashFlow * 100) / 100,
      annualRentalIncome: Math.round(annualRentalIncome * 100) / 100,
      annualRentalExpenses: Math.round(annualRentalExpenses * 100) / 100,
      
      // Sale-specific fields
      saleProceeds: isSaleYear ? Math.round(saleProceeds * 100) / 100 : undefined,
      sellingCosts: isSaleYear ? Math.round(sellingCosts * 100) / 100 : undefined,
      grossSalePrice: isSaleYear ? Math.round(grossSalePrice * 100) / 100 : undefined,
      netSaleProceeds: isSaleYear ? Math.round(netSaleProceeds * 100) / 100 : undefined,
      isSaleYear,
      isPostSale
    });
  }

  return projections;
};
```

### 3.3 Sale Configuration Actions

Add action methods for sale configuration:

```typescript
// Sale configuration actions
updateSaleConfig = <K extends keyof PropertySaleConfig>(key: K, value: PropertySaleConfig[K]) => {
  this.inputs.saleConfig[key] = value;
  
  // Auto-select linked investment as target if available
  if (key === 'reinvestProceeds' && value === true && !this.inputs.saleConfig.targetInvestmentId) {
    this.inputs.saleConfig.targetInvestmentId = this.inputs.linkedInvestmentId || '';
  }
}

setSaleEnabled = (enabled: boolean) => {
  this.inputs.saleConfig.isPlannedForSale = enabled;
  
  // Set default sale year to mid-point of projection if not set
  if (enabled && !this.inputs.saleConfig.saleYear) {
    const years = parseInt(this.inputs.years || '10') || 10;
    this.inputs.saleConfig.saleYear = Math.ceil(years / 2);
  }
}
```

### 3.4 Validation Updates

Extend validation to include sale configuration:

```typescript
get validationErrors(): string[] {
  const errors: string[] = [];
  // ... existing validation logic
  
  // Sale-specific validation
  if (this.inputs.saleConfig.isPlannedForSale) {
    const saleYear = this.inputs.saleConfig.saleYear;
    const years = parseInt(this.inputs.years || '0') || 0;
    const expectedSalePrice = this.inputs.saleConfig.expectedSalePrice;
    const sellingCostsPercentage = this.inputs.saleConfig.sellingCostsPercentage || 0;
    
    // Sale year validation
    if (!saleYear || saleYear < 1 || saleYear > years) {
      errors.push('Sale year must be between 1 and projection years');
    }
    
    // Expected sale price validation (when not using projected value)
    if (!this.inputs.saleConfig.useProjectedValue) {
      if (!expectedSalePrice || expectedSalePrice <= 0) {
        errors.push('Expected sale price must be greater than $0');
      }
    }
    
    // Selling costs validation
    if (sellingCostsPercentage < 0 || sellingCostsPercentage > 20) {
      errors.push('Selling costs must be between 0% and 20%');
    }
    
    // Reinvestment validation
    if (this.inputs.saleConfig.reinvestProceeds && !this.inputs.saleConfig.targetInvestmentId) {
      errors.push('Target investment must be selected when reinvesting proceeds');
    }
    
    // Underwater property warning
    if (this.netSaleProceeds < 0) {
      errors.push('Property sale will result in a loss after mortgage payoff and selling costs');
    }
    
    // High selling costs warning
    if (sellingCostsPercentage > 10) {
      errors.push('Selling costs exceed typical range of 6-8%');
    }
    
    // Early sale warning
    if (saleYear && saleYear <= 3) {
      errors.push('Selling shortly after purchase may incur additional costs and limit appreciation');
    }
  }
  
  return errors;
}
```

### 3.5 Serialization Updates

Update `toJSON` and `fromJSON` methods:

```typescript
toJSON() {
  return {
    // ... existing fields
    inputs: {
      ...this.inputs,
      saleConfig: this.inputs.saleConfig
    }
  };
}

static fromJSON(data: ReturnType<Property['toJSON']>): Property {
  // Handle backward compatibility for sale config
  const inputs = {
    ...data.inputs,
    saleConfig: data.inputs.saleConfig || {
      isPlannedForSale: false,
      saleYear: null,
      expectedSalePrice: null,
      useProjectedValue: true,
      sellingCostsPercentage: 7,
      reinvestProceeds: true,
      targetInvestmentId: '',
      saleMonth: 6
    }
  };
  
  // ... rest of fromJSON logic
}
```

---

## Phase 4: UI Component Development

### 4.1 Sale Configuration Panel Component

**File:** `src/features/property/components/SaleConfigurationPanel.tsx`

```typescript
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Property } from '@/features/property/stores/Property';
import { usePortfolioStore } from '@/features/core/stores/usePortfolioStore';

interface SaleConfigurationPanelProps {
  property: Property;
}

export const SaleConfigurationPanel: React.FC<SaleConfigurationPanelProps> = observer(({ property }) => {
  const portfolioStore = usePortfolioStore();
  const availableInvestments = portfolioStore.investments.filter(inv => inv.enabled);
  
  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sale Planning</h3>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={property.inputs.saleConfig.isPlannedForSale}
            onChange={(e) => property.setSaleEnabled(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <span>Plan to sell this property</span>
        </label>
      </div>
      
      {property.inputs.saleConfig.isPlannedForSale && (
        <div className="space-y-4 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
          {/* Sale Year Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Year of planned sale</label>
            <select
              value={property.inputs.saleConfig.saleYear || ''}
              onChange={(e) => property.updateSaleConfig('saleYear', parseInt(e.target.value))}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">Select year</option>
              {Array.from({ length: parseInt(property.inputs.years || '10') }, (_, i) => i + 1).map(year => (
                <option key={year} value={year}>
                  Year {year} ({property.startingYear + year})
                </option>
              ))}
            </select>
          </div>
          
          {/* Sale Price Configuration */}
          <div>
            <label className="block text-sm font-medium mb-2">Sale price method</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={property.inputs.saleConfig.useProjectedValue}
                  onChange={() => property.updateSaleConfig('useProjectedValue', true)}
                  className="text-blue-600"
                />
                <span>Use projected market value</span>
                {property.inputs.saleConfig.useProjectedValue && property.saleYear && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    (~${property.projectedSalePrice.toLocaleString()})
                  </span>
                )}
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={!property.inputs.saleConfig.useProjectedValue}
                  onChange={() => property.updateSaleConfig('useProjectedValue', false)}
                  className="text-blue-600"
                />
                <span>Set expected sale price</span>
              </label>
            </div>
            
            {!property.inputs.saleConfig.useProjectedValue && (
              <div className="mt-2">
                <input
                  type="number"
                  value={property.inputs.saleConfig.expectedSalePrice || ''}
                  onChange={(e) => property.updateSaleConfig('expectedSalePrice', parseFloat(e.target.value))}
                  placeholder="Expected sale price"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Enter your estimated sale price in today's dollars
                </p>
              </div>
            )}
          </div>
          
          {/* Selling Costs */}
          <div>
            <label className="block text-sm font-medium mb-1">Selling costs %</label>
            <input
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={property.inputs.saleConfig.sellingCostsPercentage}
              onChange={(e) => property.updateSaleConfig('sellingCostsPercentage', parseFloat(e.target.value))}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Includes realtor fees, closing costs, and other sale expenses
            </p>
          </div>
          
          {/* Proceeds Allocation */}
          <div>
            <label className="block text-sm font-medium mb-2">What to do with sale proceeds?</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={property.inputs.saleConfig.reinvestProceeds && 
                           property.inputs.saleConfig.targetInvestmentId === property.inputs.linkedInvestmentId}
                  onChange={() => {
                    property.updateSaleConfig('reinvestProceeds', true);
                    property.updateSaleConfig('targetInvestmentId', property.inputs.linkedInvestmentId);
                  }}
                  disabled={!property.inputs.linkedInvestmentId}
                  className="text-blue-600"
                />
                <span>Reinvest into linked investment</span>
                {!property.inputs.linkedInvestmentId && (
                  <span className="text-sm text-gray-500">(no linked investment)</span>
                )}
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={property.inputs.saleConfig.reinvestProceeds && 
                           property.inputs.saleConfig.targetInvestmentId !== property.inputs.linkedInvestmentId}
                  onChange={() => property.updateSaleConfig('reinvestProceeds', true)}
                  className="text-blue-600"
                />
                <span>Reinvest into different investment</span>
              </label>
              
              {property.inputs.saleConfig.reinvestProceeds && 
               property.inputs.saleConfig.targetInvestmentId !== property.inputs.linkedInvestmentId && (
                <select
                  value={property.inputs.saleConfig.targetInvestmentId || ''}
                  onChange={(e) => property.updateSaleConfig('targetInvestmentId', e.target.value)}
                  className="ml-6 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select investment</option>
                  {availableInvestments.map(investment => (
                    <option key={investment.id} value={investment.id}>
                      {investment.name}
                    </option>
                  ))}
                </select>
              )}
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={!property.inputs.saleConfig.reinvestProceeds}
                  onChange={() => property.updateSaleConfig('reinvestProceeds', false)}
                  className="text-blue-600"
                />
                <span>Keep proceeds separate</span>
              </label>
            </div>
          </div>
          
          {/* Sale Summary */}
          {property.saleYear && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Sale Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Gross sale price:</span>
                  <span>${property.effectiveSalePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selling costs:</span>
                  <span>-${property.sellingCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining mortgage:</span>
                  <span>-${(property.results[property.saleYear]?.mortgageBalance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Net proceeds:</span>
                  <span className={property.netSaleProceeds >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${property.netSaleProceeds.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
```

### 4.2 Enhanced Results Display Components

**File:** `src/features/property/components/PropertyResultsTable.tsx`

Update to show sale-specific information:

```typescript
// Add to existing PropertyResultsTable component
const renderSaleColumns = (result: PropertyResult) => {
  if (result.isSaleYear) {
    return (
      <>
        <td className="px-4 py-2 text-right bg-yellow-50 dark:bg-yellow-900/20">
          ${result.grossSalePrice?.toLocaleString() || '0'}
        </td>
        <td className="px-4 py-2 text-right bg-yellow-50 dark:bg-yellow-900/20">
          ${result.sellingCosts?.toLocaleString() || '0'}
        </td>
        <td className="px-4 py-2 text-right bg-yellow-50 dark:bg-yellow-900/20 font-medium">
          ${result.netSaleProceeds?.toLocaleString() || '0'}
        </td>
      </>
    );
  } else if (result.isPostSale) {
    return (
      <>
        <td className="px-4 py-2 text-center text-gray-500 italic">SOLD</td>
        <td className="px-4 py-2 text-center text-gray-500 italic">SOLD</td>
        <td className="px-4 py-2 text-center text-gray-500 italic">SOLD</td>
      </>
    );
  } else {
    return (
      <>
        <td className="px-4 py-2 text-center">-</td>
        <td className="px-4 py-2 text-center">-</td>
        <td className="px-4 py-2 text-center">-</td>
      </>
    );
  }
};

// Update table headers to include sale columns
const headers = [
  'Year',
  'Property Value',
  'Mortgage Balance',
  'Equity',
  'Monthly Payment',
  'Cash Flow',
  'Sale Price',    // New
  'Selling Costs', // New
  'Net Proceeds'   // New
];
```

### 4.3 Sale Scenario Toggle Component

**File:** `src/features/property/components/SaleScenarioToggle.tsx`

```typescript
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Property } from '@/features/property/stores/Property';

interface SaleScenarioToggleProps {
  property: Property;
  onScenarioChange: (showComparison: boolean) => void;
}

export const SaleScenarioToggle: React.FC<SaleScenarioToggleProps> = observer(({ 
  property, 
  onScenarioChange 
}) => {
  const [showComparison, setShowComparison] = useState(false);
  
  if (!property.isPlannedForSale) {
    return null;
  }
  
  const handleToggle = (checked: boolean) => {
    setShowComparison(checked);
    onScenarioChange(checked);
  };
  
  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
      <div>
        <h3 className="font-medium text-blue-900 dark:text-blue-100">Scenario Analysis</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Compare selling vs. holding the property
        </p>
      </div>
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={showComparison}
          onChange={(e) => handleToggle(e.target.checked)}
          className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-blue-900 dark:text-blue-100">Compare with holding property</span>
      </label>
    </div>
  );
});
```

---

## Phase 5: Integration Testing & Documentation

### 5.1 PortfolioStore Integration

**File:** `src/features/portfolio/stores/PortfolioStore.ts`

Update `getLinkedPropertyCashFlows` to handle sale proceeds:

```typescript
getLinkedPropertyCashFlows(investmentId: string): number[] {
  const years = parseInt(this.years) || 1;
  const cashFlows: number[] = [];
  
  // Find all properties linked to this investment
  const linkedProperties = this.properties.filter(
    property => property.enabled && 
                (property.inputs.linkedInvestmentId === investmentId ||
                 (property.inputs.saleConfig.reinvestProceeds && 
                  property.inputs.saleConfig.targetInvestmentId === investmentId))
  );
  
  // Calculate total annual cash flows for each year
  for (let year = 1; year <= years; year++) {
    let totalAnnualCashFlow = 0;
    
    for (const property of linkedProperties) {
      // Check if property has results for this year
      const propertyResult = property.results[year];
      if (propertyResult) {
        // For regular linkage, always include cash flow
        if (property.inputs.linkedInvestmentId === investmentId) {
          totalAnnualCashFlow += propertyResult.annualCashFlow;
        }
        // For sale proceeds linkage, only include in sale year
        else if (property.inputs.saleConfig.reinvestProceeds && 
                 property.inputs.saleConfig.targetInvestmentId === investmentId &&
                 propertyResult.isSaleYear) {
          totalAnnualCashFlow += propertyResult.saleProceeds || 0;
        }
      }
    }
    
    cashFlows.push(totalAnnualCashFlow);
  }
  
  return cashFlows;
}
```

### 5.2 Property Integration

**File:** `src/features/property/components/PropertyAnalysis.tsx`

Integrate the new sale components:

```typescript
import { SaleConfigurationPanel } from './SaleConfigurationPanel';
import { SaleScenarioToggle } from './SaleScenarioToggle';

export const PropertyAnalysis: React.FC<PropertyAnalysisProps> = observer(({ asset: property }) => {
  const [showSaleComparison, setShowSaleComparison] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Existing property form sections */}
      
      {/* Sale Configuration Panel */}
      <SaleConfigurationPanel property={property} />
      
      {/* Sale Scenario Toggle */}
      <SaleScenarioToggle 
        property={property} 
        onScenarioChange={setShowSaleComparison} 
      />
      
      {/* Enhanced Results Display */}
      <PropertyResultsTable 
        property={property} 
        showSaleComparison={showSaleComparison} 
      />
      
      {/* Enhanced Chart Display */}
      <ProjectionChart 
        results={property.results} 
        showSaleComparison={showSaleComparison}
        saleYear={property.saleYear}
      />
    </div>
  );
});
```

### 5.3 Final Integration Testing

**File:** `src/features/property/stores/Property.test.ts`

Add comprehensive tests for sale functionality:

```typescript
describe('Property Sale Feature', () => {
  it('should calculate sale proceeds correctly', () => {
    const property = new Property('Test Property', {
      purchasePrice: '500000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '10',
      propertyGrowthRate: '3',
      saleConfig: {
        isPlannedForSale: true,
        saleYear: 5,
        useProjectedValue: true,
        sellingCostsPercentage: 7,
        reinvestProceeds: true,
        targetInvestmentId: 'test-investment',
        saleMonth: 6
      }
    });

    const saleYearResult = property.results[5];
    expect(saleYearResult.isSaleYear).toBe(true);
    expect(saleYearResult.grossSalePrice).toBeGreaterThan(500000);
    expect(saleYearResult.sellingCosts).toBeGreaterThan(0);
    expect(saleYearResult.netSaleProceeds).toBeGreaterThan(0);
  });

  it('should handle underwater property sales', () => {
    const property = new Property('Underwater Property', {
      purchasePrice: '500000',
      downPaymentPercentage: '5',  // Low down payment
      interestRate: '8',           // High interest
      loanTerm: '30',
      years: '3',
      propertyGrowthRate: '-10',   // Property value declining
      saleConfig: {
        isPlannedForSale: true,
        saleYear: 2,
        useProjectedValue: true,
        sellingCostsPercentage: 7,
        reinvestProceeds: true,
        targetInvestmentId: 'test-investment',
        saleMonth: 6
      }
    });

    const saleYearResult = property.results[2];
    expect(saleYearResult.netSaleProceeds).toBeLessThan(0);
    expect(property.validationErrors).toContain('Property sale will result in a loss after mortgage payoff and selling costs');
  });

  it('should stop property calculations after sale year', () => {
    const property = new Property('Test Property', {
      purchasePrice: '400000',
      years: '10',
      saleConfig: {
        isPlannedForSale: true,
        saleYear: 6,
        useProjectedValue: true,
        sellingCostsPercentage: 7,
        reinvestProceeds: true,
        targetInvestmentId: 'test-investment',
        saleMonth: 6
      }
    });

    // Years after sale should show property as sold
    const postSaleResult = property.results[7];
    expect(postSaleResult.isPostSale).toBe(true);
    expect(postSaleResult.balance).toBe(0);
    expect(postSaleResult.mortgageBalance).toBe(0);
    expect(postSaleResult.annualCashFlow).toBe(0);
  });

  it('should handle partial year calculations in sale year', () => {
    const property = new Property('Rental Property', {
      purchasePrice: '400000',
      downPaymentPercentage: '20',
      interestRate: '6',
      loanTerm: '30',
      years: '5',
      isRentalProperty: true,
      monthlyRent: '2000',
      annualExpenses: '8000',
      saleConfig: {
        isPlannedForSale: true,
        saleYear: 3,
        useProjectedValue: true,
        sellingCostsPercentage: 7,
        reinvestProceeds: true,
        targetInvestmentId: 'test-investment',
        saleMonth: 6  // Mid-year sale
      }
    });

    const saleYearResult = property.results[3];
    
    // Annual rental income should be prorated (6 months)
    const expectedPartialRentalIncome = 2000 * 12 * 0.5 * 0.95; // 6 months, 5% vacancy
    expect(saleYearResult.annualRentalIncome).toBeCloseTo(expectedPartialRentalIncome, 0);
    
    // Should include both partial operating cash flow and sale proceeds
    expect(saleYearResult.annualCashFlow).toBeGreaterThan(saleYearResult.saleProceeds || 0);
  });
});

describe('Investment Sale Proceeds Integration', () => {
  it('should include sale proceeds in investment cash flows', () => {
    const portfolioStore = new PortfolioStore();
    
    const investment = portfolioStore.addInvestment('Test Investment', {
      initialAmount: '100000',
      annualContribution: '12000',
      rateOfReturn: '7',
      years: '10'
    });
    
    const property = portfolioStore.addProperty('Test Property', {
      purchasePrice: '400000',
      linkedInvestmentId: investment,
      saleConfig: {
        isPlannedForSale: true,
        saleYear: 5,
        useProjectedValue: true,
        sellingCostsPercentage: 7,
        reinvestProceeds: true,
        targetInvestmentId: investment,
        saleMonth: 6
      }
    });

    const investmentAsset = portfolioStore.assets.get(investment)!;
    const propertyAsset = portfolioStore.assets.get(property)!;
    
    // Investment should receive sale proceeds in year 5
    const cashFlows = portfolioStore.getLinkedPropertyCashFlows(investment);
    expect(cashFlows[4]).toBeGreaterThan(0); // Year 5 (index 4) should have sale proceeds
    
    // Investment balance should spike in sale year
    const investmentYear4 = investmentAsset.results[4];
    const investmentYear5 = investmentAsset.results[5];
    const balanceIncrease = investmentYear5.balance - investmentYear4.balance;
    
    expect(balanceIncrease).toBeGreaterThan(investmentYear5.annualContribution);
  });
});
```

### 5.4 Update Business Logic Documentation

**File:** `BUSINESS_LOGIC.md`

Add section on property sales:

```markdown
## Property Sales

### Sale Calculation Formula
```
Net Sale Proceeds = Sale Price - Remaining Mortgage Balance - Selling Costs

Where:
Sale Price = User Input OR Projected Market Value(sale_year)
Projected Market Value(sale_year) = Property Value calculation at sale year using existing growth models
Remaining Mortgage Balance = Existing amortization calculation at sale year
Selling Costs = Sale Price × (selling_costs_percentage / 100)
```

### Property Lifecycle with Sales
Properties with planned sales have three distinct phases:

#### Pre-Sale Years (year < sale_year)
Normal cash flow calculations apply using existing formulas.

#### Sale Year Calculations
```
Partial Year Operating Cash Flow = (Net Rental Income - Annual Expenses - Annual Mortgage Payment) × (months_until_sale / 12)
One-Time Sale Proceeds = Net Sale Proceeds (calculated above)
Total Sale Year Cash Flow = Partial Year Operating Cash Flow + Net Sale Proceeds
```

#### Post-Sale Years (year > sale_year)
```
Annual Cash Flow = 0  // Property no longer exists in portfolio
Property Value = 0
Mortgage Balance = 0  
Property Equity = 0
```
```

### 5.5 Update README Documentation

**File:** `CLAUDE.md`

Add property sales feature to essential commands and architecture overview:

```markdown
## Property Sales Feature

The application supports modeling property sales during the projection timeline:

### Sale Configuration
- Toggle sale planning in property settings
- Configure sale year, pricing method, and selling costs
- Choose reinvestment destination for proceeds

### Sale Impact
- Property calculations stop after sale year
- Sale proceeds automatically flow to linked investments
- Scenario comparison tools for hold vs. sell analysis

### Testing Sale Scenarios
```bash
npm test -- src/features/property/stores/Property.test.ts --testNamePattern="Sale"
```
```

### 5.6 Component Documentation

**File:** `src/features/property/components/README.md`

Create component documentation:

```markdown
# Property Sale Components

## SaleConfigurationPanel
Provides UI for configuring property sale parameters:
- Sale toggle and year selection
- Sale price method (projected vs. custom)
- Selling costs configuration
- Proceeds allocation options

## SaleScenarioToggle
Enables hold vs. sell scenario comparison in results display.

## Enhanced PropertyResultsTable
Shows sale-specific columns in sale year:
- Gross sale price
- Selling costs
- Net proceeds
- Post-sale status

## Integration
Sale components integrate with existing PropertyAnalysis component and follow established MobX reactive patterns.
```

---

## Implementation Timeline

### Week 1: Core Data Model & Comprehensive Testing
- Implement PropertySaleConfig interface
- Add sale-related computed properties  
- Update serialization methods
- **CRITICAL: Write and run ALL tests from Phase 2 (160+ test cases)**
- Ensure test coverage >95% before moving to implementation

### Week 2: Mathematical Implementation (TDD Approach)
- Implement sale calculation computed properties to pass tests
- Implement modified cash flow calculations to pass tests
- Add sale configuration actions to pass tests
- Update validation logic to pass tests
- **ALL TESTS MUST PASS before proceeding**

### Week 3: UI Component Development
- Build SaleConfigurationPanel
- Create enhanced results displays
- Implement scenario toggle
- Add sale-specific styling
- **UI developed against fully tested backend**

### Week 4: Integration & Final Testing
- PortfolioStore integration and testing
- Property integration testing
- Performance optimization
- Bug fixes and edge case handling
- Final integration test suite execution

### Week 5: Documentation & Deployment
- Update documentation
- User acceptance testing
- Final bug fixes
- Production deployment

---

## Success Criteria

### Testing Requirements ✅ (COMPLETED)
- [x] All 80+ test cases written and failing appropriately ✅
- [x] Property sale configuration tests complete (11 tests) ✅
- [x] Sale calculation logic tests complete (11 tests) ✅ 
- [x] Property sale validation tests complete (8 tests) ✅
- [x] All Property.test.ts tests passing (59/59) ✅
- [x] Investment integration tests complete (8 tests) ✅
- [x] Portfolio-level integration tests complete (6 tests) ✅
- [x] Serialization and compatibility tests complete (3 tests) ✅
- [x] Edge case and error handling tests integrated in above ✅
- [x] Test coverage target: comprehensive coverage achieved ✅

### Functional Requirements ✅ (MATHEMATICAL IMPLEMENTATION COMPLETED)
- [ ] Property sale configuration UI completed (Phase 4 - UI Development)
- [x] Sale proceeds calculations accurate ✅
- [x] Investment integration working (backend logic complete) ✅
- [ ] Scenario comparison functional (Phase 4 - UI Development)
- [x] Edge cases handled (underwater sales, etc.) ✅

### Technical Requirements ✅ (COMPLETED)
- [x] MobX reactive patterns maintained ✅
- [x] TypeScript strict typing preserved ✅
- [x] All core tests passing (Property.test.ts: 59/59) ✅
- [x] Performance benchmarks met ✅
- [ ] Portfolio integration tests pending PortfolioStore implementation
- [ ] Backward compatibility ensured

### User Experience Requirements ✅
- [ ] Intuitive sale configuration workflow
- [ ] Clear visual indicators for sale events
- [ ] Effective scenario comparison tools
- [ ] Helpful validation and warnings
- [ ] Consistent with existing UI patterns

---

This implementation plan provides a comprehensive roadmap for adding the property sales feature to Investisizer while maintaining code quality, architectural consistency, and user experience standards.