# PROPERTY_SALE_UX.md

## Property Sale Feature User Experience Specification

This document defines the complete user experience for the property sale feature in Investisizer, focusing on user interactions, interface design, and workflow patterns that align with existing application conventions.

## Feature Overview

The property sale feature allows users to model selling a property during the projection timeline and automatically reinvesting the proceeds into their investment portfolio. This enables sophisticated scenario planning for major financial decisions involving real estate liquidation.

## User Interface Components

### Property Settings Panel Extension

**Sale Configuration Section:**
- Add new section titled "Sale Planning" in the property settings panel
- Toggle switch: "Plan to sell this property" (default: OFF)
- When enabled, reveals additional configuration options below

**Sale Timing Controls:**
- "Year of planned sale" 
  - Dropdown selector with years 1 through max projection years
  - Default: mid-point of projection timeline
  - Visual indicator: "Year X (20XX)" format for clarity

**Sale Price Configuration:**
- Radio button group:
  - ○ "Use projected market value" (default selection)
  - ○ "Set expected sale price" 
- When "Set expected sale price" selected:
  - Number input field for custom sale price
  - Helper text: "Enter your estimated sale price in today's dollars"

**Selling Costs:**
- Number input: "Selling costs %" 
- Default value: 7%
- Helper text: "Includes realtor fees, closing costs, and other sale expenses"
- Range validation: 0% to 20%

**Proceeds Allocation:**
- Section title: "What to do with sale proceeds?"
- Radio button options:
  - ○ "Reinvest into linked investment" (default if property is linked)
  - ○ "Reinvest into different investment" (shows investment dropdown)
  - ○ "Keep proceeds separate" (removes from calculations)

### Enhanced Results Display

**Property Results Table Modifications:**
- Add "Sale Proceeds" column that shows values only in sale year
- Property value, mortgage balance, and equity columns show "SOLD" text for years after sale
- Sale year row highlighted with subtle background color
- Net proceeds prominently displayed in sale year

**Investment Results Table Enhancements:**
- Add visual indicator (icon or highlight) in sale year showing large contribution from property sale
- Annual contribution column shows enhanced contribution in sale year
- Tooltip on sale year: "Includes $X from property sale proceeds"

**Portfolio Summary Impact:**
- Asset allocation chart shows transition from property to investment
- Timeline clearly marks sale year with vertical line or marker
- Before/after comparison available via toggle

### Visual Chart Integration

**Property Value Chart:**
- Property value line ends at sale year instead of continuing
- Dotted line extension shows "what if held" scenario (optional toggle)
- Sale point marked with distinctive icon/marker
- Net proceeds callout box appears on hover

**Investment Balance Chart:**
- Clear spike in investment balance at sale year
- Separate line colors/styles for pre-sale vs post-sale growth
- Legend explains the contribution sources

**Combined Portfolio Chart:**
- Smooth transition showing asset reallocation
- No visual discontinuity despite internal asset transfer
- Asset composition stacked area chart shows property-to-investment shift

### Scenario Comparison Tools

**Hold vs. Sell Toggle:**
- Prominent toggle switch: "Compare with holding property"
- When enabled, shows both scenarios on same charts with different line styles
- Summary comparison box showing final values and net benefit
- Clear labeling: "Hold scenario" vs "Sell scenario"

**Financial Impact Summary:**
- Dedicated panel showing:
  - Net sale proceeds after all costs
  - Impact on final portfolio value
  - Opportunity cost/benefit analysis
  - Break-even analysis timeframes

## User Workflow Design

### Primary User Journey

1. **Feature Discovery:**
   - User navigates to property settings
   - Sees "Sale Planning" section with clear toggle
   - Descriptive helper text explains feature benefits

2. **Configuration:**
   - User enables sale planning toggle
   - Interface smoothly reveals configuration options
   - Smart defaults minimize required inputs
   - Real-time preview shows impact as user adjusts settings

3. **Results Review:**
   - User navigates to results sections
   - Charts and tables automatically reflect sale scenario
   - Clear visual indicators show when/where sale occurs
   - Financial impact immediately visible

4. **Scenario Analysis:**
   - User can toggle between hold vs sell scenarios
   - Side-by-side or overlay comparison options
   - Key metrics comparison prominently displayed
   - Easy to understand which scenario is better

5. **Refinement:**
   - User can easily return to settings to adjust parameters
   - Changes immediately reflect across all results
   - Undo/reset functionality available

### Secondary Workflows

**Investment Selection for Proceeds:**
- If user chooses different investment, clear dropdown with all available investments
- Option to create new investment if needed
- Visual preview of impact on selected investment

**Sale Price Estimation:**
- When using projected value, show calculation basis
- Helper text explains growth assumptions
- Option to see detailed property value projection

**Cost Estimation Assistance:**
- Selling costs field includes common examples in helper text
- Link to more detailed explanation of typical selling costs
- Regional defaults if location data available

## Error Handling and Validation

### Input Validation Feedback

**Real-time Validation:**
- Sale year must be within projection range
- Custom sale price must be positive and reasonable
- Selling costs percentage within acceptable range (0-20%)
- Immediate visual feedback for invalid inputs

**Warning Messages:**
- Underwater property warning: "Sale proceeds may not cover remaining mortgage"
- High selling costs warning: "Selling costs exceed typical range of 6-8%"
- Early sale warning: "Selling within 3 years may limit appreciation gains"
- Negative cash flow impact: "This sale may create negative investment balance"

**Error Prevention:**
- Disabled states for invalid configurations
- Guided input with suggested ranges
- Smart defaults based on property characteristics

### Edge Case Handling

**Insufficient Sale Proceeds:**
- Clear warning when sale won't cover mortgage
- Show shortfall amount prominently
- Option to adjust sale price or selling costs
- Explanation of implications for linked investment

**Multiple Property Sales:**
- Handle multiple properties selling in same year
- Clear aggregation in investment impact display
- Avoid overwhelming user with too many simultaneous changes

## Accessibility and Usability

### Interface Design Principles

**Progressive Disclosure:**
- Sale configuration hidden until toggle enabled
- Advanced options available but not overwhelming
- Logical grouping of related controls

**Clear Visual Hierarchy:**
- Sale-related information clearly distinguished
- Consistent iconography for sale events
- Color coding that works for colorblind users

**Responsive Design:**
- Sale configuration panel works on mobile devices
- Charts remain readable with sale markers
- Touch-friendly controls for all interactions

### Help and Guidance

**Contextual Help:**
- Tooltip explanations for complex concepts
- Helper text that explains financial implications
- Links to more detailed documentation

**Onboarding:**
- Feature introduction for new users
- Example scenarios demonstrating value
- Best practices guidance

**Progress Indicators:**
- Clear indication of configuration completeness
- Visual feedback during calculation updates
- Loading states for complex recalculations

## Integration with Existing UI Patterns

### Consistency Requirements

**Form Patterns:**
- Use existing input field styling and validation patterns
- Consistent spacing and typography with current property forms
- Same toggle switch design as other boolean options

**Results Display:**
- Follow existing table and chart styling conventions
- Use established color schemes and iconography
- Maintain consistent number formatting and units

**Navigation:**
- Sale feature accessible through existing property navigation
- No additional top-level navigation required
- Breadcrumb trails remain consistent

### State Management Integration

**Unsaved Changes:**
- Sale configuration participates in existing unsaved changes system
- Visual indicators when sale settings modified
- Undo/redo functionality includes sale configuration

**Persistence:**
- Sale settings saved with property data
- Restored correctly on page reload
- Export/import functionality includes sale configuration

## Success Metrics and User Feedback

### Feature Adoption Indicators

**Usage Patterns:**
- Percentage of properties with sale planning enabled
- Most common sale years selected
- Preference for projected vs custom sale prices

**User Engagement:**
- Time spent comparing hold vs sell scenarios
- Frequency of sale parameter adjustments
- Use of different reinvestment options

### User Experience Quality

**Usability Metrics:**
- Time to complete sale configuration
- Error rates in input validation
- User success in understanding financial impact

**Satisfaction Indicators:**
- Feature usefulness ratings
- Requests for additional sale-related features
- User feedback on clarity of results presentation

## Future Enhancement Opportunities

### Advanced Features

**Tax Implications:**
- Capital gains tax calculations
- Depreciation recapture for rental properties
- Tax-advantaged reinvestment options

**Market Timing:**
- Multiple sale scenarios with different timing
- Market condition sensitivity analysis
- Optimal sale timing recommendations

**Partial Sales:**
- Selling portion of property portfolio
- Graduated liquidation strategies
- Rebalancing recommendations

### Integration Enhancements

**External Data:**
- Real estate market data integration
- Automated property value updates
- Local selling cost estimates

**Portfolio Optimization:**
- Automated sale timing optimization
- Multi-asset sale coordination
- Risk-adjusted scenario analysis

This user experience specification provides a comprehensive blueprint for implementing the property sale feature while maintaining consistency with Investisizer's existing design patterns and user workflows.