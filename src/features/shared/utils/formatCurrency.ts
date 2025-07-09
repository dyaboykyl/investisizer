export interface FormatCurrencyOptions {
  /**
   * Currency symbol to display (default: '$')
   */
  symbol?: string;
  /**
   * Whether to include the currency symbol (default: true)
   */
  showSymbol?: boolean;
  /**
   * Whether to show '+' for positive numbers (default: false)
   */
  showPositiveSign?: boolean;
  /**
   * Locale for number formatting (default: 'en-US')
   */
  locale?: string;
}

/**
 * Formats a currency amount with consistent rules:
 * - 4+ digits: No decimal places (e.g., $1,234, $10,000)
 * - < 4 digits: Two decimal places (e.g., $123.45, $99.99)
 * 
 * @param amount - The numeric amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  const {
    symbol = '$',
    showSymbol = true,
    showPositiveSign = false,
    locale = 'en-US'
  } = options;

  // Handle null/undefined values
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `${symbol}0.00` : '0.00';
  }

  // Handle zero
  if (amount === 0) {
    return showSymbol ? `${symbol}0.00` : '0.00';
  }

  // Determine if we need decimal places based on absolute value
  const absAmount = Math.abs(amount);
  const hasDecimals = absAmount < 1000; // Less than 4 digits (1000 = 4 digits)

  // Format the number
  const formattedNumber = absAmount.toLocaleString(locale, {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0
  });

  // Build the final string
  let result = '';
  
  // Add positive sign if requested and amount is positive
  if (showPositiveSign && amount > 0) {
    result += '+';
  }
  
  // Add currency symbol
  if (showSymbol) {
    result += symbol;
  }
  
  // Add the formatted number (negative sign is already included by toLocaleString)
  if (amount < 0) {
    // For negative numbers, we need to handle the sign placement
    result = (showSymbol ? `-${symbol}` : '-') + formattedNumber;
  } else {
    result += formattedNumber;
  }

  return result;
}

/**
 * Formats a currency amount as a compact string (always without decimals)
 * Useful for very large numbers or when space is limited
 */
export function formatCurrencyCompact(
  amount: number | null | undefined,
  options: Omit<FormatCurrencyOptions, 'showPositiveSign'> = {}
): string {
  const {
    symbol = '$',
    showSymbol = true,
    locale = 'en-US'
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? `${symbol}0` : '0';
  }

  const absAmount = Math.abs(amount);
  let formattedNumber: string;
  let suffix = '';

  // Format large numbers with suffixes
  if (absAmount >= 1000000) {
    formattedNumber = (absAmount / 1000000).toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    });
    suffix = 'M';
  } else if (absAmount >= 1000) {
    formattedNumber = (absAmount / 1000).toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    });
    suffix = 'K';
  } else {
    formattedNumber = absAmount.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  // Build the final string
  let result = '';
  
  if (showSymbol) {
    result += symbol;
  }
  
  if (amount < 0) {
    result = (showSymbol ? `-${symbol}` : '-') + formattedNumber + suffix;
  } else {
    result += formattedNumber + suffix;
  }

  return result;
}

/**
 * Utility function to determine if a number should be formatted with decimals
 * Based on the 4-digit rule
 */
export function shouldShowDecimals(amount: number | null | undefined): boolean {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return true; // Default to showing decimals for edge cases
  }
  
  return Math.abs(amount) < 1000;
}