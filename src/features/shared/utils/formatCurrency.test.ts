import { formatCurrency, formatCurrencyCompact, shouldShowDecimals } from './formatCurrency';

describe('formatCurrency', () => {
  describe('basic formatting', () => {
    it('should format amounts with 4+ digits without decimals', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1234)).toBe('$1,234');
      expect(formatCurrency(12345)).toBe('$12,345');
      expect(formatCurrency(123456)).toBe('$123,456');
      expect(formatCurrency(1234567)).toBe('$1,234,567');
    });

    it('should format amounts with less than 4 digits with two decimals', () => {
      expect(formatCurrency(999)).toBe('$999.00');
      expect(formatCurrency(123)).toBe('$123.00');
      expect(formatCurrency(12)).toBe('$12.00');
      expect(formatCurrency(1)).toBe('$1.00');
      expect(formatCurrency(0.5)).toBe('$0.50');
    });

    it('should handle exact boundary cases', () => {
      expect(formatCurrency(999.99)).toBe('$999.99');
      expect(formatCurrency(1000.00)).toBe('$1,000');
      expect(formatCurrency(1000.50)).toBe('$1,001'); // Should round to 1001
    });
  });

  describe('negative numbers', () => {
    it('should format negative amounts with 4+ digits without decimals', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000');
      expect(formatCurrency(-1234)).toBe('-$1,234');
      expect(formatCurrency(-12345)).toBe('-$12,345');
    });

    it('should format negative amounts with less than 4 digits with two decimals', () => {
      expect(formatCurrency(-999)).toBe('-$999.00');
      expect(formatCurrency(-123)).toBe('-$123.00');
      expect(formatCurrency(-12)).toBe('-$12.00');
      expect(formatCurrency(-1)).toBe('-$1.00');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
    });

    it('should handle NaN', () => {
      expect(formatCurrency(NaN)).toBe('$0.00');
    });
  });

  describe('options', () => {
    it('should respect showSymbol option', () => {
      expect(formatCurrency(1234, { showSymbol: false })).toBe('1,234');
      expect(formatCurrency(123, { showSymbol: false })).toBe('123.00');
    });

    it('should respect custom symbol', () => {
      expect(formatCurrency(1234, { symbol: '€' })).toBe('€1,234');
      expect(formatCurrency(123, { symbol: '£' })).toBe('£123.00');
    });

    it('should respect showPositiveSign option', () => {
      expect(formatCurrency(1234, { showPositiveSign: true })).toBe('+$1,234');
      expect(formatCurrency(123, { showPositiveSign: true })).toBe('+$123.00');
      expect(formatCurrency(-1234, { showPositiveSign: true })).toBe('-$1,234');
    });

    it('should combine multiple options', () => {
      expect(formatCurrency(1234, { 
        symbol: '€', 
        showPositiveSign: true, 
        showSymbol: true 
      })).toBe('+€1,234');
      
      expect(formatCurrency(123, { 
        symbol: '£', 
        showPositiveSign: true, 
        showSymbol: false 
      })).toBe('+123.00');
    });
  });

  describe('locale handling', () => {
    it('should use default en-US locale', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235'); // Rounds to 1235
      expect(formatCurrency(123.45)).toBe('$123.45');
    });

    it('should respect custom locale', () => {
      // Note: This test might be environment-dependent
      expect(formatCurrency(1234, { locale: 'en-US' })).toBe('$1,234');
    });
  });
});

describe('formatCurrencyCompact', () => {
  it('should format large amounts with suffixes', () => {
    expect(formatCurrencyCompact(1000000)).toBe('$1M');
    expect(formatCurrencyCompact(1500000)).toBe('$1.5M');
    expect(formatCurrencyCompact(1000)).toBe('$1K');
    expect(formatCurrencyCompact(1500)).toBe('$1.5K');
  });

  it('should format small amounts without suffixes', () => {
    expect(formatCurrencyCompact(999)).toBe('$999');
    expect(formatCurrencyCompact(123)).toBe('$123');
    expect(formatCurrencyCompact(12)).toBe('$12');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrencyCompact(-1000000)).toBe('-$1M');
    expect(formatCurrencyCompact(-1500)).toBe('-$1.5K');
    expect(formatCurrencyCompact(-999)).toBe('-$999');
  });

  it('should handle edge cases', () => {
    expect(formatCurrencyCompact(0)).toBe('$0');
    expect(formatCurrencyCompact(null)).toBe('$0');
    expect(formatCurrencyCompact(undefined)).toBe('$0');
  });

  it('should respect options', () => {
    expect(formatCurrencyCompact(1000000, { showSymbol: false })).toBe('1M');
    expect(formatCurrencyCompact(1500000, { symbol: '€' })).toBe('€1.5M');
  });
});

describe('shouldShowDecimals', () => {
  it('should return true for amounts less than 1000', () => {
    expect(shouldShowDecimals(999)).toBe(true);
    expect(shouldShowDecimals(500)).toBe(true);
    expect(shouldShowDecimals(100)).toBe(true);
    expect(shouldShowDecimals(1)).toBe(true);
    expect(shouldShowDecimals(0.5)).toBe(true);
  });

  it('should return false for amounts 1000 and above', () => {
    expect(shouldShowDecimals(1000)).toBe(false);
    expect(shouldShowDecimals(1001)).toBe(false);
    expect(shouldShowDecimals(10000)).toBe(false);
    expect(shouldShowDecimals(100000)).toBe(false);
  });

  it('should handle negative numbers', () => {
    expect(shouldShowDecimals(-999)).toBe(true);
    expect(shouldShowDecimals(-1000)).toBe(false);
    expect(shouldShowDecimals(-10000)).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(shouldShowDecimals(0)).toBe(true);
    expect(shouldShowDecimals(null)).toBe(true);
    expect(shouldShowDecimals(undefined)).toBe(true);
    expect(shouldShowDecimals(NaN)).toBe(true);
  });
});

describe('currency formatting rules', () => {
  it('should follow the 4-digit rule consistently', () => {
    // Test cases that verify the specific rule mentioned in the requirements
    const testCases = [
      // Less than 4 digits - should have decimals
      { amount: 123, expected: '$123.00' },
      { amount: 999, expected: '$999.00' },
      { amount: 99.99, expected: '$99.99' },
      
      // 4+ digits - should not have decimals
      { amount: 1000, expected: '$1,000' },
      { amount: 1234, expected: '$1,234' },
      { amount: 10000, expected: '$10,000' },
      { amount: 25000, expected: '$25,000' },
    ];

    testCases.forEach(({ amount, expected }) => {
      expect(formatCurrency(amount)).toBe(expected);
    });
  });
});