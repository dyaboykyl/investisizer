# Default Portfolio Implementation for Investisizer

## Overview
Implement a compelling default portfolio setup that showcases all major features of the Investisizer app. This default scenario demonstrates investment growth, property appreciation, rental income, property-investment linking, and strategic property sales.

## Default Portfolio: "The Strategic Investor"

### Implementation Location
A new file will be created to house this default data:
```
src/features/portfolio/stores/defaultPortfolioData.ts
```
This data will be imported and used by `PortfolioStore.ts`.

### Default Portfolio Configuration

#### Investment 1: Growth Portfolio (S&P 500)
```typescript
{
  type: 'investment',
  name: "Growth Portfolio (S&P 500)",
  inputs: {
    initialAmount: "50000",
    rateOfReturn: "8.5",
    annualContribution: "12000" // $1,000/month
  },
  inflationAdjustedContributions: true,
}
```

#### Investment 2: Emergency Fund (High-Yield Savings)
```typescript
{
  type: 'investment',
  name: "Emergency Fund (High-Yield Savings)",
  inputs: {
    initialAmount: "25000",
    rateOfReturn: "4.2",
    annualContribution: "3000" // $250/month
  },
  inflationAdjustedContributions: true,
}
```

#### Property 1: Primary Residence
```typescript
{
  type: 'property',
  name: "Primary Residence",
  inputs: {
    purchasePrice: "650000",
    downPaymentPercentage: "20", // $130k down payment
    interestRate: "6.8",
    loanTerm: "30",
    yearsBought: "2", // Purchased 2 years ago
    propertyGrowthRate: "4", // Slightly above inflation
    linkedInvestmentId: "[GROWTH_INVESTMENT_ID]", // Link to growth portfolio
    
    // Non-rental property
    isRentalProperty: false,
  },
}
```

#### Property 2: Rental Property - Duplex (Strategic Sale in Year 8)
```typescript
{
  type: 'property',
  name: "Rental Property - Duplex",
  inputs: {
    purchasePrice: "420000",
    downPaymentPercentage: "25", // $105k down (higher for investment property)
    interestRate: "7.2", // Slightly higher rate for investment property
    loanTerm: "30",
    yearsBought: "1", // Purchased 1 year ago
    propertyGrowthRate: "3.5",
    linkedInvestmentId: "[EMERGENCY_FUND_ID]", // Link to emergency fund
    
    // Rental property configuration
    isRentalProperty: true,
    monthlyRent: "3200", // $1600 per unit (duplex)
    rentGrowthRate: "4", // Above general inflation
    vacancyRate: "8", // Realistic for duplex management
    maintenanceRate: "1.5", // 1.5% of property value for maintenance
    propertyManagementEnabled: true,
    monthlyManagementFeeRate: "8",
    listingFeeRate: "75",

    // Strategic sale configuration
    saleConfig: {
      isPlannedForSale: true,
      saleYear: 8, // Strategic exit timing
      sellingCostsPercentage: 7, // 7% selling costs (realtor, closing, etc.)
      reinvestProceeds: true,
      targetInvestmentId: "[GROWTH_INVESTMENT_ID]", // Reinvest into growth portfolio
    }
  },
}
```

#### Global Portfolio Settings
```typescript
{
  years: "15", // Long enough to see compound growth and property sale impact
  inflationRate: "2.5",
  startingYear: "2024", // Current year
  activeTabId: "combined" // Start on combined view to show full portfolio
}
```

## Implementation Requirements

### 1. Create `defaultPortfolioData.ts`
Create a new file `src/features/portfolio/stores/defaultPortfolioData.ts` to export the default portfolio structure. This keeps the data separate from the store logic.

### 2. Modify `PortfolioStore.ts`
Update the `PortfolioStore` to use this new data.

#### a. Import the default data
```typescript
import { defaultPortfolioData } from './defaultPortfolioData';
```

#### b. Add a method to create the default portfolio
```typescript
private createDefaultPortfolio() {
  this.assets.clear();

  const investmentAssets = defaultPortfolioData.assets.filter(a => a.type === 'investment');
  const propertyAssets = defaultPortfolioData.assets.filter(a => a.type === 'property');

  const investmentIds: { [key: string]: string } = {};

  // Create investments first to get their IDs
  investmentAssets.forEach(assetData => {
    const id = this.addInvestment(assetData.name, assetData.inputs);
    const investment = this.assets.get(id) as Investment;
    if (investment && assetData.inflationAdjustedContributions) {
      investment.setInflationAdjustedContributions(true);
    }
    // Store ID for linking properties
    if (assetData.name.includes("Growth")) {
      investmentIds.GROWTH_INVESTMENT_ID = id;
    } else if (assetData.name.includes("Emergency")) {
      investmentIds.EMERGENCY_FUND_ID = id;
    }
  });

  // Create properties and link them to investments
  propertyAssets.forEach(assetData => {
    const inputs = { ...assetData.inputs };
    if (inputs.linkedInvestmentId === '[GROWTH_INVESTMENT_ID]') {
      inputs.linkedInvestmentId = investmentIds.GROWTH_INVESTMENT_ID;
    } else if (inputs.linkedInvestmentId === '[EMERGENCY_FUND_ID]') {
      inputs.linkedInvestmentId = investmentIds.EMERGENCY_FUND_ID;
    }
    
    if (inputs.saleConfig?.targetInvestmentId === '[GROWTH_INVESTMENT_ID]') {
      inputs.saleConfig.targetInvestmentId = investmentIds.GROWTH_INVESTMENT_ID;
    }

    this.addProperty(assetData.name, inputs);
  });

  // Set global settings
  this.setYears(defaultPortfolioData.settings.years);
  this.setInflationRate(defaultPortfolioData.settings.inflationRate);
  this.setStartingYear(defaultPortfolioData.settings.startingYear);
  this.setActiveTab(defaultPortfolioData.settings.activeTabId);
}
```

#### c. Update `PortfolioStore` Constructor and `clearAll`
Modify the constructor and `clearAll` method to call `createDefaultPortfolio`.

```typescript
// In constructor:
if (this.assets.size === 0) {
  this.createDefaultPortfolio();
  this.savedPortfolioData = this.currentPortfolioData;
}

// In clearAll method:
clearAll = () => {
  localStorage.removeItem('portfolioData');
  this.createDefaultPortfolio();
  this.savedPortfolioData = this.currentPortfolioData;
}
```

## Summary of Changes from Analysis

- **Decoupled Default Data**: Created a dedicated `defaultPortfolioData.ts` to separate data from the `PortfolioStore` logic, improving maintainability.
- **Updated Property Inputs**:
    - Removed `monthlyPayment`, `propertyGrowthModel`, and `currentEstimatedValue` from the default property data, as these are now calculated or have sensible defaults within the `Property` store.
    - Replaced the outdated `annualExpenses` with the new enhanced expense model fields: `maintenanceRate`, `propertyManagementEnabled`, `monthlyManagementFeeRate`, and `listingFeeRate`.
- **Simplified `createDefaultPortfolio` Logic**: The creation method now dynamically links assets by looking up the generated IDs of the investment assets, making the setup more robust.
- **Corrected Method Calls**: The implementation now uses the correct method `setInflationAdjustedContributions` on the `Investment` instance.
- **Streamlined `clearAll`**: The `clearAll` method is updated to simply call the new default portfolio creation method, ensuring consistency.
- **Removed Redundant Fields**: Removed fields from the default data that are now handled automatically by the stores, such as `inflationRate` on individual assets (inherited from the portfolio) and `useProjectedValue` on sale config (defaults to true).
