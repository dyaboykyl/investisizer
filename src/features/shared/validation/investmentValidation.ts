import { type FormValidationConfig } from './types';
import * as rules from './rules';

export function createInvestmentValidationConfig(): FormValidationConfig {
  return {
    // Basic investment inputs
    name: {
      rules: [rules.required, rules.minLength(1), rules.maxLength(100)],
      required: true
    },
    
    initialAmount: {
      rules: [
        rules.numeric,
        rules.nonNegative,
        rules.currency,
        rules.maxValue(100000000) // $100M max
      ],
      required: true
    },
    
    expectedReturn: {
      rules: [
        rules.numeric,
        rules.range(-50, 50),
        rules.highPercentageWarning(20, 'Expected return above 20% annually is very optimistic'),
        rules.lowValueWarning(0, 'Zero or negative return may not account for inflation')
      ],
      required: true
    },
    
    riskLevel: {
      rules: [
        rules.numeric,
        rules.range(1, 5)
      ],
      required: true
    },
    
    // Contribution settings
    annualContribution: {
      rules: [
        rules.numeric,
        rules.nonNegative,
        rules.currency,
        rules.maxValue(1000000), // $1M max annual contribution
        rules.highPercentageWarning(100000, 'Annual contribution above $100,000 is very high')
      ]
    },
    
    contributionGrowthRate: {
      rules: [
        rules.numeric,
        rules.range(-10, 20),
        rules.highPercentageWarning(15, 'Contribution growth rate above 15% annually is very optimistic')
      ]
    },
    
    // Tax settings
    taxRate: {
      rules: [
        rules.numeric,
        rules.range(0, 60),
        rules.highPercentageWarning(40, 'Tax rate above 40% is very high')
      ]
    },
    
    inflationRate: {
      rules: [
        rules.numeric,
        rules.range(0, 15),
        rules.highPercentageWarning(10, 'Inflation rate above 10% is historically high')
      ],
      required: true
    },
    
    // Withdrawal settings
    withdrawalRate: {
      rules: [
        rules.numeric,
        rules.range(0, 20),
        rules.highPercentageWarning(10, 'Withdrawal rate above 10% may deplete the investment quickly')
      ]
    },
    
    withdrawalStartYear: {
      rules: [
        rules.numeric,
        rules.integer,
        rules.positive,
        rules.custom('withdrawalStartYear', (value: string, context) => {
          const year = parseInt(value, 10);
          const projectionYears = parseInt(context.projectionYears, 10);
          if (!isNaN(year) && !isNaN(projectionYears) && year > projectionYears) {
            return 'Withdrawal start year must be within projection years';
          }
          return null;
        })
      ]
    },
    
    // Rebalancing settings
    rebalanceFrequency: {
      rules: [
        rules.numeric,
        rules.integer,
        rules.range(1, 12)
      ]
    },
    
    rebalanceThreshold: {
      rules: [
        rules.numeric,
        rules.range(1, 50),
        rules.lowValueWarning(5, 'Rebalance threshold below 5% may result in frequent rebalancing')
      ]
    },
    
    // Fee settings
    managementFeeRate: {
      rules: [
        rules.numeric,
        rules.range(0, 10),
        rules.highPercentageWarning(2, 'Management fee rate above 2% annually is high')
      ]
    },
    
    performanceFeeRate: {
      rules: [
        rules.numeric,
        rules.range(0, 30),
        rules.highPercentageWarning(20, 'Performance fee rate above 20% is very high')
      ]
    },
    
    // Risk management
    stopLossThreshold: {
      rules: [
        rules.numeric,
        rules.range(5, 50),
        rules.lowValueWarning(10, 'Stop loss threshold below 10% may result in frequent selling')
      ]
    },
    
    maxDrawdown: {
      rules: [
        rules.numeric,
        rules.range(10, 80),
        rules.highPercentageWarning(50, 'Maximum drawdown above 50% indicates very high risk')
      ]
    },
    
    // Allocation settings
    stockAllocation: {
      rules: [
        rules.numeric,
        rules.range(0, 100)
      ]
    },
    
    bondAllocation: {
      rules: [
        rules.numeric,
        rules.range(0, 100)
      ]
    },
    
    cashAllocation: {
      rules: [
        rules.numeric,
        rules.range(0, 100)
      ]
    },
    
    alternativeAllocation: {
      rules: [
        rules.numeric,
        rules.range(0, 100)
      ]
    },
    
    // Custom validation for total allocation
    totalAllocation: {
      rules: [
        rules.custom('totalAllocation', (_value: string, context) => {
          const stock = parseFloat(context.stockAllocation) || 0;
          const bond = parseFloat(context.bondAllocation) || 0;
          const cash = parseFloat(context.cashAllocation) || 0;
          const alternative = parseFloat(context.alternativeAllocation) || 0;
          
          const total = stock + bond + cash + alternative;
          
          if (Math.abs(total - 100) > 0.01) {
            return 'Total allocation must equal 100%';
          }
          
          return null;
        })
      ]
    }
  };
}