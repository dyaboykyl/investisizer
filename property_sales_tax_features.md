# Property Sales Tax Support - Core Features Implementation

## Overview
Implement comprehensive capital gains tax calculations for property sales to provide users with realistic after-tax proceeds analysis. This document covers the first three core features that form the foundation of tax-aware property sale planning.

## Feature 1: Tax Configuration Panel

### User Interface Components

#### Global Tax Profile Settings
Create a new tax configuration section accessible from portfolio settings with these data elements:

**Tax Profile Configuration:**
- Filing Status: single, married filing jointly, married filing separately, head of household
- Annual Income: used to determine tax brackets and rates
- State: state code for state-specific tax calculations
- Enable State Tax: toggle for including state capital gains taxes
- Other Capital Gains: other gains/losses for the year (affects overall tax calculation)
- Carryover Losses: capital loss carryovers from previous years

#### Property-Specific Tax Settings
Add to existing property sale configuration:

**Property Tax Settings:**
- Primary Residence Status: enables Section 121 exclusion eligibility
- Time in Residence: years used as primary residence (Section 121 requirement)
- Capital Improvements: cost of improvements to increase cost basis
- Original Buying Costs: transaction costs from original purchase
- Total Depreciation Taken: for rental properties (affects depreciation recapture)
- Business Use Percentage: for mixed-use properties

### User Experience Flow

1. **Initial Setup**: First-time users guided through tax profile creation
2. **Property Configuration**: Tax settings integrated into property sale setup
3. **Smart Defaults**: Reasonable assumptions with clear override options
4. **Validation**: Input validation with helpful error messages and warnings

### Interface Mockup Structure

```
Tax Configuration Panel:
┌─────────────────────────────────────┐
│ Tax Profile Settings                │
├─────────────────────────────────────┤
│ Filing Status: [Married Filing Joint]│
│ Annual Income: [$125,000          ] │
│ State: [California ▼              ] │
│ ☑ Include state tax calculations   │
├─────────────────────────────────────┤
│ Property Tax Settings               │
├─────────────────────────────────────┤
│ ☑ Primary Residence (Section 121)  │
│ Years as Primary: [3.5 years     ] │
│ Capital Improvements: [$25,000   ] │
│ Original Buying Costs: [$15,000  ] │
└─────────────────────────────────────┘
```

## Feature 2: Automated Tax Calculations

### Core Tax Calculation Engine

#### Capital Gains Computation Flow
The system needs to calculate and track these key values:

**Cost Basis Components:**
- Original Purchase Price: base property purchase price
- Capital Improvements: costs that increase property basis
- Buying Costs: original transaction costs (legal, inspection, etc.)
- Adjusted Cost Basis: sum of all basis components

**Sale Components:**
- Gross Sale Price: total sale amount
- Selling Costs: realtor fees, closing costs, etc.
- Net Sale Proceeds: gross price minus selling costs and mortgage payoff

**Gain Calculations:**
- Gross Capital Gain: net proceeds minus adjusted cost basis
- Depreciation Recapture Amount: for rental properties only
- Section 121 Exclusion: primary residence exclusion if applicable
- Taxable Gain: gross gain minus exclusions

**Tax Liability:**
- Federal Tax Rate: based on income and filing status
- State Tax Rate: varies by state (some have none)
- Federal Tax Amount: rate applied to taxable gain
- State Tax Amount: state rate applied to taxable gain
- Total Tax Liability: sum of federal and state taxes

**Final Result:**
- Net After-Tax Proceeds: sale proceeds minus all taxes

#### Tax Rate Determination Logic

**Federal Capital Gains Tax Brackets (2024):**
For Single Filers:
- 0% rate: income up to $47,025
- 15% rate: income $47,025 to $518,900
- 20% rate: income above $518,900

For Married Filing Jointly:
- 0% rate: income up to $94,050
- 15% rate: income $94,050 to $583,750
- 20% rate: income above $583,750

**Tax Rate Calculation Pseudo-code:**
```
function calculateFederalRate(annualIncome, filingStatus):
    brackets = getBracketsForFilingStatus(filingStatus)
    for bracket in brackets:
        if annualIncome >= bracket.min and annualIncome < bracket.max:
            return bracket.rate
    return highestBracketRate
```

**State Tax Considerations:**
- Some states have no capital gains tax (e.g., Texas, Florida, Nevada)
- Others tax capital gains as ordinary income (e.g., California, New York)
- Need lookup table mapping state codes to tax treatment

#### Section 121 Primary Residence Exclusion

**Eligibility Requirements:**
- Property must be primary residence
- Must have lived in property 2+ years of last 5 years
- Exclusion amounts: $250k (single), $500k (married filing jointly)

**Calculation Logic:**
```
function calculateSection121Exclusion(isPrimary, timeInResidence, filingStatus):
    if not isPrimary or timeInResidence < 2:
        return 0
    
    maxExclusion = filingStatus == "married_joint" ? 500000 : 250000
    return min(capitalGain, maxExclusion)
```

#### Depreciation Recapture for Rental Properties

**Recapture Rules:**
- Depreciation taken on rental properties must be "recaptured"
- Recapture rate: 25% federal (higher than capital gains rates)
- Amount: lesser of total depreciation taken or total gain
- Remaining gain after recapture taxed at normal capital gains rates

**Calculation Flow:**
```
function calculateDepreciationRecapture(totalGain, depreciationTaken):
    recaptureAmount = min(totalGain, depreciationTaken)
    recaptureTax = recaptureAmount * 0.25
    remainingGain = totalGain - recaptureAmount
    
    return {
        recaptureAmount: recaptureAmount,
        recaptureTax: recaptureTax,
        remainingGainForCapitalGains: remainingGain
    }
```

### Integration with Existing Property Sale Calculations

**Enhanced Sale Calculation Flow:**
1. Start with existing gross sale proceeds calculation
2. Calculate adjusted cost basis using property purchase data + improvements
3. Determine gross capital gain
4. Apply Section 121 exclusion if property qualifies
5. Calculate depreciation recapture for rental properties
6. Apply appropriate federal and state tax rates
7. Subtract total tax liability from gross proceeds
8. Return net after-tax proceeds for reinvestment flow

## Feature 3: Enhanced Sale Results Display

### Comprehensive Results Interface

#### Tax-Aware Sale Summary Structure
The enhanced sale results should display a complete breakdown from gross sale price to net after-tax proceeds:

**Data Elements to Display:**
- Gross Sale Price: user input or projected market value
- Selling Costs: percentage-based calculation 
- Remaining Mortgage: from existing amortization calculations
- Gross Proceeds: sale price minus costs and mortgage
- Tax Calculation Breakdown: comprehensive tax analysis
- Net After-Tax Proceeds: final amount available for reinvestment
- Effective Tax Rate: total taxes as percentage of gain
- Tax Savings: amount saved from exclusions or strategies

#### Visual Results Layout Structure
```
Sale Summary Section:
- Gross Sale Price
- Selling Costs (with percentage)
- Remaining Mortgage Balance
- Separator line
- Gross Proceeds

Tax Calculations Section:
- Cost Basis Breakdown (expandable)
  - Original Purchase Price
  - Capital Improvements
  - Buying Costs
  - Adjusted Cost Basis
- Capital Gains Analysis
  - Gross Capital Gain
  - Primary Residence Exclusion (if applicable)
  - Depreciation Recapture (if rental property)
  - Taxable Gain
- Tax Liability
  - Federal Tax (with rate)
  - State Tax (with rate)
  - Total Tax Liability

Final Results Section:
- Net After-Tax Proceeds (prominent display)
- Effective Tax Rate
- Tax Savings Amount (if exclusions applied)
```

#### Interactive Tax Breakdown Details
Provide expandable sections for educational purposes:

**Federal Tax Calculation Detail:**
- User's income level and corresponding bracket
- Applicable capital gains tax rate
- Calculation: taxable gain × rate = tax amount

**State Tax Calculation Detail:**
- State-specific treatment of capital gains
- Applicable rate (varies by state)
- Some states have no capital gains tax (highlight this benefit)

**Section 121 Exclusion Detail:**
- Qualification status and requirements
- Time in residence verification
- Filing status and exclusion limit
- Amount of exclusion applied
- Estimated tax savings from exclusion

### Integration with Investment Cash Flow

#### Modified Reinvestment Flow
When property sale proceeds are reinvested into linked investments:

**Current Flow:** Gross sale proceeds → Investment account
**Enhanced Flow:** Net after-tax proceeds → Investment account

This ensures investment projections reflect realistic cash flows rather than inflated gross proceeds.

#### Warning System for Tax Considerations

**High Tax Liability Warnings:**
- Alert when tax liability exceeds 25% of sale proceeds
- Suggest timing considerations for tax optimization

**Qualification Warnings:**
- Alert if property doesn't qualify for Section 121 exclusion
- Explain requirements and potential strategies

**Alternative Timing Benefits:**
- Identify situations where waiting could reduce tax burden
- Show potential tax savings from different sale timing

### User Experience Design Principles

#### Progressive Information Disclosure
**Level 1 - Simple View:**
- Prominently display net after-tax proceeds
- Show total tax liability as single number
- Basic comparison: gross proceeds vs. net proceeds

**Level 2 - Detailed View:**
- Expandable breakdown of all tax calculations
- Educational explanations of tax concepts
- Step-by-step calculation transparency

**Level 3 - Advanced Analysis:**
- Scenario comparison capabilities
- Tax optimization suggestions
- Alternative strategy recommendations

#### Real-Time Calculation Updates
- Tax calculations update instantly when user modifies sale parameters
- Visual indicators show impact of different sale prices or timing
- Dynamic tax rate displays based on current settings

#### Clear Value Communication
**Highlight Key Benefits:**
- Emphasize tax savings from primary residence exclusion
- Show effective tax rate vs. nominal tax rates
- Clear delta between gross and net proceeds with explanatory context

**Educational Elements:**
- Tooltips explaining tax concepts (Section 121, depreciation recapture, etc.)
- Links to tax strategy resources
- Guidance on timing optimization

### Data Flow Integration

#### Connection to Existing Property Results
Enhance existing property sale calculations to include:
- After-tax proceeds calculation
- Tax liability breakdown
- Effective tax rate metrics

#### Investment Account Integration
Modify investment cash flow calculations to use:
- Net after-tax proceeds instead of gross proceeds
- Realistic reinvestment amounts
- Tax-adjusted opportunity cost analysis

#### Portfolio-Level Impact
Update portfolio summary calculations to reflect:
- Tax-adjusted total returns
- Net proceeds available for reallocation
- Realistic portfolio rebalancing scenarios

## Implementation Approach

**Phase 1: Core Tax Engine**
- Basic federal capital gains tax calculations
- Simple cost basis determination
- Primary residence exclusion logic

**Phase 2: Enhanced Tax Features**
- State tax integration
- Depreciation recapture for rental properties
- Advanced warning and validation systems

**Phase 3: User Experience Polish**
- Interactive educational elements
- Scenario comparison tools
- Tax optimization recommendations

This comprehensive tax integration transforms property sale analysis from basic gross proceeds calculation into sophisticated after-tax financial planning, providing users with the realistic information needed for optimal investment decisions.