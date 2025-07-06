# Enhanced Rental Expense Model - Implementation Plan

## Overview
Implement a more realistic rental expense model that divides expenses into maintenance and property management components, with automatic growth tracking based on property value and rent.

## Key Changes
- **Maintenance**: Expressed as % of property value per year
- **Property Management**: Optional with listing fees and monthly management fees as % of rent
- **Automatic Growth**: No separate expense growth rate needed
- **Vacancy Integration**: Listing fee frequency based on vacancy rate

---

## Phase 0: Refactor and Improve Existing Code ⏳

### Goals
- Eliminate duplicate parsing and calculations
- Create computed properties for parsed inputs
- Separate effective values calculation from business logic
- Improve code maintainability and performance

### Tasks
- [ ] **Create parsedInputs computed property**
  - Parse all string inputs to numbers once
  - Handle defaults and validation in one place
  - Make calculations pure functions that don't parse

- [ ] **Create effectiveValues computed property**
  - Calculate yearly effective values (rent, property value, etc.) with growth
  - Pre-calculate inflation factors
  - Separate growth calculations from core business logic

- [ ] **Refactor calculation methods**
  - Update all calculation methods to use parsedInputs and effectiveValues
  - Remove duplicate parsing throughout the codebase
  - Ensure calculations are pure and don't repeat work

- [ ] **Add tests for refactoring**
  - Test parsedInputs property thoroughly
  - Test effectiveValues calculations
  - Ensure no regression in existing functionality

### Implementation Details

#### A. parsedInputs computed property
```typescript
get parsedInputs() {
  return {
    // Basic property inputs
    purchasePrice: parseFloat(this.inputs.purchasePrice || '0') || 0,
    downPaymentPercentage: this.inputs.downPaymentPercentage !== undefined && this.inputs.downPaymentPercentage !== '' 
      ? parseFloat(this.inputs.downPaymentPercentage) : 20,
    interestRate: parseFloat(this.inputs.interestRate || '0') || 0,
    loanTerm: parseInt(this.inputs.loanTerm || '30') || 30,
    years: parseInt(this.inputs.years || '10') || 10,
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
    annualExpenses: parseFloat(this.inputs.annualExpenses || '0') || 0,
    expenseGrowthRate: parseFloat(this.inputs.expenseGrowthRate || '0') || 0,
  };
}
```

#### B. effectiveValues method
```typescript
private calculateEffectiveValues(year: number) {
  const parsed = this.parsedInputs;
  
  return {
    // Property value with growth
    propertyValue: this.calculatePropertyValueForYear(year, parsed),
    
    // Rental values with growth
    monthlyRent: parsed.monthlyRent * Math.pow(1 + parsed.rentGrowthRate / 100, year),
    annualExpenses: parsed.annualExpenses * Math.pow(1 + parsed.expenseGrowthRate / 100, year),
    
    // Inflation factor
    inflationFactor: Math.pow(1 + parsed.inflationRate / 100, year),
    
    // Mortgage details
    loanAmount: parsed.purchasePrice * (1 - parsed.downPaymentPercentage / 100),
    monthlyRate: parsed.interestRate / 100 / 12,
  };
}
```

---

## Phase 1: Data Model Changes 🔄

### Goals
- Update interfaces to support new expense model
- Remove old expense fields
- Add new maintenance and property management fields

### Tasks
- [ ] **Update PropertyInputs interface**
  - Remove: `annualExpenses`, `expenseGrowthRate`
  - Add: `maintenanceRate`, `propertyManagementEnabled`, `listingFeeRate`, `monthlyManagementFeeRate`

- [ ] **Update PropertyResult interface**
  - Replace: `annualRentalExpenses`
  - Add: `maintenanceExpenses`, `listingExpenses`, `monthlyManagementExpenses`, `totalRentalExpenses`

- [ ] **Update parsedInputs computed property**
  - Add parsing for new expense-related fields
  - Remove old expense field parsing

### Implementation Details

#### A. Updated PropertyInputs Interface
```typescript
export interface PropertyInputs {
  // ... existing fields ...
  
  // Remove these:
  // annualExpenses: string;
  // expenseGrowthRate: string;
  
  // Add these:
  maintenanceRate: string;          // % of property value per year
  propertyManagementEnabled: boolean; // Toggle for property management
  listingFeeRate: string;           // % of monthly rent per listing
  monthlyManagementFeeRate: string; // % of monthly rent per month
}
```

#### B. Updated PropertyResult Interface
```typescript
export interface PropertyResult extends BaseCalculationResult {
  // ... existing fields ...
  
  // Replace:
  // annualRentalExpenses: number;
  
  // With:
  maintenanceExpenses: number;      // Annual maintenance costs
  listingExpenses: number;          // Annual listing costs (vacancy-based)
  monthlyManagementExpenses: number; // Annual management fees
  totalRentalExpenses: number;      // Sum of all expense components
}
```

---

## Phase 2: Business Logic Implementation 🔄

### Goals
- Implement new expense calculation methods using parsedInputs
- Update main calculation flow
- Ensure all calculations use pre-parsed values

### Tasks
- [ ] **Add new calculation methods**
  - `calculateMaintenanceExpenses(effectiveValues)`
  - `calculateListingExpenses(effectiveValues, monthsOwned)`
  - `calculateMonthlyManagementExpenses(effectiveValues, monthsOwned)`
  - `calculateTotalRentalExpenses(effectiveValues, monthsOwned)`

- [ ] **Update existing methods**
  - Update `calculateRentalExpenses` to use new model
  - Update `calculateAnnualCashFlow` for new expense structure
  - Update main projection loop to use new calculations

- [ ] **Add comprehensive tests**
  - Test each new calculation method
  - Test integration with existing cash flow calculations
  - Test edge cases (zero rates, disabled management, etc.)

### Implementation Details

#### A. New Calculation Methods
```typescript
private calculateMaintenanceExpenses(effectiveValues: any): number {
  if (!this.inputs.isRentalProperty) return 0;
  
  const parsed = this.parsedInputs;
  return effectiveValues.propertyValue * (parsed.maintenanceRate / 100);
}

private calculateListingExpenses(effectiveValues: any, monthsOwned: number = 12): number {
  if (!this.inputs.isRentalProperty || !this.inputs.propertyManagementEnabled) return 0;
  
  const parsed = this.parsedInputs;
  // Listing fees are paid based on vacancy turnover
  const annualListingEvents = (parsed.vacancyRate / 100) * (monthsOwned / 12);
  
  return effectiveValues.monthlyRent * (parsed.listingFeeRate / 100) * annualListingEvents;
}

private calculateMonthlyManagementExpenses(effectiveValues: any, monthsOwned: number = 12): number {
  if (!this.inputs.isRentalProperty || !this.inputs.propertyManagementEnabled) return 0;
  
  const parsed = this.parsedInputs;
  const effectiveRentalIncome = effectiveValues.monthlyRent * monthsOwned * (1 - parsed.vacancyRate / 100);
  
  return effectiveRentalIncome * (parsed.monthlyManagementFeeRate / 100);
}
```

---

## Phase 3: UI Updates 🔄

### Goals
- Update PropertyInputForm for new expense model
- Add detailed expense breakdown visualization
- Update PropertyResultsTable with new columns

### Tasks
- [ ] **Update PropertyInputForm.tsx**
  - Replace old expense fields with maintenance rate
  - Add property management toggle and fee inputs
  - Add helpful tooltips and validation feedback

- [ ] **Create PropertyExpenseBreakdown component**
  - Show detailed expense breakdown by category
  - Display effective rates and calculated amounts
  - Integrate with existing property analysis views

- [ ] **Update PropertyResultsTable.tsx**
  - Add columns for detailed expense breakdown
  - Update existing expense column to show total
  - Maintain responsive design and column borders

### Implementation Details

#### A. PropertyInputForm Updates
- Replace annual expenses section with maintenance rate input
- Add property management toggle with conditional fee inputs
- Include helpful descriptions and typical ranges

#### B. New PropertyExpenseBreakdown Component
- Tabular or card-based breakdown of expense components
- Show both absolute amounts and rates/percentages
- Include year-over-year growth visualization

---

## Phase 4: Migration & Polish 🔄

### Goals
- Implement backward compatibility
- Add comprehensive testing
- Update documentation and help text

### Tasks
- [ ] **Backward compatibility**
  - Update `fromJSON` to migrate old expense data
  - Provide reasonable defaults for new fields
  - Handle edge cases in data migration

- [ ] **Comprehensive testing**
  - Add test file: `Property.expenses.test.ts`
  - Update existing tests for new data model
  - Test backward compatibility thoroughly

- [ ] **Documentation and UX**
  - Update help text and tooltips
  - Add expense model explanation
  - Update any user documentation

### Implementation Details

#### A. Migration Strategy
```typescript
static fromJSON(data: ReturnType<Property['toJSON']>): Property {
  const inputs = {
    ...data.inputs,
    // New fields with defaults
    maintenanceRate: data.inputs.maintenanceRate || '2',
    propertyManagementEnabled: data.inputs.propertyManagementEnabled ?? false,
    listingFeeRate: data.inputs.listingFeeRate || '100',
    monthlyManagementFeeRate: data.inputs.monthlyManagementFeeRate || '10',
    
    // Migrate old annualExpenses to maintenanceRate if available
    ...(data.inputs.annualExpenses && !data.inputs.maintenanceRate ? {
      maintenanceRate: String(
        (parseFloat(data.inputs.annualExpenses) / parseFloat(data.inputs.purchasePrice || '500000')) * 100
      )
    } : {})
  };
  
  // ... rest of fromJSON
}
```

---

## Implementation Progress

### Phase 0: Refactor and Improve Existing Code ✅
- [x] Create parsedInputs computed property
- [x] Create effectiveValues computed property  
- [x] Refactor calculation methods to use parsed values
- [x] Add tests for refactoring

### Phase 1: Data Model Changes  
- [ ] Update PropertyInputs interface
- [ ] Update PropertyResult interface
- [ ] Update parsedInputs for new fields

### Phase 2: Business Logic Implementation
- [ ] Add new calculation methods
- [ ] Update existing methods
- [ ] Add comprehensive tests

### Phase 3: UI Updates
- [ ] Update PropertyInputForm.tsx
- [ ] Create PropertyExpenseBreakdown component
- [ ] Update PropertyResultsTable.tsx

### Phase 4: Migration & Polish
- [ ] Implement backward compatibility
- [ ] Add comprehensive testing
- [ ] Update documentation

---

## Notes and Considerations

### Technical Decisions
- Vacancy rate determines listing fee frequency (annual turnover events)
- Maintenance rate applied to current property value (grows automatically)
- Management fees calculated on effective rental income (after vacancy)
- All rates stored as strings for UI consistency, parsed once in computed property

### Default Values
- Maintenance rate: 2% of property value annually
- Listing fee rate: 100% of monthly rent per placement
- Monthly management fee: 10% of collected rent
- Property management disabled by default

### Validation Rules
- Maintenance rate: 0-10% of property value
- Listing fee rate: 0-200% of monthly rent  
- Monthly management fee: 0-50% of rent
- Property management fees only validated when enabled

Last Updated: [Current Date]