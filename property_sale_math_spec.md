# PROPERTY_SALE_MATH.md

## Property Sale Feature Mathematical Specifications

This document defines the mathematical formulas and business logic required to implement the property sale feature in Investisizer. These calculations integrate with existing business logic while adding sale-specific computations.

## Core Sale Calculations

### Net Proceeds Formula
```
Net Sale Proceeds = Sale Price - Remaining Mortgage Balance - Selling Costs

Where:
Sale Price = User Input OR Projected Market Value(sale_year)
Projected Market Value(sale_year) = Property Value calculation at sale year using existing growth models
Remaining Mortgage Balance = Existing amortization calculation at sale year
Selling Costs = Sale Price × (selling_costs_percentage / 100)
```

### Property Value at Sale Year
Using existing property growth formulas from BUSINESS_LOGIC.md:

**Purchase Price Model:**
```
Sale Price = Purchase Price × (1 + property_growth_rate/100)^(yearsBought + sale_year)
```

**Current Value Model:**
```
Sale Price = Current Estimated Value × (1 + property_growth_rate/100)^sale_year
```

## Modified Property Cash Flow Calculations

### Property Lifecycle States

Properties now have three distinct calculation phases:

#### Pre-Sale Years (year < sale_year)
Normal cash flow calculations apply using existing formulas:
```
Annual Cash Flow = Net Rental Income - Annual Expenses - Annual Mortgage Payment

Where (existing formulas):
Net Rental Income = (Monthly Rent × 12) × (1 - vacancy_rate/100)
Monthly Rent(year) = Initial Monthly Rent × (1 + rent_growth_rate/100)^year
Annual Expenses(year) = Base Annual Expenses × (1 + expense_growth_rate/100)^year
```

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
Annual Mortgage Payment = 0
```

## Investment Impact Calculations

### Modified Investment Formula with Sale Proceeds

**CRITICAL:** Sale proceeds are applied BEFORE growth calculation, consistent with existing property cash flow logic:

```
// Modified from existing investment formula
Available Balance = Balance(year-1) + PropertyCashFlows(year) + SaleProceeds(year)
Balance After Growth = Available Balance × (1 + rate)
Balance(year) = Balance After Growth + Contribution(year)

Where:
SaleProceeds(year) = Net Sale Proceeds if (year == sale_year AND reinvest_proceeds == true)
                   = 0 otherwise
PropertyCashFlows(year) = Modified property cash flow array (see below)
```

### Property Cash Flow Array Modification

For linked investments, the property cash flow array is modified:

```typescript
PropertyCashFlows(investment, year) = {
  if (year < sale_year): normal property cash flow calculation
  if (year == sale_year): partial_year_operating_cash_flow + (reinvest_proceeds ? sale_proceeds : 0)
  if (year > sale_year): 0
}
```

### Investment Metrics Recalculation

```typescript
// Year N calculation with sale proceeds
yearContribution = inflationAdjustedContributions 
    ? annualContribution × (1 + inflationRate/100)^year
    : annualContribution

// Property cash flows now include potential sale proceeds
propertyCashFlow = sum of all linked property cash flows for this year (including sale proceeds)
availableBalance = previousBalance + propertyCashFlow

balanceAfterGrowth = availableBalance × (1 + rateOfReturn/100)
balance = balanceAfterGrowth + yearContribution

// Net contribution includes sale proceeds impact
netYearContribution = yearContribution + propertyCashFlow
annualInvestmentGain = balanceAfterGrowth - availableBalance
yearlyGain = balance - previousBalance
```

## Portfolio-Level Recalculations

### Modified Asset Aggregations

```typescript
// Portfolio totals must account for sold properties
totalPropertyValue(year) = Σ property.propertyValue(year) 
    for properties where (year <= sale_year AND enabled)

totalMortgageBalance(year) = Σ property.mortgageBalance(year) 
    for properties where (year <= sale_year AND enabled)

totalPropertyEquity(year) = totalPropertyValue(year) - totalMortgageBalance(year)

// Combined portfolio value
totalBalance(year) = totalInvestmentBalance(year) + totalPropertyEquity(year)
```

### Asset Allocation Tracking

```typescript
// Track portfolio composition changes due to sales
propertyAllocation(year) = totalPropertyEquity(year) / totalBalance(year)
investmentAllocation(year) = totalInvestmentBalance(year) / totalBalance(year)

// Notable transition occurs at sale year:
// Property equity decreases, investment balance increases by sale proceeds
```

## Real (Inflation-Adjusted) Values

### Sale Proceeds Inflation Adjustment

```typescript
Real Sale Proceeds(year) = Nominal Sale Proceeds / (1 + inflation_rate/100)^sale_year
Real Selling Costs(year) = Nominal Selling Costs / (1 + inflation_rate/100)^sale_year
Real Net Proceeds(year) = Real Sale Proceeds - Real Selling Costs
```

### Property Equity Transfer Analysis

```typescript
// Track real value of equity transition
Real Property Equity Lost = Property Equity(sale_year-1) / (1 + inflation_rate/100)^sale_year
Real Investment Gain from Sale = Real Net Proceeds - Real Property Equity Lost
```

## Edge Cases and Validation

### Underwater Property Sales

```typescript
if (Remaining Mortgage Balance > Sale Price - Selling Costs) {
    Net Proceeds = Sale Price - Selling Costs - Remaining Mortgage Balance  // Negative value
    // System should continue calculations but flag as loss scenario
}
```

### Partial Year Calculations

```typescript
// Default to mid-year sale if not specified
months_until_sale = user_defined_month ?? 6

// Prorate all annual values
prorated_rental_income = annual_rental_income × (months_until_sale / 12)
prorated_expenses = annual_expenses × (months_until_sale / 12)  
prorated_mortgage_payments = monthly_mortgage_payment × months_until_sale

partial_year_cash_flow = prorated_rental_income - prorated_expenses - prorated_mortgage_payments
```

### Multiple Property Sales

```typescript
// Handle multiple properties selling in same year to same investment
Total Sale Proceeds(investment, year) = Σ Net Sale Proceeds 
    for all properties where (linkedInvestmentId == investment.id AND sale_year == year)
```

### Sale Year Boundary Conditions

```typescript
// Ensure sale calculations only apply in appropriate years
isActiveInYear(property, year): boolean {
    return property.enabled && (property.sale_year == null || year <= property.sale_year)
}

hasBeenSold(property, year): boolean {
    return property.sale_year != null && year > property.sale_year
}
```

## Scenario Comparison Calculations

### Hold vs. Sell Analysis

```typescript
// Calculate portfolio value under both scenarios
Hold Scenario Value(final_year) = Property Value(final_year) + Investment Balance(final_year)
Sell Scenario Value(final_year) = 0 + Enhanced Investment Balance(final_year)

// Where Enhanced Investment Balance includes compounded growth on sale proceeds
Net Benefit of Selling = Sell Scenario Value - Hold Scenario Value
Opportunity Cost = abs(Net Benefit of Selling)  // Cost of chosen path
```

### Internal Rate of Return Impact

```typescript
// IRR calculations must account for timing of asset transitions
Property IRR = calculateIRR(cash_flows[0..sale_year])  // Truncated at sale
Investment IRR = calculateIRR(enhanced_cash_flows[0..final_year])  // With sale proceeds
Portfolio IRR = blended calculation weighted by asset values and timing
```

## Performance Optimizations

### Calculation Branching

```typescript
// Avoid unnecessary calculations for sold properties
calculatePropertyMetrics(property, year) {
    if (hasBeenSold(property, year)) {
        return ZERO_PROPERTY_METRICS  // Cached zero values
    }
    // Normal calculation logic
}
```

### MobX Computed Dependencies

New computed properties required:

```typescript
// Property class additions
get saleProceeds(): number
get netSaleProceeds(): number  
get remainingYearsUntilSale(): number
get isPlannedForSale(): boolean
get modifiedCashFlows(): number[]  // Array including sale proceeds
get sellingCosts(): number

// Helper methods
isActiveInYear(year: number): boolean
hasBeenSoldByYear(year: number): boolean
getCashFlowForYear(year: number): number  // Includes sale proceeds logic
```

## Input Validation Rules

### Sale Configuration Validation

```typescript
// Sale year validation
sale_year >= 1 && sale_year <= projection_years

// Sale price validation (when user-defined)
expected_sale_price > 0
expected_sale_price > selling_costs

// Selling costs validation
selling_costs_percentage >= 0 && selling_costs_percentage <= 20  // 20% max reasonable

// Reinvestment validation
if (reinvest_proceeds && !linkedInvestmentId) {
    // Must select target investment
}
```

### Warning System Triggers

```typescript
// Financial warning conditions
if (Net Sale Proceeds < 0) {
    warning = "Property sale will result in a loss after mortgage payoff and selling costs"
}

if (Remaining Mortgage Balance > 0.9 * Sale Price) {
    warning = "High mortgage balance relative to sale price may limit proceeds"
}

if (sale_year <= 3) {
    warning = "Selling shortly after purchase may incur additional costs and limit appreciation"
}

if (selling_costs_percentage > 10) {
    warning = "Selling costs exceed typical range of 6-8%"
}
```

## Integration with Existing Business Logic

### Compatibility Requirements

1. **Existing Property Calculations**: All current property formulas remain unchanged for pre-sale years
2. **Investment Cash Flow Logic**: Sale proceeds follow existing pattern of applying before growth
3. **Inflation Adjustments**: Real value calculations apply consistently to sale proceeds
4. **Mortgage Amortization**: Existing mortgage math continues until sale year
5. **Portfolio Aggregations**: Existing summation logic handles sold properties via conditional inclusion

### Data Structure Additions

```typescript
// Property class extensions needed
interface PropertySaleConfig {
    isPlannedForSale: boolean
    saleYear: number | null
    expectedSalePrice: number | null  // null = use projected value
    useProjectedValue: boolean
    sellingCostsPercentage: number
    reinvestProceeds: boolean
    targetInvestmentId: string | null  // for reinvestment
    saleMonth: number  // 1-12, default 6 for mid-year
}
```

### Calculation Flow Integration

1. **Property computes** sale proceeds and modified cash flows
2. **PortfolioStore aggregates** all property cash flows including sale proceeds
3. **Investment receives** enhanced cash flow array through reactive computed property
4. **Investment applies** sale proceeds before growth calculation (existing pattern)
5. **Portfolio totals** reflect asset reallocation seamlessly

This mathematical framework ensures the property sale feature integrates seamlessly with existing calculations while providing accurate modeling of property liquidation scenarios and their impact on overall portfolio performance.