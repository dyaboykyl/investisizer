# BUSINESS_LOGIC.md

## Financial Calculation Rules & Formulas

This document defines the mathematical formulas and business rules that govern all financial projections in Investisizer. These rules are stable and form the core calculation engine of the application.

## Investment Projections

### Core Investment Formula

**CRITICAL:** Property withdrawals are applied BEFORE growth calculation to ensure mathematical accuracy:

```
Available Balance = Balance(year-1) - PropertyWithdrawals(year)
Balance After Growth = Available Balance × (1 + rate)
Balance(year) = Balance After Growth + Contribution(year)
```

**Where:**
- `Balance(0) = Initial Amount`
- `rate = Annual Rate of Return / 100`
- `Contribution(year)` = Annual contribution (may be inflation-adjusted)
- `PropertyWithdrawals(year)` = Sum of linked property payments for that year

**Mathematical Reasoning:** Withdrawals must occur before growth calculation because money withdrawn for property payments cannot earn investment returns during that year.

### Investment Calculation Details

#### Year 0 (Initial State)
```typescript
balance = initialAmount
annualContribution = 0  // No contribution in year 0
totalEarnings = 0
yearlyGain = 0
annualInvestmentGain = 0  // No investment gains in year 0
```

#### Year N (N > 0)
```typescript
// Step 1: Calculate this year's contribution
yearContribution = inflationAdjustedContributions 
    ? annualContribution × (1 + inflationRate/100)^year
    : annualContribution

// Step 2: Apply property withdrawals BEFORE growth
propertyWithdrawal = sum of all linked property payments for this year
availableBalance = previousBalance - propertyWithdrawal

// Step 3: Apply growth to available balance only
balanceAfterGrowth = availableBalance × (1 + rateOfReturn/100)

// Step 4: Add contributions after growth
balance = balanceAfterGrowth + yearContribution

// Step 5: Calculate metrics
netYearContribution = yearContribution - propertyWithdrawal
annualInvestmentGain = balanceAfterGrowth - availableBalance  // Growth only
yearlyGain = balance - previousBalance  // Total change (growth + contributions - withdrawals)
totalEarnings = cumulative investment gains (not including contributions/withdrawals)
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

Properties support two growth models:

#### Purchase Price Growth Model (Default)
```
Property Value(year) = Purchase Price × (1 + property_growth_rate/100)^(yearsBought + year)
```

#### Current Value Growth Model 
```
Property Value(year) = Current Estimated Value × (1 + property_growth_rate/100)^year
```

**Where:**
- `yearsBought` = How many years ago the property was purchased
- `Current Estimated Value` = User-provided current market value estimate
- Growth applies from the selected base value

**Use Cases:**
- **Purchase Price Model**: Growth from original purchase price (traditional appreciation calculation)
- **Current Value Model**: Growth from current market estimate (useful when current value differs significantly from purchase price)

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
    if (remainingBalance > 0) {
        monthlyInterest = remainingBalance × monthlyInterestRate
        monthlyPrincipal = min(monthlyPayment - monthlyInterest, remainingBalance)
        remainingBalance = remainingBalance - monthlyPrincipal
    }
}

// Determine actual payments after mortgage payoff
if (remainingBalance <= 0) {
    // Mortgage is paid off
    if (userDefinedMonthlyPayment > 0) {
        // Custom payment: continue paying the custom amount
        actualMonthlyPayment = userDefinedMonthlyPayment
        principalInterestPayment = 0  // No more P+I
    } else {
        // Standard payment: stop paying when mortgage is paid off
        actualMonthlyPayment = 0
        principalInterestPayment = 0
    }
} else {
    // Mortgage still active
    actualMonthlyPayment = originalMonthlyPayment
    principalInterestPayment = calculatedPIPayment
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
```

**CRITICAL:** Property withdrawals are applied to the investment balance BEFORE calculating investment growth for that year.

### Calculation Flow

1. **Property calculates** its monthly payment for each year (P+I, custom amount, or 0 if mortgage paid off)
2. **PortfolioStore aggregates** all property withdrawals per investment per year via `getLinkedPropertyWithdrawals()`
3. **Investment receives** withdrawal array through reactive computed property
4. **Investment applies** withdrawals BEFORE growth calculation in its projection

### Mortgage Payoff Impact on Linked Investments

When a property's mortgage is paid off:
- **Standard payments**: Property monthly payment becomes 0, so investment withdrawals stop automatically
- **Custom payments**: Continue at the custom amount regardless of mortgage status
- **Investment impact**: Investment contributions return to full amount when standard mortgage payments stop

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
- **Property years bought**: Cannot be negative or exceed projection years
- **Current estimated value**: Must be positive when using current value growth model
- **Property growth model**: Must be either 'purchase_price' or 'current_value'

### Warning System

The application provides warnings for potentially problematic scenarios:

#### Investment Warnings
- **Negative balance**: When investment balance goes negative due to property withdrawals
- **Excessive withdrawals**: When property withdrawals significantly exceed investment contributions (> 2x)

#### Property Warnings
- **Validation errors**: When required fields are missing or invalid for selected growth model

### Edge Case Handling

#### Negative Investment Balances
- Investments can go negative if withdrawals exceed growth
- System continues calculations (allows modeling of debt scenarios)
- UI may show warnings for negative balances

#### Property Paid Off
- When mortgage balance reaches 0, no further principal/interest calculations
- Property value continues to grow according to selected growth model
- **Standard payments**: Monthly payment becomes 0, linked investment withdrawals stop automatically
- **Custom payments**: Continue at custom amount regardless of mortgage status
- Property equity = full property value (no mortgage debt)

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

### Linked Property-Investment Example (Corrected Math)
```
Investment: $100,000 initial, $12,000 annual contribution, 7% return
Property: $2,000 monthly payment = $24,000 annually

CORRECT Calculation:
Available Balance = $100,000 - $24,000 = $76,000 (withdrawal applied first)
Balance After Growth = $76,000 × 1.07 = $81,320
Final Balance = $81,320 + $12,000 = $93,320

Annual Investment Gain = $81,320 - $76,000 = $5,320 (growth only)
Yearly Gain = $93,320 - $100,000 = -$6,680 (total change including withdrawals)
```

### Property Growth Model Examples
```
Property purchased 3 years ago for $400,000, 3% annual growth:

Purchase Price Model:
Year 1 Value = $400,000 × (1.03)^(3+1) = $400,000 × 1.125509 = $450,204

Current Value Model (estimated current value $450,000):
Year 1 Value = $450,000 × (1.03)^1 = $450,000 × 1.03 = $463,500
```

This mathematical foundation ensures consistent, accurate financial projections across all asset types and scenarios in the Investisizer application.