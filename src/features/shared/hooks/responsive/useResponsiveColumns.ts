import { useMemo } from 'react';
import { useViewportWidth } from './useViewportSize';
import { getBreakpointValue } from '../../utils/responsive/breakpoints';

interface ColumnConfig {
  key: string;
  header: string;
  priority: 'high' | 'medium' | 'low';
  minWidth?: number;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveColumnsOptions {
  columns: ColumnConfig[];
  minColumnWidth?: number;
  maxColumns?: number;
}

/**
 * Hook for managing responsive table columns
 */
export const useResponsiveColumns = (options: ResponsiveColumnsOptions) => {
  const { columns, minColumnWidth = 120, maxColumns } = options;
  const viewportWidth = useViewportWidth();

  const visibleColumns = useMemo(() => {
    // Calculate how many columns can fit
    const availableWidth = viewportWidth - 32; // Account for padding
    const maxPossibleColumns = Math.floor(availableWidth / minColumnWidth);
    
    // Apply max columns limit if specified
    const targetColumns = maxColumns 
      ? Math.min(maxPossibleColumns, maxColumns)
      : maxPossibleColumns;

    // Sort columns by priority (high -> medium -> low)
    const sortedColumns = [...columns].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Return the top priority columns that fit
    return sortedColumns.slice(0, targetColumns);
  }, [columns, viewportWidth, minColumnWidth, maxColumns]);

  const hiddenColumns = useMemo(() => {
    return columns.filter(col => !visibleColumns.includes(col));
  }, [columns, visibleColumns]);

  const getColumnVisibility = (columnKey: string) => {
    return visibleColumns.some(col => col.key === columnKey);
  };

  const getResponsiveColumnWidth = (totalColumns: number = visibleColumns.length) => {
    if (viewportWidth < getBreakpointValue('md')) {
      // Mobile: stack columns or use minimal width
      return '100%';
    }
    
    // Desktop: distribute width evenly
    return `${100 / totalColumns}%`;
  };

  return {
    visibleColumns,
    hiddenColumns,
    getColumnVisibility,
    getResponsiveColumnWidth,
    totalVisibleColumns: visibleColumns.length,
    shouldStackColumns: viewportWidth < getBreakpointValue('md'),
  };
};

/**
 * Hook for financial table columns (specific to investment/property data)
 */
export const useFinancialTableColumns = () => {
  const baseColumns: ColumnConfig[] = [
    { key: 'year', header: 'Year', priority: 'high', minWidth: 80 },
    { key: 'balance', header: 'Balance', priority: 'high', minWidth: 120 },
    { key: 'earnings', header: 'Earnings', priority: 'medium', minWidth: 120 },
    { key: 'contributions', header: 'Contributions', priority: 'medium', minWidth: 140 },
    { key: 'real_balance', header: 'Real Balance', priority: 'low', minWidth: 120 },
    { key: 'real_earnings', header: 'Real Earnings', priority: 'low', minWidth: 120 },
  ];

  return useResponsiveColumns({
    columns: baseColumns,
    minColumnWidth: 100,
    maxColumns: 6,
  });
};

/**
 * Hook for property table columns
 */
export const usePropertyTableColumns = () => {
  const baseColumns: ColumnConfig[] = [
    { key: 'year', header: 'Year', priority: 'high', minWidth: 80 },
    { key: 'value', header: 'Value', priority: 'high', minWidth: 120 },
    { key: 'rental_income', header: 'Rental Income', priority: 'medium', minWidth: 140 },
    { key: 'mortgage_payment', header: 'Mortgage', priority: 'medium', minWidth: 120 },
    { key: 'cash_flow', header: 'Cash Flow', priority: 'high', minWidth: 120 },
    { key: 'equity', header: 'Equity', priority: 'medium', minWidth: 100 },
    { key: 'roi', header: 'ROI', priority: 'low', minWidth: 80 },
  ];

  return useResponsiveColumns({
    columns: baseColumns,
    minColumnWidth: 100,
    maxColumns: 7,
  });
};