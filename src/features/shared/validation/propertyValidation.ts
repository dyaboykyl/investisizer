import { type FormValidationConfig } from './types';
import * as rules from './rules';

export function createPropertyValidationConfig(): FormValidationConfig {
  return {
    // Basic property inputs
    name: {
      rules: [rules.required, rules.minLength(1), rules.maxLength(100)],
      required: true
    },
    
    purchasePrice: {
      rules: [
        rules.numeric,
        rules.positive,
        rules.currency,
        rules.maxValue(50000000) // $50M max
      ],
      required: true
    },
    
    currentEstimatedValue: {
      rules: [
        rules.numeric,
        rules.positive,
        rules.currency,
        rules.maxValue(50000000),
        rules.conditionalRequired(
          (context) => context.propertyGrowthModel === 'current_value',
          'Current estimated value must be positive when using current value growth model'
        )
      ]
    },
    
    downPaymentPercentage: {
      rules: [
        rules.numeric,
        rules.range(0, 100),
        rules.highPercentageWarning(50, 'Down payment above 50% is unusually high')
      ],
      required: true
    },
    
    mortgageRate: {
      rules: [
        rules.numeric,
        rules.range(0, 30),
        rules.highPercentageWarning(15, 'Mortgage rate above 15% is very high')
      ],
      required: true
    },
    
    mortgageTermYears: {
      rules: [
        rules.numeric,
        rules.integer,
        rules.range(1, 50)
      ],
      required: true
    },
    
    propertyTaxRate: {
      rules: [
        rules.numeric,
        rules.range(0, 10),
        rules.highPercentageWarning(5, 'Property tax rate above 5% is very high')
      ],
      required: true
    },
    
    propertyGrowthRate: {
      rules: [
        rules.numeric,
        rules.range(-10, 20),
        rules.highPercentageWarning(15, 'Property growth rate above 15% annually is very optimistic'),
        rules.lowValueWarning(0, 'Zero or negative growth rate may not account for inflation')
      ],
      required: true
    },
    
    inflationRate: {
      rules: [
        rules.numeric,
        rules.range(0, 15),
        rules.highPercentageWarning(10, 'Inflation rate above 10% is historically high')
      ],
      required: true
    },
    
    yearsBought: {
      rules: [
        rules.numeric,
        rules.integer,
        rules.custom('yearsBought', (value: string, context) => {
          const years = parseInt(value, 10);
          const projectionYears = parseInt(context.projectionYears, 10);
          if (!isNaN(years) && !isNaN(projectionYears) && years > projectionYears) {
            return 'Years bought cannot exceed projection years';
          }
          return null;
        })
      ]
    },
    
    // Rental property inputs
    monthlyRent: {
      rules: [
        rules.conditionalRequired(
          (context) => context.isRentalProperty,
          'Monthly rent is required for rental properties'
        ),
        rules.numeric,
        rules.positive,
        rules.currency,
        rules.maxValue(50000)
      ]
    },
    
    rentGrowthRate: {
      rules: [
        rules.numeric,
        rules.range(-10, 20),
        rules.highPercentageWarning(10, 'Rent growth rate above 10% annually is very optimistic')
      ]
    },
    
    vacancyRate: {
      rules: [
        rules.numeric,
        rules.range(0, 50),
        rules.highPercentageWarning(20, 'Vacancy rate above 20% is very high')
      ]
    },
    
    maintenanceRate: {
      rules: [
        rules.numeric,
        rules.range(0, 10),
        rules.highPercentageWarning(5, 'Maintenance rate above 5% of property value is high')
      ]
    },
    
    monthlyManagementFeeRate: {
      rules: [
        rules.numeric,
        rules.range(0, 50),
        rules.highPercentageWarning(15, 'Management fee rate above 15% is high')
      ]
    },
    
    listingFeeRate: {
      rules: [
        rules.numeric,
        rules.range(0, 200),
        rules.highPercentageWarning(100, 'Listing fee rate above 100% of monthly rent is high')
      ]
    },
    
    // Sale configuration
    saleYear: {
      rules: [
        rules.numeric,
        rules.integer,
        rules.positive,
        rules.custom('saleYear', (value: string, context) => {
          const year = parseInt(value, 10);
          const projectionYears = parseInt(context.projectionYears, 10);
          if (!isNaN(year) && !isNaN(projectionYears) && year > projectionYears) {
            return 'Sale year must be within projection years';
          }
          return null;
        }),
        rules.custom('saleYear', (value: string) => {
          const year = parseInt(value, 10);
          if (!isNaN(year) && year <= 3) {
            return 'Selling shortly after purchase may incur additional costs and limit appreciation';
          }
          return null;
        }, 'warning')
      ]
    },
    
    saleMonth: {
      rules: [
        rules.numeric,
        rules.integer,
        rules.range(1, 12)
      ]
    },
    
    expectedSalePrice: {
      rules: [
        rules.conditionalRequired(
          (context) => context.saleEnabled && !context.useProjectedValue,
          'Expected sale price is required when using custom pricing'
        ),
        rules.numeric,
        rules.positive,
        rules.currency,
        rules.maxValue(10000000)
      ]
    },
    
    sellingCostsPercentage: {
      rules: [
        rules.numeric,
        rules.range(0, 20),
        rules.highPercentageWarning(8, 'Selling costs exceed typical range of 6-8%')
      ]
    },
    
    targetInvestmentId: {
      rules: [
        rules.conditionalRequired(
          (context) => context.saleEnabled && context.reinvestProceeds,
          'Target investment must be selected when reinvesting proceeds'
        )
      ]
    }
  };
}