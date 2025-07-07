/**
 * State Capital Gains Tax Rates and Information
 * 
 * This file contains capital gains tax rates for US states as of 2024.
 * Note: Some states have complex tax structures with multiple brackets,
 * while others have flat rates or no capital gains tax at all.
 */

export interface StateTaxInfo {
  /** State code (e.g., 'CA', 'NY') */
  code: string;
  /** Full state name */
  name: string;
  /** Whether the state has capital gains tax */
  hasCapitalGainsTax: boolean;
  /** Tax rate as decimal (e.g., 0.133 for 13.3%) - may be simplified rate */
  rate: number;
  /** Additional information about the tax structure */
  notes?: string;
  /** Whether this is a simplified rate (actual rate may vary by income) */
  isSimplified?: boolean;
}

/**
 * State tax rates for capital gains (2024)
 * 
 * Sources:
 * - Tax Foundation
 * - State Department of Revenue websites
 * - Kiplinger Tax Map
 * 
 * Note: These are simplified rates. Actual rates may vary based on:
 * - Income level (progressive brackets)
 * - Filing status
 * - Specific deductions and credits
 * - Local taxes
 */
export const STATE_TAX_RATES: Record<string, StateTaxInfo> = {
  // No capital gains tax states
  AK: {
    code: 'AK',
    name: 'Alaska',
    hasCapitalGainsTax: false,
    rate: 0,
    notes: 'No state income tax'
  },
  FL: {
    code: 'FL',
    name: 'Florida',
    hasCapitalGainsTax: false,
    rate: 0,
    notes: 'No state income tax'
  },
  NV: {
    code: 'NV',
    name: 'Nevada',
    hasCapitalGainsTax: false,
    rate: 0,
    notes: 'No state income tax'
  },
  NH: {
    code: 'NH',
    name: 'New Hampshire',
    hasCapitalGainsTax: false,
    rate: 0,
    notes: 'No tax on capital gains (interest and dividends are taxed)'
  },
  SD: {
    code: 'SD',
    name: 'South Dakota',
    hasCapitalGainsTax: false,
    rate: 0,
    notes: 'No state income tax'
  },
  TN: {
    code: 'TN',
    name: 'Tennessee',
    hasCapitalGainsTax: false,
    rate: 0,
    notes: 'No state income tax'
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    hasCapitalGainsTax: false,
    rate: 0,
    notes: 'No state income tax'
  },
  WA: {
    code: 'WA',
    name: 'Washington',
    hasCapitalGainsTax: true,
    rate: 0.07,
    notes: '7% capital gains tax on gains over $250,000 (enacted 2021)'
  },
  WY: {
    code: 'WY',
    name: 'Wyoming',
    hasCapitalGainsTax: false,
    rate: 0,
    notes: 'No state income tax'
  },

  // High tax states
  CA: {
    code: 'CA',
    name: 'California',
    hasCapitalGainsTax: true,
    rate: 0.133,
    notes: 'Highest marginal rate 13.3% (includes 1% Mental Health Tax)',
    isSimplified: true
  },
  NY: {
    code: 'NY',
    name: 'New York',
    hasCapitalGainsTax: true,
    rate: 0.109,
    notes: 'Highest marginal rate 10.9% (plus local taxes)',
    isSimplified: true
  },
  NJ: {
    code: 'NJ',
    name: 'New Jersey',
    hasCapitalGainsTax: true,
    rate: 0.1075,
    notes: 'Highest marginal rate 10.75%',
    isSimplified: true
  },
  HI: {
    code: 'HI',
    name: 'Hawaii',
    hasCapitalGainsTax: true,
    rate: 0.11,
    notes: 'Highest marginal rate 11%',
    isSimplified: true
  },

  // Medium tax states
  CT: {
    code: 'CT',
    name: 'Connecticut',
    hasCapitalGainsTax: true,
    rate: 0.069,
    notes: 'Highest marginal rate 6.9%',
    isSimplified: true
  },
  MA: {
    code: 'MA',
    name: 'Massachusetts',
    hasCapitalGainsTax: true,
    rate: 0.05,
    notes: 'Flat rate 5% (12% for short-term gains)',
    isSimplified: true
  },
  MD: {
    code: 'MD',
    name: 'Maryland',
    hasCapitalGainsTax: true,
    rate: 0.0575,
    notes: 'Highest marginal rate 5.75%',
    isSimplified: true
  },
  OR: {
    code: 'OR',
    name: 'Oregon',
    hasCapitalGainsTax: true,
    rate: 0.099,
    notes: 'Highest marginal rate 9.9%',
    isSimplified: true
  },
  MN: {
    code: 'MN',
    name: 'Minnesota',
    hasCapitalGainsTax: true,
    rate: 0.0985,
    notes: 'Highest marginal rate 9.85%',
    isSimplified: true
  },

  // Lower tax states
  AZ: {
    code: 'AZ',
    name: 'Arizona',
    hasCapitalGainsTax: true,
    rate: 0.045,
    notes: 'Flat rate 4.5%',
    isSimplified: true
  },
  CO: {
    code: 'CO',
    name: 'Colorado',
    hasCapitalGainsTax: true,
    rate: 0.044,
    notes: 'Flat rate 4.4%',
    isSimplified: true
  },
  GA: {
    code: 'GA',
    name: 'Georgia',
    hasCapitalGainsTax: true,
    rate: 0.0575,
    notes: 'Highest marginal rate 5.75%',
    isSimplified: true
  },
  IL: {
    code: 'IL',
    name: 'Illinois',
    hasCapitalGainsTax: true,
    rate: 0.045,
    notes: 'Flat rate 4.5%',
    isSimplified: true
  },
  IN: {
    code: 'IN',
    name: 'Indiana',
    hasCapitalGainsTax: true,
    rate: 0.032,
    notes: 'Flat rate 3.2%',
    isSimplified: true
  },
  KY: {
    code: 'KY',
    name: 'Kentucky',
    hasCapitalGainsTax: true,
    rate: 0.05,
    notes: 'Flat rate 5%',
    isSimplified: true
  },
  MI: {
    code: 'MI',
    name: 'Michigan',
    hasCapitalGainsTax: true,
    rate: 0.0425,
    notes: 'Flat rate 4.25%',
    isSimplified: true
  },
  NC: {
    code: 'NC',
    name: 'North Carolina',
    hasCapitalGainsTax: true,
    rate: 0.0475,
    notes: 'Flat rate 4.75%',
    isSimplified: true
  },
  OH: {
    code: 'OH',
    name: 'Ohio',
    hasCapitalGainsTax: true,
    rate: 0.0399,
    notes: 'Highest marginal rate 3.99%',
    isSimplified: true
  },
  PA: {
    code: 'PA',
    name: 'Pennsylvania',
    hasCapitalGainsTax: true,
    rate: 0.0307,
    notes: 'Flat rate 3.07%',
    isSimplified: true
  },
  SC: {
    code: 'SC',
    name: 'South Carolina',
    hasCapitalGainsTax: true,
    rate: 0.07,
    notes: 'Highest marginal rate 7% (with some exclusions available)',
    isSimplified: true
  },
  UT: {
    code: 'UT',
    name: 'Utah',
    hasCapitalGainsTax: true,
    rate: 0.0485,
    notes: 'Flat rate 4.85%',
    isSimplified: true
  },
  VA: {
    code: 'VA',
    name: 'Virginia',
    hasCapitalGainsTax: true,
    rate: 0.0575,
    notes: 'Highest marginal rate 5.75%',
    isSimplified: true
  },
  WI: {
    code: 'WI',
    name: 'Wisconsin',
    hasCapitalGainsTax: true,
    rate: 0.0765,
    notes: 'Highest marginal rate 7.65%',
    isSimplified: true
  },

  // Additional states can be added here
  AL: {
    code: 'AL',
    name: 'Alabama',
    hasCapitalGainsTax: true,
    rate: 0.05,
    notes: 'Highest marginal rate 5%',
    isSimplified: true
  },
  AR: {
    code: 'AR',
    name: 'Arkansas',
    hasCapitalGainsTax: true,
    rate: 0.055,
    notes: 'Highest marginal rate 5.5%',
    isSimplified: true
  },
  DE: {
    code: 'DE',
    name: 'Delaware',
    hasCapitalGainsTax: true,
    rate: 0.066,
    notes: 'Highest marginal rate 6.6%',
    isSimplified: true
  },
  ID: {
    code: 'ID',
    name: 'Idaho',
    hasCapitalGainsTax: true,
    rate: 0.06,
    notes: 'Highest marginal rate 6%',
    isSimplified: true
  },
  IA: {
    code: 'IA',
    name: 'Iowa',
    hasCapitalGainsTax: true,
    rate: 0.054,
    notes: 'Highest marginal rate 5.4%',
    isSimplified: true
  },
  KS: {
    code: 'KS',
    name: 'Kansas',
    hasCapitalGainsTax: true,
    rate: 0.057,
    notes: 'Highest marginal rate 5.7%',
    isSimplified: true
  },
  LA: {
    code: 'LA',
    name: 'Louisiana',
    hasCapitalGainsTax: true,
    rate: 0.06,
    notes: 'Highest marginal rate 6%',
    isSimplified: true
  },
  ME: {
    code: 'ME',
    name: 'Maine',
    hasCapitalGainsTax: true,
    rate: 0.0715,
    notes: 'Highest marginal rate 7.15%',
    isSimplified: true
  },
  MS: {
    code: 'MS',
    name: 'Mississippi',
    hasCapitalGainsTax: true,
    rate: 0.05,
    notes: 'Highest marginal rate 5%',
    isSimplified: true
  },
  MO: {
    code: 'MO',
    name: 'Missouri',
    hasCapitalGainsTax: true,
    rate: 0.054,
    notes: 'Highest marginal rate 5.4%',
    isSimplified: true
  },
  MT: {
    code: 'MT',
    name: 'Montana',
    hasCapitalGainsTax: true,
    rate: 0.0675,
    notes: 'Highest marginal rate 6.75%',
    isSimplified: true
  },
  NE: {
    code: 'NE',
    name: 'Nebraska',
    hasCapitalGainsTax: true,
    rate: 0.0684,
    notes: 'Highest marginal rate 6.84%',
    isSimplified: true
  },
  NM: {
    code: 'NM',
    name: 'New Mexico',
    hasCapitalGainsTax: true,
    rate: 0.059,
    notes: 'Highest marginal rate 5.9%',
    isSimplified: true
  },
  ND: {
    code: 'ND',
    name: 'North Dakota',
    hasCapitalGainsTax: true,
    rate: 0.0295,
    notes: 'Highest marginal rate 2.95%',
    isSimplified: true
  },
  OK: {
    code: 'OK',
    name: 'Oklahoma',
    hasCapitalGainsTax: true,
    rate: 0.05,
    notes: 'Highest marginal rate 5%',
    isSimplified: true
  },
  RI: {
    code: 'RI',
    name: 'Rhode Island',
    hasCapitalGainsTax: true,
    rate: 0.0599,
    notes: 'Highest marginal rate 5.99%',
    isSimplified: true
  },
  VT: {
    code: 'VT',
    name: 'Vermont',
    hasCapitalGainsTax: true,
    rate: 0.0875,
    notes: 'Highest marginal rate 8.75%',
    isSimplified: true
  },
  WV: {
    code: 'WV',
    name: 'West Virginia',
    hasCapitalGainsTax: true,
    rate: 0.065,
    notes: 'Highest marginal rate 6.5%',
    isSimplified: true
  },
  DC: {
    code: 'DC',
    name: 'District of Columbia',
    hasCapitalGainsTax: true,
    rate: 0.0975,
    notes: 'Highest marginal rate 9.75%',
    isSimplified: true
  }
};

/**
 * Get state tax information by state code
 */
export function getStateTaxInfo(stateCode: string): StateTaxInfo | null {
  const upperCode = stateCode.toUpperCase();
  return STATE_TAX_RATES[upperCode] || null;
}

/**
 * Get all states with no capital gains tax
 */
export function getNoTaxStates(): StateTaxInfo[] {
  return Object.values(STATE_TAX_RATES).filter(state => !state.hasCapitalGainsTax);
}

/**
 * Get all states sorted by tax rate (ascending)
 */
export function getStatesByTaxRate(): StateTaxInfo[] {
  return Object.values(STATE_TAX_RATES).sort((a, b) => a.rate - b.rate);
}

/**
 * Get state choices for UI dropdowns
 */
export function getStateChoices(): Array<{ value: string; label: string; rate: number }> {
  return Object.values(STATE_TAX_RATES)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(state => ({
      value: state.code,
      label: `${state.name} (${state.hasCapitalGainsTax ? (state.rate * 100).toFixed(1) + '%' : 'No Tax'})`,
      rate: state.rate
    }));
}

/**
 * Check if a state has capital gains tax
 */
export function hasCapitalGainsTax(stateCode: string): boolean {
  const info = getStateTaxInfo(stateCode);
  return info?.hasCapitalGainsTax ?? false;
}

/**
 * Get the capital gains tax rate for a state
 */
export function getStateTaxRate(stateCode: string): number {
  const info = getStateTaxInfo(stateCode);
  return info?.rate ?? 0;
}