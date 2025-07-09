import React from 'react';
import { formatCurrency, formatCurrencyCompact, type FormatCurrencyOptions } from '@/features/shared/utils/formatCurrency';

export interface CurrencyDisplayProps {
  /**
   * The amount to display
   */
  amount: number | null | undefined;
  /**
   * Formatting options
   */
  options?: FormatCurrencyOptions;
  /**
   * Whether to use compact formatting for large numbers
   */
  compact?: boolean;
  /**
   * CSS class name to apply
   */
  className?: string;
  /**
   * Whether to apply color coding based on positive/negative values
   */
  colorCoded?: boolean;
  /**
   * Custom color classes for positive/negative values
   */
  colorClasses?: {
    positive?: string;
    negative?: string;
    zero?: string;
  };
  /**
   * HTML element to render as (default: 'span')
   */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /**
   * Additional props to pass to the HTML element
   */
  elementProps?: React.HTMLAttributes<HTMLElement> & { 'data-testid'?: string };
}

/**
 * A React component for consistently displaying currency amounts
 * with automatic formatting based on the 4-digit rule
 */
export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  options = {},
  compact = false,
  className = '',
  colorCoded = false,
  colorClasses = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    zero: 'text-gray-600 dark:text-gray-400'
  },
  as = 'span',
  elementProps = {}
}) => {
  // Format the currency
  const formattedAmount = compact 
    ? formatCurrencyCompact(amount, options)
    : formatCurrency(amount, options);

  // Determine color class if color coding is enabled
  let colorClass = '';
  if (colorCoded) {
    const numericAmount = amount || 0;
    if (numericAmount > 0) {
      colorClass = colorClasses.positive || '';
    } else if (numericAmount < 0) {
      colorClass = colorClasses.negative || '';
    } else {
      colorClass = colorClasses.zero || '';
    }
  }

  // Combine classes
  const finalClassName = [className, colorClass].filter(Boolean).join(' ');

  // Create the props for the element
  const finalProps = {
    ...elementProps,
    className: finalClassName || undefined,
    children: formattedAmount
  };

  // Render the appropriate element
  return React.createElement(as, finalProps);
};

/**
 * Convenience component for displaying positive currency amounts with green color
 */
export const PositiveCurrencyDisplay: React.FC<Omit<CurrencyDisplayProps, 'colorCoded' | 'colorClasses'>> = (props) => (
  <CurrencyDisplay
    {...props}
    colorCoded={true}
    colorClasses={{ positive: 'text-green-600 dark:text-green-400' }}
  />
);

/**
 * Convenience component for displaying negative currency amounts with red color
 */
export const NegativeCurrencyDisplay: React.FC<Omit<CurrencyDisplayProps, 'colorCoded' | 'colorClasses'>> = (props) => (
  <CurrencyDisplay
    {...props}
    colorCoded={true}
    colorClasses={{ negative: 'text-red-600 dark:text-red-400' }}
  />
);

/**
 * Convenience component for displaying currency amounts with automatic color coding
 */
export const ColorCodedCurrencyDisplay: React.FC<Omit<CurrencyDisplayProps, 'colorCoded'>> = (props) => (
  <CurrencyDisplay
    {...props}
    colorCoded={true}
  />
);

/**
 * Convenience component for displaying compact currency amounts
 */
export const CompactCurrencyDisplay: React.FC<Omit<CurrencyDisplayProps, 'compact'>> = (props) => (
  <CurrencyDisplay
    {...props}
    compact={true}
  />
);