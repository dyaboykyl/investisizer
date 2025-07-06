# BUSINESS_LOGIC.md

## Financial Calculation Rules & Formulas

This document defines the mathematical formulas and business rules that govern all financial projections in Investisizer. These rules are stable and form the core calculation engine of the application.

## Investment Projections

### Core Investment Formula

**CRITICAL:** Property cash flows are applied BEFORE growth calculation to ensure mathematical accuracy:

```
Available Balance = Balance(year-1) + PropertyCashFlows(year)
Balance After Growth = Available Balance × (1 + rate)
Balance(year) = Balance After Growth + Contribution(year)
```

**Where:**
- `Balance(0) = Initial Amount`
- `rate = Annual Rate of Return / 100`
- `Contribution(year)` = Annual contribution (may be inflation-adjusted)
- `PropertyCashFlows(year)` = Sum of linked property cash flows for that year (can be positive or negative)

**Mathematical Reasoning:** Property cash flows must occur before growth calculation because money withdrawn for property payments cannot earn investment returns during that year, and money contributed from rental properties should be available for growth during that year.

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

// Step 2: Apply property cash flows BEFORE growth
propertyCashFlow = sum of all linked property cash flows for this year (can be positive or negative)
availableBalance = previousBalance + propertyCashFlow

// Step 3: Apply growth to available balance only
balanceAfterGrowth = availableBalance × (1 + rateOfReturn/100)

// Step 4: Add contributions after growth
balance = balanceAfterGrowth + yearContribution

// Step 5: Calculate metrics
netYearContribution = yearContribution + propertyCashFlow  // Note: + because cashFlow can be negative
annualInvestmentGain = balanceAfterGrowth - availableBalance  // Growth only
yearlyGain = balance - previousBalance  // Total change (growth + contributions + property cash flows)
totalEarnings = cumulative investment gains (not including contributions/property cash flows)
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

### Property Cash Flow Calculation

Properties can be configured as rental properties, generating annual cash flows that affect linked investments:

#### Rental Property Cash Flow Formula
```
Annual Cash Flow = Net Rental Income - Annual Expenses - Annual Mortgage Payment

Where:
Net Rental Income = (Monthly Rent × 12) × (1 - vacancy_rate/100)
Monthly Rent(year) = Initial Monthly Rent × (1 + rent_growth_rate/100)^year
Annual Expenses(year) = Maintenance Expenses + Property Management Expenses
```

#### Enhanced Expense Model

**Maintenance Expenses:**
```
Annual Maintenance = Property Value(year) × (maintenance_rate/100)
```
- Scales with property value (unaffected by vacancy)
- Typical range: 1-3% of property value

**Property Management Expenses (when enabled):**
```
Monthly Management Fee = Net Monthly Rental Income × (management_fee_rate/100)
Annual Management Fee = Monthly Management Fee × 12

Listing Expenses = Listing Events(year) × Monthly Rent × (listing_fee_rate/100)

Where Listing Events are calculated based on realistic tenant turnover:
assumedVacantMonthsPerTurnover = 1.5
occupiedMonthsPerTurnover = assumedVacantMonthsPerTurnover × (100 - vacancy_rate) / vacancy_rate
totalCycleLength = occupiedMonthsPerTurnover + assumedVacantMonthsPerTurnover
annualListingEvents = (12 / totalCycleLength) × (monthsOwned / 12)
```

**Property Management Logic:**
- Management fees are based on actual rent collected (vacancy reduces fees)
- Listing fees scale with tenant turnover frequency (higher vacancy = shorter tenant stays = more listing events)
- Example: 10% vacancy rate results in ~0.8 listing events per year (realistic tenant turnover)

#### Non-Rental Property Cash Flow
```
Annual Cash Flow = -Annual Mortgage Payment  // Always negative (withdrawal)
```

**Cash Flow Sign Convention:**
- **Positive cash flow**: Property generates excess income that contributes to linked investments
- **Negative cash flow**: Property requires funding from linked investments
- **Zero cash flow**: Property is self-sustaining (rental income exactly covers all expenses)

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

## Property Sale Planning

### Sale Configuration

Properties can be configured for planned sale with comprehensive timing and price controls:

#### Sale Timing
```
Sale Year: Year within projection period (1 to max years)
Sale Month: Month within sale year (1-12)
```

#### Sale Price Methods

**Projected Value Method (Default):**
```
Sale Price = Property Value(sale_year) according to growth model
```
- Uses the selected growth model (purchase price or current value)
- Automatically calculates appreciation based on growth rate

**Custom Sale Price Method:**
```
Sale Price = User-specified expected sale price
```
- Allows override of calculated appreciation
- Useful for market timing or specific sale scenarios

#### Sale Costs and Net Proceeds
```
Selling Costs = Sale Price × (selling_costs_percentage/100)
Mortgage Payoff = Remaining Mortgage Balance(sale_year)
Net Sale Proceeds = Sale Price - Selling Costs - Mortgage Payoff
```

#### Sale Proceeds Reinvestment

When `reinvestProceeds = true`:
```
Target Investment: Specified investment asset
Contribution Timing: Applied in the sale month/year
Investment Impact: Net proceeds added to target investment balance before growth calculation
```

### Partial Year Calculations

When a property is sold mid-year:

**Rental Income (if rental property):**
```
Partial Year Income = (Monthly Rent × sale_month) × (1 - vacancy_rate/100)
```

**Expenses:**
```
Partial Year Expenses = (Annual Expenses / 12) × sale_month
```

**Mortgage Payments:**
```
Partial Year Payments = Monthly Payment × sale_month
```

### Post-Sale Impact

After sale completion:
- Property cash flows cease (no further income or expenses)
- Property value becomes 0 (asset disposed)
- Mortgage balance becomes 0 (paid off at sale)
- If reinvestment enabled: Net proceeds boost target investment balance
- If no reinvestment: Proceeds are removed from portfolio (cash-out scenario)

## Property-Investment Linking

### Linking Mechanism

When a property has `linkedInvestmentId`, its annual cash flow is automatically applied to the linked investment:

```
Annual Property Cash Flow = (for rental properties) Net Rental Income - Expenses - Mortgage Payment
                          = (for non-rental properties) -Mortgage Payment
```

**CRITICAL:** Property cash flows are applied to the investment balance BEFORE calculating investment growth for that year.

### Calculation Flow

1. **Property calculates** its annual cash flow for each year (rental income minus expenses minus mortgage payment, or just negative mortgage payment for non-rentals)
2. **PortfolioStore aggregates** all property cash flows per investment per year via `getLinkedPropertyCashFlows()`
3. **Investment receives** cash flow array through reactive computed property
4. **Investment applies** cash flows BEFORE growth calculation in its projection

### Mortgage Payoff Impact on Linked Investments

When a property's mortgage is paid off:
- **Rental properties**: Cash flow becomes purely rental income minus expenses (likely positive)
- **Non-rental properties**: Cash flow becomes zero (no more withdrawals from linked investment)
- **Investment impact**: Investment no longer has mortgage payment withdrawals, potentially receives rental income contributions

### Multi-Property Linking

Multiple properties can link to the same investment:

```
Total Cash Flows(investment, year) = Σ (Property Annual Cash Flow) 
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
// Separate positive contributions from withdrawals/losses
totalContributions = Σ max(0, asset.annualContribution + asset.annualCashFlow) for all enabled assets
totalWithdrawn = Σ max(0, -(asset.annualContribution + asset.annualCashFlow)) for all enabled assets
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
- **Negative balance**: When investment balance goes negative due to property cash flow requirements
- **Excessive withdrawals**: When negative property cash flows significantly exceed investment contributions (> 2x)

#### Property Warnings
- **Validation errors**: When required fields are missing or invalid for selected growth model
- **Negative cash flow**: When rental property generates negative cash flow (expenses exceed income)

### Edge Case Handling

#### Negative Investment Balances
- Investments can go negative if property cash flow requirements exceed growth
- System continues calculations (allows modeling of debt scenarios)
- UI may show warnings for negative balances

#### Property Paid Off
- When mortgage balance reaches 0, no further principal/interest calculations
- Property value continues to grow according to selected growth model
- **Rental properties**: Cash flow becomes rental income minus expenses (typically positive)
- **Non-rental properties**: Cash flow becomes zero (no more investment withdrawals)
- Property equity = full property value (no mortgage debt)

#### Negative Property Cash Flow
- Rental properties can have negative cash flow if expenses exceed rental income
- System treats negative cash flow as withdrawal from linked investment
- UI may show warnings for properties with persistent negative cash flow

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
// Investment defaults
DEFAULT_INITIAL_AMOUNT = "10000"
DEFAULT_YEARS = "10" 
DEFAULT_RATE_OF_RETURN = "7"
DEFAULT_INFLATION_RATE = "2.5"
DEFAULT_ANNUAL_CONTRIBUTION = "5000"

// Property basics defaults
DEFAULT_PURCHASE_PRICE = "500000"
DEFAULT_PROPERTY_GROWTH_RATE = "3"
DEFAULT_DOWN_PAYMENT_PERCENTAGE = "20"
DEFAULT_INTEREST_RATE = "6.5"
DEFAULT_LOAN_TERM = "30"
DEFAULT_YEARS_BOUGHT = "0"
DEFAULT_PROPERTY_GROWTH_MODEL = "purchase_price"

// Rental property defaults
DEFAULT_MONTHLY_RENT = "2000"
DEFAULT_RENT_GROWTH_RATE = "3"
DEFAULT_VACANCY_RATE = "5"
DEFAULT_MAINTENANCE_RATE = "1.5"

// Property management defaults
DEFAULT_LISTING_FEE_RATE = "100"         // 100% of monthly rent
DEFAULT_MONTHLY_MANAGEMENT_FEE_RATE = "10"  // 10% of monthly rent

// Property sale defaults
DEFAULT_SALE_MONTH = 1
DEFAULT_SELLING_COSTS_PERCENTAGE = "6"   // 6% selling costs
DEFAULT_REINVEST_PROCEEDS = false
```

### Constraints
```typescript
// Global constraints
MINIMUM_YEARS = 1
MAXIMUM_REASONABLE_YEARS = 50
MINIMUM_INFLATION_RATE = -10  // Severe deflation
MAXIMUM_INFLATION_RATE = 50   // Hyperinflation scenarios

// Property constraints
MINIMUM_PURCHASE_PRICE = 1000
MAXIMUM_REASONABLE_PURCHASE_PRICE = 10000000
MINIMUM_DOWN_PAYMENT_PERCENTAGE = 0
MAXIMUM_DOWN_PAYMENT_PERCENTAGE = 100
MINIMUM_INTEREST_RATE = 0
MAXIMUM_REASONABLE_INTEREST_RATE = 20
MINIMUM_LOAN_TERM = 1
MAXIMUM_LOAN_TERM = 50
MINIMUM_YEARS_BOUGHT = 0
MAXIMUM_YEARS_BOUGHT = years  // Cannot exceed projection period

// Rental property constraints
MINIMUM_MONTHLY_RENT = 0
MAXIMUM_REASONABLE_MONTHLY_RENT = 50000
MINIMUM_RENT_GROWTH_RATE = -10  // Rent control scenarios
MAXIMUM_RENT_GROWTH_RATE = 20   // High-growth markets
MINIMUM_VACANCY_RATE = 0
MAXIMUM_VACANCY_RATE = 50       // Very challenging markets
MINIMUM_MAINTENANCE_RATE = 0
MAXIMUM_MAINTENANCE_RATE = 10   // 10% of property value

// Property management constraints
MINIMUM_LISTING_FEE_RATE = 0
MAXIMUM_LISTING_FEE_RATE = 500  // 500% of monthly rent (extreme cases)
MINIMUM_MANAGEMENT_FEE_RATE = 0
MAXIMUM_MANAGEMENT_FEE_RATE = 50  // 50% of monthly rent

// Property sale constraints
MINIMUM_SALE_YEAR = 1
MAXIMUM_SALE_YEAR = years       // Within projection period
MINIMUM_SALE_MONTH = 1
MAXIMUM_SALE_MONTH = 12
MINIMUM_SELLING_COSTS_PERCENTAGE = 0
MAXIMUM_SELLING_COSTS_PERCENTAGE = 20  // 20% selling costs
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

### Linked Property-Investment Example (Updated with Rental Cash Flow)
```
Investment: $100,000 initial, $12,000 annual contribution, 7% return
Rental Property: $3,000 monthly rent, $24,000 annual expenses, $12,000 annual mortgage payment

Annual Property Cash Flow = ($3,000 × 12) - $24,000 - $12,000 = $0 (break-even property)

CALCULATION:
Available Balance = $100,000 + $0 = $100,000 (no impact from property)
Balance After Growth = $100,000 × 1.07 = $107,000
Final Balance = $107,000 + $12,000 = $119,000

Annual Investment Gain = $107,000 - $100,000 = $7,000 (growth only)
Yearly Gain = $119,000 - $100,000 = $19,000 (total change including contributions)
```

### Property Cash Flow Examples
```
Positive Cash Flow Rental:
Monthly Rent: $3,000, Annual Expenses: $15,000, Annual Mortgage: $24,000
Annual Cash Flow = ($3,000 × 12) - $15,000 - $24,000 = $36,000 - $39,000 = -$3,000
Result: Property requires $3,000 annually from linked investment

Break-Even Rental:
Monthly Rent: $2,500, Annual Expenses: $12,000, Annual Mortgage: $18,000  
Annual Cash Flow = ($2,500 × 12) - $12,000 - $18,000 = $30,000 - $30,000 = $0
Result: Property is self-sustaining

Profitable Rental (Mortgage Paid Off):
Monthly Rent: $2,000, Annual Expenses: $8,000, Annual Mortgage: $0
Annual Cash Flow = ($2,000 × 12) - $8,000 - $0 = $24,000 - $8,000 = $16,000  
Result: Property contributes $16,000 annually to linked investment
```

### Property Growth Model Examples
```
Property purchased 3 years ago for $400,000, 3% annual growth:

Purchase Price Model:
Year 1 Value = $400,000 × (1.03)^(3+1) = $400,000 × 1.125509 = $450,204

Current Value Model (estimated current value $450,000):
Year 1 Value = $450,000 × (1.03)^1 = $450,000 × 1.03 = $463,500
```

### Enhanced Property Management Example
```
Rental Property: $2,500 monthly rent, 10% vacancy rate, 10% management fee

Realistic Tenant Turnover Calculation:
assumedVacantMonthsPerTurnover = 1.5
occupiedMonthsPerTurnover = 1.5 × (100 - 10) / 10 = 13.5 months
totalCycleLength = 13.5 + 1.5 = 15 months
annualListingEvents = 12 / 15 = 0.8 events per year

Annual Management Fee = ($2,500 × 12) × (1 - 0.10) × 0.10 = $2,700
Annual Listing Fee = 0.8 × $2,500 × 1.0 = $2,000 (assuming 100% listing fee rate)
```

### Property Sale with Reinvestment Example
```
Property Sale in Year 3:
Sale Price: $600,000 (projected value)
Selling Costs: $600,000 × 6% = $36,000
Mortgage Payoff: $350,000 (remaining balance)
Net Proceeds: $600,000 - $36,000 - $350,000 = $214,000

If reinvested into linked investment:
Investment balance before sale: $120,000
Investment balance after reinvestment: $120,000 + $214,000 = $334,000
Then growth applied: $334,000 × 1.07 = $357,380 (assuming 7% return)
```

This comprehensive mathematical foundation ensures consistent, accurate financial projections across all asset types and scenarios in the Investisizer application, including sophisticated property analysis with rental income, expenses, mortgage calculations, property management fees, and property sale planning with reinvestment capabilities.