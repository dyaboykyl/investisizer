# BUSINESS_LOGIC.md

## Financial Calculation Rules & Formulas

This document defines the mathematical formulas and business rules that govern all financial projections in Investisizer. These rules are stable and form the core calculation engine of the application.

## Investment Projections

### Core Investment Formula

The fundamental compound interest calculation with annual contributions:

```
Balance(year) = (Balance(year-1) × (1 + rate)) + Contribution(year) - PropertyWithdrawals(year)
```

**Where:**
- `Balance(0) = Initial Amount`
- `rate = Annual Rate of Return / 100`
- `Contribution(year)` = Annual contribution (may be inflation-adjusted)
- `PropertyWithdrawals(year)` = Sum of linked property payments for that year

### Investment Calculation Details

#### Year 0 (Initial State)
```typescript
balance = initialAmount
annualContribution = 0  // No contribution in year 0
totalEarnings = 0
yearlyGain = 0
```

#### Year N (N > 0)
```typescript
// Step 1: Calculate this year's contribution
yearContribution = inflationAdjustedContributions 
    ? annualContribution × (1 + inflationRate/100)^year
    : annualContribution

// Step 2: Apply property withdrawals
propertyWithdrawal = sum of all linked property payments for this year
netYearContribution = yearContribution - propertyWithdrawal

// Step 3: Apply growth and contribution
previousBalance = balance
balance = previousBalance × (1 + rateOfReturn/100) + netYearContribution

// Step 4: Calculate metrics
investmentGains = previousBalance × (rateOfReturn/100)
totalEarnings = cumulative investment gains (not including contributions)
yearlyGain = balance - previousBalance  // Includes both gains and contributions
```

### Inflation-Adjusted Contributions

When `inflationAdjustedContributions = true`:

```
Nominal Contribution(year) = Base Contribution × (1 + inflation_rate/100)^year
Real Contribution(year) = Base Contribution  // Maintains purchasing power
```

**Purpose:** Allows users to maintain constant purchasing power of their contributions over time.

### Real (Inflation-Adjusted) Values

All investment values are calculated in both nominal and real terms:

```
Real Balance(year) = Nominal Balance(year) / (1 + inflation_rate/100)^year
Real Annual Contribution(year) = Nominal Annual Contribution(year) / (1 + inflation_rate/100)^year
Real Earnings(year) = Nominal Earnings(year) / (1 + inflation_rate/100)^year
```

## Property Projections

### Property Value Growth

```
Property Value(year) = Purchase Price × (1 + property_growth_rate/100)^(years_owned + year)
```

**Where:**
- `years_owned = yearsBought` (how many years ago the property was purchased)
- Property grows from current estimated value, not original purchase price

### Mortgage Amortization

Standard amortization formula for monthly payments:

```
Monthly Payment = P × [r(1+r)^n] / [(1+r)^n - 1]
```

**Where:**
- `P = Principal (loan amount) = Purchase Price × (1 - down_payment_percentage/100)`
- `r = Monthly interest rate = annual_interest_rate / 100 / 12`
- `n = Total number of payments = loan_term_years × 12`

### Year-by-Year Mortgage Calculations

For each year in the projection:

```typescript
// Starting values
remainingBalance = originalLoanAmount
yearsPaid = yearsBought + year  // Total years since purchase

// Calculate remaining balance after yearsPaid
for (month = 1 to yearsPaid × 12) {
    monthlyInterest = remainingBalance × monthlyInterestRate
    monthlyPrincipal = monthlyPayment - monthlyInterest
    remainingBalance = remainingBalance - monthlyPrincipal
}

// Annual aggregations
annualPrincipalPaid = sum of monthly principal for the year
annualInterestPaid = sum of monthly interest for the year
```

### Property Equity Calculation

```
Property Equity(year) = Property Value(year) - Remaining Mortgage Balance(year)
Real Property Equity(year) = Property Equity(year) / (1 + inflation_rate/100)^year
```

## Property-Investment Linking

### Linking Mechanism

When a property has `linkedInvestmentId`, its monthly payments are automatically withdrawn from the linked investment:

```
Annual Property Withdrawal = Monthly Payment × 12
Net Investment Contribution = Base Annual Contribution - Annual Property Withdrawal
```

### Calculation Flow

1. **Property calculates** its monthly payment (P+I or custom amount)
2. **PortfolioStore aggregates** all property withdrawals per investment via `getLinkedPropertyWithdrawals()`
3. **Investment receives** withdrawal array through reactive computed property
4. **Investment applies** withdrawals as negative contributions in its projection

### Multi-Property Linking

Multiple properties can link to the same investment:

```
Total Withdrawals(investment, year) = Σ (Property Monthly Payment × 12) 
    for all enabled properties where linkedInvestmentId = investment.id
```

## Portfolio-Level Calculations

### Combined Results Aggregation

For each year across all enabled assets:

```typescript
// Investment aggregations
totalInvestmentBalance = Σ investment.balance (for all enabled investments)
totalInvestmentEarnings = Σ investment.totalEarnings

// Property aggregations  
totalPropertyValue = Σ property.propertyValue (for all enabled properties)
totalMortgageBalance = Σ property.mortgageBalance
totalPropertyEquity = totalPropertyValue - totalMortgageBalance

// Combined totals
totalBalance = totalInvestmentBalance + totalPropertyEquity
totalAnnualContribution = Σ (investment.contribution + property.annualPayments)
```

### Portfolio Contribution Calculations

```typescript
// Separate positive contributions from withdrawals
totalContributions = Σ max(0, asset.annualContribution) for all enabled assets
totalWithdrawn = Σ max(0, -asset.annualContribution) for all enabled assets
netContributions = totalContributions - totalWithdrawn

// Initial vs ongoing contributions
totalInitialInvestment = Σ asset.initialAmount for all enabled assets
totalOngoingContributions = totalContributions × years
```

## Validation Rules & Edge Cases

### Input Validation

- **Years**: Minimum 1, maximum reasonable limit (e.g., 50)
- **Rates**: Can be negative (for market downturns or deflation)
- **Amounts**: Can be negative (for withdrawals)
- **Property years bought**: Cannot be negative

### Edge Case Handling

#### Negative Investment Balances
- Investments can go negative if withdrawals exceed growth
- System continues calculations (allows modeling of debt scenarios)
- UI may show warnings for negative balances

#### Property Paid Off
- When mortgage balance reaches 0, no further principal/interest calculations
- Property value continues to grow
- If linked to investment, withdrawals stop when mortgage is paid off

#### Zero or Negative Returns
- System handles negative return rates for market downturns
- Calculations remain mathematically valid
- Real returns can be negative even with positive nominal returns (high inflation)

### Inflation Rate Considerations

- **Inflation affects**: Real value calculations and inflation-adjusted contributions
- **Inflation does NOT affect**: Nominal investment returns or property growth rates
- **Edge case**: Very high inflation rates (>50%) may produce extreme real value discrepancies

## Calculation Precision

### Rounding Rules
- **Intermediate calculations**: Full precision maintained
- **Display values**: Rounded to nearest dollar for UI
- **Percentage calculations**: Maintained to 2 decimal places
- **Final storage**: Numbers stored as-is, rounding applied only for display

### Performance Considerations
- Calculations are performed year-by-year (not month-by-month for investments)
- Property mortgage calculations use monthly precision internally
- MobX computed properties cache results until dependencies change

## Business Logic Constants

### Default Values
```typescript
DEFAULT_INITIAL_AMOUNT = "10000"
DEFAULT_YEARS = "10" 
DEFAULT_RATE_OF_RETURN = "7"
DEFAULT_INFLATION_RATE = "2.5"
DEFAULT_ANNUAL_CONTRIBUTION = "5000"
DEFAULT_PROPERTY_GROWTH_RATE = "3"
DEFAULT_DOWN_PAYMENT_PERCENTAGE = "20"
DEFAULT_LOAN_TERM = "30"
```

### Constraints
```typescript
MINIMUM_YEARS = 1
MAXIMUM_REASONABLE_YEARS = 50
MINIMUM_INFLATION_RATE = -10  // Severe deflation
MAXIMUM_INFLATION_RATE = 50   // Hyperinflation scenarios
```

## Formula Verification Examples

### Investment Example
```
Initial: $10,000
Rate: 10% annually  
Contribution: $1,000 annually
Years: 3

Year 0: $10,000
Year 1: $10,000 × 1.10 + $1,000 = $12,000
Year 2: $12,000 × 1.10 + $1,000 = $14,200  
Year 3: $14,200 × 1.10 + $1,000 = $16,620
```

### Property Example
```
Purchase: $500,000
Down Payment: 20% ($100,000)
Loan: $400,000
Interest: 6% annually (0.5% monthly)
Term: 30 years
Monthly Payment: $2,398.20

Year 1 Interest: ~$23,760
Year 1 Principal: ~$5,018
Remaining Balance: ~$394,982
```

### Linked Property-Investment Example
```
Investment: $100,000 initial, $12,000 annual contribution, 7% return
Property: $2,000 monthly payment = $24,000 annually

Net Investment Contribution = $12,000 - $24,000 = -$12,000
Investment Balance after Year 1 = $100,000 × 1.07 + (-$12,000) = $95,000
```

This mathematical foundation ensures consistent, accurate financial projections across all asset types and scenarios in the Investisizer application.