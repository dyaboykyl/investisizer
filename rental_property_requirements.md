# Rental Property Feature Requirements

## Summary of Rental Property Changes

### Mathematical Changes Required

**Add one new calculation to property business logic:**
- Calculate annual property cash flow that can be positive (rental income exceeds expenses) or negative (expenses exceed rental income)
- Formula: Annual rental income minus annual expenses minus mortgage payments
- Rental income grows annually by rent growth rate
- Expenses grow annually by expense growth rate
- Apply vacancy rate as percentage reduction to gross rental income

**Modify investment linking logic:**
- Change from withdrawal-only to bidirectional cash flow
- Properties can now contribute money to linked investments (positive cash flow) or withdraw money (negative cash flow)
- Traditional non-rental properties continue to work as before (withdrawal only)

### New Input Fields Required

**Add to Property class:**
- Boolean flag to enable rental calculations
- Monthly rent amount
- Annual rent growth rate percentage
- Expected vacancy rate percentage  
- Total annual expenses amount
- Annual expense growth rate percentage

### New Output Fields Required

**Add to Property results:**
- Single new field for annual cash flow amount
- This replaces the current mortgage payment withdrawal concept
- Can be positive (property generates excess cash) or negative (property requires cash input)

### User Interface Changes Needed

**Property form enhancements:**
- Add checkbox to enable rental property mode
- Show rental input fields only when rental mode is enabled
- Include fields for rent amount, growth rates, vacancy rate, and expenses

**Property display updates:**
- Show annual cash flow in property summaries
- Indicate whether property contributes to or withdraws from linked investments
- Update any existing withdrawal language to reflect bidirectional cash flow

### Portfolio Level Changes

**Investment calculation updates:**
- Modify investment projection logic to handle positive cash flows from properties
- Update portfolio aggregation to account for rental income streams
- Ensure all existing non-rental properties continue working unchanged

**Default values needed:**
- Reasonable defaults for monthly rent, growth rates, vacancy rate, and annual expenses
- Default expense growth rate tied to inflation assumptions

### Validation Rules

**Add input validation for:**
- Rental amounts within reasonable ranges
- Growth rates that don't create unrealistic scenarios
- Vacancy rates between 0% and reasonable maximum
- Expense amounts that make sense relative to rental income

## Implementation Notes

This approach maintains the existing architecture while adding the minimum necessary complexity to support rental property cash flow modeling and investment linking. The key principle is that properties now generate a net annual cash flow that can either contribute to or withdraw from linked investments, replacing the current mortgage-payment-only withdrawal model.

### Backward Compatibility

All existing non-rental properties will continue to function exactly as before. The rental functionality is additive and optional, triggered only when the rental property flag is enabled.

### Default Values Recommendations

- Monthly Rent: $2,000
- Rent Growth Rate: 3%
- Vacancy Rate: 5%
- Annual Expenses: $8,000
- Expense Growth Rate: 3%

### Validation Constraints

- Monthly Rent: $0 - $50,000
- Rent Growth Rate: -10% to 20%
- Vacancy Rate: 0% to 50%
- Annual Expenses: $0 - $100,000
- Expense Growth Rate: 0% to 15%