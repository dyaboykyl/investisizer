# Rental Property Feature Implementation Plan

## Current Status
✅ **Phase 1: Core Data Model Updates** - COMPLETED  
✅ **Phase 2: Cash Flow Calculation Logic** - COMPLETED  
✅ **Phase 3: Investment Integration Updates** - COMPLETED  
✅ **Phase 4: UI Component Updates** - COMPLETED  
✅ **Phase 5: Validation and Testing** - COMPLETED  
🚧 **Phase 6: UI Polish and Documentation** - IN PROGRESS  

## Overview
The rental property feature transforms properties from withdrawal-only to bidirectional cash flow entities. Properties can now contribute positive cash flow to linked investments (rental income exceeds expenses) or require negative cash flow (expenses exceed income).

## Progress Summary
- ✅ Added all rental property fields to PropertyInputs and PropertyResult interfaces
- ✅ Implemented complete rental cash flow calculation logic
- ✅ Updated investment integration to handle bidirectional cash flows
- ✅ Renamed methods from "withdrawals" to "cash flows" throughout codebase
- ✅ Updated all test files and ensured 71/71 tests pass
- ✅ Fixed TypeScript compilation issues
- ✅ Added rental property form fields with conditional display
- ✅ Updated property summary and projection table to show cash flows
- ✅ Enhanced validation rules for rental property inputs
- ✅ Added comprehensive test suite with 10 new rental property tests
- 🚧 Finalizing documentation and UI polish

## Phase 1: Core Data Model Updates ✅ COMPLETED

### 1.1 Update PropertyInputs Interface ✅ COMPLETED
**File**: `src/features/property/stores/Property.ts`

Added rental property fields to PropertyInputs:
```typescript
export interface PropertyInputs {
  // ... existing fields
  isRentalProperty: boolean;
  monthlyRent: string;
  rentGrowthRate: string;
  vacancyRate: string;
  annualExpenses: string;
  expenseGrowthRate: string;
}
```

### 1.2 Update PropertyResult Interface ✅ COMPLETED
Added cash flow field to PropertyResult:
```typescript
export interface PropertyResult extends BaseCalculationResult {
  // ... existing fields
  annualCashFlow: number; // New: can be positive or negative
}
```

### 1.3 Update Property Constructor ✅ COMPLETED
Added default values for new rental fields:
```typescript
// Default inputs in constructor
isRentalProperty: false,
monthlyRent: '2000',
rentGrowthRate: '3',
vacancyRate: '5', 
annualExpenses: '8000',
expenseGrowthRate: '3',
```

## Phase 2: Cash Flow Calculation Logic ✅ COMPLETED

### 2.1 Implement Rental Cash Flow Formula ✅ COMPLETED
**File**: `src/features/property/stores/Property.ts`

Updated the `calculateProjection` method to include cash flow calculation:
```typescript
// For each year in projection:
if (this.inputs.isRentalProperty) {
  // Calculate rental income with growth and vacancy
  const monthlyRent = baseMonthlyRent * Math.pow(1 + rentGrowthRate / 100, year);
  const grossAnnualRent = monthlyRent * 12;
  const netRentalIncome = grossAnnualRent * (1 - vacancyRate / 100);
  
  // Calculate expenses with growth
  const annualExpenses = baseAnnualExpenses * Math.pow(1 + expenseGrowthRate / 100, year);
  
  // Calculate net cash flow
  const annualCashFlow = netRentalIncome - annualExpenses - annualMortgagePayment;
} else {
  // Non-rental property: cash flow is negative mortgage payment
  const annualCashFlow = -(actualTotalPayment * 12);
}
```

## Phase 3: Investment Integration Updates ✅ COMPLETED

### 3.1 Rename and Update Portfolio Method ✅ COMPLETED
**File**: `src/features/portfolio/stores/PortfolioStore.ts`

Renamed `getLinkedPropertyWithdrawals` to `getLinkedPropertyCashFlows` and updated logic:
```typescript
getLinkedPropertyCashFlows(investmentId: string): number[] {
  // Find linked properties and sum their annual cash flows
  // Positive values = property contributes to investment
  // Negative values = property withdraws from investment
  totalAnnualCashFlow += propertyResult.annualCashFlow;
}
```

### 3.2 Update Investment Calculation ✅ COMPLETED
**File**: `src/features/investment/stores/Investment.ts`

Updated references from withdrawals to cash flows:
```typescript
get linkedPropertyCashFlows(): number[] {
  return this.portfolioStore?.getLinkedPropertyCashFlows?.(this.id) || [];
}

// In calculation:
const propertyCashFlow = linkedPropertyCashFlows?.[year - 1] || 0;
const availableBalance = balance + propertyCashFlow; // Note: + instead of -
```

### 3.3 Update Test Files ✅ COMPLETED
Updated all test files to use new method names and terminology:
- `Investment.test.ts`: Updated method calls and terminology
- `PortfolioStore.test.ts`: Updated method calls and test expectations
- UI components: Updated labels from "withdrawals" to "cash flows"

## Phase 4: UI Component Updates ✅ COMPLETED

### 4.1 Property Form Updates ✅ COMPLETED
**File**: `src/features/property/components/PropertyInputForm.tsx`

Added rental property toggle and conditional fields:
```tsx
// Added rental property checkbox with icon
// Conditionally shows rental fields when isRentalProperty is true
// Includes: monthlyRent, rentGrowthRate, vacancyRate, annualExpenses, expenseGrowthRate
// Updated Payment Source descriptions for bidirectional cash flows
// Added visual separation and clear labeling for rental property section
```

### 4.2 Property Display Updates ✅ COMPLETED
**Files**: 
- `src/features/property/components/PropertySummary.tsx` ✅ COMPLETED
- `src/features/property/components/PropertyProjectionResults.tsx` ✅ COMPLETED

Added comprehensive cash flow display:
```tsx
// PropertySummary: Added 6th card showing annual cash flow
// - Color-coded: green for positive, red for negative
// - Shows both annual and monthly cash flow
// - Special icon and description for rental properties

// PropertyProjectionResults: Added "Annual Cash Flow" column
// - Color-coded cash flow values in amortization table
// - Shows year-by-year cash flow progression
// - Maintains existing mortgage payment tracking
```

## Phase 5: Validation and Testing ✅ COMPLETED

### 5.1 Add Validation Rules ✅ COMPLETED
**File**: `src/features/property/stores/Property.ts`

Enhanced `validationErrors` computed property with comprehensive rental property validation:
```typescript
// Added validation for all rental property fields:
// - Monthly rent: $0-$50,000 range validation
// - Rent growth rate: -10% to 20% range validation
// - Vacancy rate: 0% to 50% range validation
// - Annual expenses: $0-$100,000 range validation
// - Expense growth rate: 0% to 15% range validation
// - Business logic: expense-to-rent ratio warnings
// - Unrealistic scenario detection (expenses > 200% of rent)
```

### 5.2 Add Warning System ✅ COMPLETED
Updated investment warnings to handle bidirectional cash flows:
- Changed "Property withdrawals" to "Property cash outflows"
- Updated calculations to only count negative cash flows as withdrawals
- Maintained existing warning thresholds and logic

### 5.3 Comprehensive Testing ✅ COMPLETED
Added 10 new test cases covering:
- ✅ Rental property default values and configuration
- ✅ Positive cash flow calculations for profitable rentals
- ✅ Negative cash flow calculations for unprofitable rentals
- ✅ Cash flow growth over time with different growth rates
- ✅ Complete validation rule testing for all rental fields
- ✅ Realistic rent-to-expense ratio validation
- ✅ High expense ratio warnings
- ✅ Mortgage payoff scenarios with rental properties
- ✅ Backward compatibility with non-rental properties
- ✅ Serialization/deserialization of rental property data

**Test Results**: All 71 tests passing (increased from 61)

## Phase 6: UI Polish and Documentation

### 6.1 Update Property Summary Cards
Show cash flow status prominently in property summaries.

### 6.2 Update Investment Analysis
Update language from "withdrawals" to "cash flows" where appropriate.

### 6.3 Add Help Text
Provide clear explanations of rental property concepts and cash flow implications.

## Backward Compatibility Strategy

1. **Default Behavior**: All existing properties have `isRentalProperty: false` by default
2. **Existing Logic**: Non-rental properties continue to work exactly as before
3. **Migration**: No data migration needed - new fields added with safe defaults
4. **Progressive Enhancement**: Rental features are additive and opt-in

## Implementation Order Priority

1. **Phase 1**: Core data model (enables testing of calculations)
2. **Phase 2**: Cash flow logic (core feature functionality)
3. **Phase 3**: Investment integration (makes feature useful)
4. **Phase 4**: UI updates (makes feature accessible)
5. **Phase 5**: Validation and testing (ensures quality)
6. **Phase 6**: Polish and documentation (improves UX)

## Key Mathematical Changes

### Current Formula (Non-Rental Properties)
```
Annual Property Cash Flow = -Annual Mortgage Payment  // Always negative
```

### New Formula (Rental Properties)
```
Annual Cash Flow = Net Rental Income - Annual Expenses - Annual Mortgage Payment

Where:
Net Rental Income = (Monthly Rent × 12) × (1 - vacancy_rate/100)
Monthly Rent(year) = Initial Monthly Rent × (1 + rent_growth_rate/100)^year
Annual Expenses(year) = Base Annual Expenses × (1 + expense_growth_rate/100)^year
```

### Investment Integration Changes
```
// Current (withdrawal-only)
Available Balance = Balance(year-1) - PropertyWithdrawals(year)

// New (bidirectional cash flow)
Available Balance = Balance(year-1) + PropertyCashFlows(year)
```

This plan maintains the existing MobX reactive architecture while adding the minimum necessary complexity to support rental property cash flows. The key insight is that rental properties simply change the sign and calculation of cash flows, but the underlying investment linking mechanism remains the same.