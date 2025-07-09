// @ts-ignore - React is required for JSX transform in Jest
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CurrencyDisplay, PositiveCurrencyDisplay, NegativeCurrencyDisplay, ColorCodedCurrencyDisplay, CompactCurrencyDisplay } from './CurrencyDisplay';

describe('CurrencyDisplay', () => {
  it('should render currency amounts with correct formatting', () => {
    render(<CurrencyDisplay amount={1234} />);
    expect(screen.getByText('$1,234')).toBeTruthy();
  });

  it('should render small amounts with decimals', () => {
    render(<CurrencyDisplay amount={123} />);
    expect(screen.getByText('$123.00')).toBeTruthy();
  });

  it('should handle negative amounts', () => {
    render(<CurrencyDisplay amount={-1234} />);
    expect(screen.getByText('-$1,234')).toBeTruthy();
  });

  it('should handle null/undefined amounts', () => {
    render(<CurrencyDisplay amount={null} />);
    expect(screen.getByText('$0.00')).toBeTruthy();
  });

  it('should apply custom className', () => {
    render(<CurrencyDisplay amount={1234} className="custom-class" />);
    const element = screen.getByText('$1,234');
    expect(element.className).toContain('custom-class');
  });

  it('should render as different HTML elements', () => {
    render(<CurrencyDisplay amount={1234} as="h1" />);
    const element = screen.getByRole('heading', { level: 1 });
    expect(element).toBeTruthy();
    expect(element.textContent).toBe('$1,234');
  });

  it('should pass through element props', () => {
    render(<CurrencyDisplay amount={1234} elementProps={{ 'data-testid': 'currency' }} />);
    expect(screen.getByTestId('currency')).toBeTruthy();
  });

  describe('compact formatting', () => {
    it('should use compact formatting when enabled', () => {
      render(<CurrencyDisplay amount={1000000} compact={true} />);
      expect(screen.getByText('$1M')).toBeTruthy();
    });

    it('should use compact formatting for large amounts', () => {
      render(<CurrencyDisplay amount={1500000} compact={true} />);
      expect(screen.getByText('$1.5M')).toBeTruthy();
    });
  });

  describe('color coding', () => {
    it('should apply default color classes when colorCoded is true', () => {
      render(<CurrencyDisplay amount={1234} colorCoded={true} />);
      const element = screen.getByText('$1,234');
      expect(element.className).toContain('text-green-600');
      expect(element.className).toContain('dark:text-green-400');
    });

    it('should apply negative color classes for negative amounts', () => {
      render(<CurrencyDisplay amount={-1234} colorCoded={true} />);
      const element = screen.getByText('-$1,234');
      expect(element.className).toContain('text-red-600');
      expect(element.className).toContain('dark:text-red-400');
    });

    it('should apply zero color classes for zero amounts', () => {
      render(<CurrencyDisplay amount={0} colorCoded={true} />);
      const element = screen.getByText('$0.00');
      expect(element.className).toContain('text-gray-600');
      expect(element.className).toContain('dark:text-gray-400');
    });

    it('should use custom color classes', () => {
      const customColors = {
        positive: 'text-blue-500',
        negative: 'text-yellow-500',
        zero: 'text-purple-500'
      };
      
      render(<CurrencyDisplay amount={1234} colorCoded={true} colorClasses={customColors} />);
      const element = screen.getByText('$1,234');
      expect(element.className).toContain('text-blue-500');
    });
  });

  describe('formatting options', () => {
    it('should show positive sign when requested', () => {
      render(<CurrencyDisplay amount={1234} options={{ showPositiveSign: true }} />);
      expect(screen.getByText('+$1,234')).toBeTruthy();
    });

    it('should use custom currency symbol', () => {
      render(<CurrencyDisplay amount={1234} options={{ symbol: '€' }} />);
      expect(screen.getByText('€1,234')).toBeTruthy();
    });

    it('should hide currency symbol when requested', () => {
      render(<CurrencyDisplay amount={1234} options={{ showSymbol: false }} />);
      expect(screen.getByText('1,234')).toBeTruthy();
    });
  });
});

describe('PositiveCurrencyDisplay', () => {
  it('should render positive amounts with green color', () => {
    render(<PositiveCurrencyDisplay amount={1234} />);
    const element = screen.getByText('$1,234');
    expect(element.className).toContain('text-green-600');
    expect(element.className).toContain('dark:text-green-400');
  });

  it('should not apply color to negative amounts', () => {
    render(<PositiveCurrencyDisplay amount={-1234} />);
    const element = screen.getByText('-$1,234');
    expect(element.className).not.toContain('text-green-600');
    expect(element.className).not.toContain('dark:text-green-400');
  });
});

describe('NegativeCurrencyDisplay', () => {
  it('should render negative amounts with red color', () => {
    render(<NegativeCurrencyDisplay amount={-1234} />);
    const element = screen.getByText('-$1,234');
    expect(element.className).toContain('text-red-600');
    expect(element.className).toContain('dark:text-red-400');
  });

  it('should not apply color to positive amounts', () => {
    render(<NegativeCurrencyDisplay amount={1234} />);
    const element = screen.getByText('$1,234');
    expect(element.className).not.toContain('text-red-600');
    expect(element.className).not.toContain('dark:text-red-400');
  });
});

describe('ColorCodedCurrencyDisplay', () => {
  it('should automatically apply color coding', () => {
    render(<ColorCodedCurrencyDisplay amount={1234} />);
    const element = screen.getByText('$1,234');
    expect(element.className).toContain('text-green-600');
    expect(element.className).toContain('dark:text-green-400');
  });

  it('should apply red color for negative amounts', () => {
    render(<ColorCodedCurrencyDisplay amount={-1234} />);
    const element = screen.getByText('-$1,234');
    expect(element.className).toContain('text-red-600');
    expect(element.className).toContain('dark:text-red-400');
  });

  it('should apply gray color for zero amounts', () => {
    render(<ColorCodedCurrencyDisplay amount={0} />);
    const element = screen.getByText('$0.00');
    expect(element.className).toContain('text-gray-600');
    expect(element.className).toContain('dark:text-gray-400');
  });
});

describe('CompactCurrencyDisplay', () => {
  it('should use compact formatting by default', () => {
    render(<CompactCurrencyDisplay amount={1000000} />);
    expect(screen.getByText('$1M')).toBeTruthy();
  });

  it('should format thousands with K suffix', () => {
    render(<CompactCurrencyDisplay amount={1500} />);
    expect(screen.getByText('$1.5K')).toBeTruthy();
  });

  it('should format small amounts without suffix', () => {
    render(<CompactCurrencyDisplay amount={999} />);
    expect(screen.getByText('$999')).toBeTruthy();
  });
});

describe('integration with formatCurrency rules', () => {
  it('should follow the 4-digit rule for display', () => {
    const { rerender } = render(<CurrencyDisplay amount={999} />);
    expect(screen.getByText('$999.00')).toBeTruthy();

    rerender(<CurrencyDisplay amount={1000} />);
    expect(screen.getByText('$1,000')).toBeTruthy();
  });

  it('should handle boundary cases correctly', () => {
    const { rerender } = render(<CurrencyDisplay amount={999.99} />);
    expect(screen.getByText('$999.99')).toBeTruthy();

    rerender(<CurrencyDisplay amount={1000.00} />);
    expect(screen.getByText('$1,000')).toBeTruthy();
  });
});