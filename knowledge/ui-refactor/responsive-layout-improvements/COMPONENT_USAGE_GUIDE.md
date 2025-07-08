# Responsive Components Usage Guide

## Overview
This guide shows how to integrate the new responsive components into existing tables and data displays throughout the Investisizer application.

## Created Components

### 1. ResponsiveTable System
- **Location**: `src/features/shared/components/responsive/ResponsiveTable.tsx`
- **Purpose**: Mobile-first table that converts to card layout on mobile
- **Components**: `ResponsiveTable`, `ResponsiveTableHeader`, `ResponsiveTableBody`, `ResponsiveTableRow`, `ResponsiveTableCell`

### 2. MobileDataCard System
- **Location**: `src/features/shared/components/responsive/MobileDataCard.tsx`
- **Purpose**: Card-based data display optimized for mobile
- **Components**: `MobileDataCard`, `MobileFinancialCard`, `MobilePropertyCard`

### 3. Responsive Utilities & Hooks
- **Location**: `src/features/shared/utils/responsive/` and `src/features/shared/hooks/responsive/`
- **Purpose**: Utilities and hooks for responsive behavior

## Integration Examples

### Investment Tables

#### InvestmentTableBody.tsx
**File**: `src/features/investment/components/tables/InvestmentTableBody.tsx`

```typescript
// BEFORE
export const InvestmentTableBody: React.FC<InvestmentTableBodyProps> = observer(({ 
  asset, 
  yearlyData, 
  displayOptions, 
  formatCurrency 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <tbody>
          {yearlyData.map((row, index) => (
            <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                {row.year}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                {formatCurrency(row.balance)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                {formatCurrency(row.earnings)}
              </td>
              {/* ... more columns */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// AFTER
import { ResponsiveTable, ResponsiveTableHeader, ResponsiveTableBody, ResponsiveTableRow, ResponsiveTableCell } from '@/features/shared/components/responsive';
import { useMediaQuery } from '@/features/shared/hooks/responsive';

export const InvestmentTableBody: React.FC<InvestmentTableBodyProps> = observer(({ 
  asset, 
  yearlyData, 
  displayOptions, 
  formatCurrency 
}) => {
  return (
    <ResponsiveTable>
      <ResponsiveTableBody>
        {yearlyData.map((row, index) => (
          <ResponsiveTableRow key={index}>
            <ResponsiveTableCell priority="high" mobileLabel="Year">
              {row.year}
            </ResponsiveTableCell>
            <ResponsiveTableCell priority="high" mobileLabel="Balance">
              {displayOptions.showNominal && formatCurrency(row.balance)}
              {displayOptions.showReal && displayOptions.showNominal && ' / '}
              {displayOptions.showReal && formatCurrency(row.realBalance)}
            </ResponsiveTableCell>
            <ResponsiveTableCell priority="medium" mobileLabel="Earnings">
              {displayOptions.showNominal && formatCurrency(row.earnings)}
              {displayOptions.showReal && displayOptions.showNominal && ' / '}
              {displayOptions.showReal && formatCurrency(row.realEarnings)}
            </ResponsiveTableCell>
            <ResponsiveTableCell priority="medium" mobileLabel="Contributions">
              {displayOptions.showNominal && formatCurrency(row.contributions)}
              {displayOptions.showReal && displayOptions.showNominal && ' / '}
              {displayOptions.showReal && formatCurrency(row.realContributions)}
            </ResponsiveTableCell>
          </ResponsiveTableRow>
        ))}
      </ResponsiveTableBody>
    </ResponsiveTable>
  );
});
```

#### InvestmentTableHeader.tsx
**File**: `src/features/investment/components/tables/InvestmentTableHeader.tsx`

```typescript
// BEFORE
export const InvestmentTableHeader: React.FC<InvestmentTableHeaderProps> = observer(({ 
  displayOptions 
}) => {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Year
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Balance
        </th>
        {/* ... more headers */}
      </tr>
    </thead>
  );
});

// AFTER
import { ResponsiveTableHeader } from '@/features/shared/components/responsive';
import { useResponsiveColumns } from '@/features/shared/hooks/responsive';

export const InvestmentTableHeader: React.FC<InvestmentTableHeaderProps> = observer(({ 
  displayOptions 
}) => {
  const { getColumnVisibility } = useFinancialTableColumns();
  
  return (
    <ResponsiveTableHeader>
      <tr className="bg-gray-50 dark:bg-gray-800">
        {getColumnVisibility('year') && (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Year
          </th>
        )}
        {getColumnVisibility('balance') && (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Balance {displayOptions.showReal && displayOptions.showNominal && '(Nominal / Real)'}
          </th>
        )}
        {getColumnVisibility('earnings') && (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Earnings {displayOptions.showReal && displayOptions.showNominal && '(Nominal / Real)'}
          </th>
        )}
        {getColumnVisibility('contributions') && (
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Contributions {displayOptions.showReal && displayOptions.showNominal && '(Nominal / Real)'}
          </th>
        )}
      </tr>
    </ResponsiveTableHeader>
  );
});
```

### Property Tables

#### PropertyResultsTable.tsx
**File**: `src/features/property/components/analysis/PropertyResultsTable.tsx`

```typescript
// BEFORE
export const PropertyResultsTable: React.FC<PropertyResultsTableProps> = observer(({ 
  property, 
  yearlyData, 
  displayOptions, 
  formatCurrency 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Year</th>
            <th>Property Value</th>
            <th>Rental Income</th>
            {/* ... more headers */}
          </tr>
        </thead>
        <tbody>
          {yearlyData.map((row, index) => (
            <tr key={index}>
              <td>{row.year}</td>
              <td>{formatCurrency(row.propertyValue)}</td>
              <td>{formatCurrency(row.rentalIncome)}</td>
              {/* ... more cells */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// AFTER
import { ResponsiveTable, ResponsiveTableHeader, ResponsiveTableBody, ResponsiveTableRow, ResponsiveTableCell, MobilePropertyCard } from '@/features/shared/components/responsive';
import { useMediaQuery } from '@/features/shared/hooks/responsive';

export const PropertyResultsTable: React.FC<PropertyResultsTableProps> = observer(({ 
  property, 
  yearlyData, 
  displayOptions, 
  formatCurrency 
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  // Mobile view: Use specialized property cards
  if (isMobile) {
    return (
      <div className="space-y-4">
        {yearlyData.map((row, index) => (
          <MobilePropertyCard
            key={index}
            title={`Year ${row.year}`}
            year={row.year}
            value={formatCurrency(row.propertyValue)}
            rentalIncome={property.isRental ? formatCurrency(row.rentalIncome) : undefined}
            mortgagePayment={property.hasMortgage ? formatCurrency(row.mortgagePayment) : undefined}
            cashFlow={formatCurrency(row.cashFlow)}
            equity={formatCurrency(row.equity)}
            roi={`${row.roi.toFixed(2)}%`}
          />
        ))}
      </div>
    );
  }
  
  // Desktop view: Use responsive table
  return (
    <ResponsiveTable>
      <ResponsiveTableHeader>
        <tr className="bg-gray-50 dark:bg-gray-800">
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Year
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Property Value
          </th>
          {property.isRental && (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Rental Income
            </th>
          )}
          {property.hasMortgage && (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Mortgage Payment
            </th>
          )}
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Cash Flow
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Equity
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            ROI
          </th>
        </tr>
      </ResponsiveTableHeader>
      <ResponsiveTableBody>
        {yearlyData.map((row, index) => (
          <ResponsiveTableRow key={index}>
            <ResponsiveTableCell priority="high" mobileLabel="Year">
              {row.year}
            </ResponsiveTableCell>
            <ResponsiveTableCell priority="high" mobileLabel="Property Value">
              {formatCurrency(row.propertyValue)}
            </ResponsiveTableCell>
            {property.isRental && (
              <ResponsiveTableCell priority="medium" mobileLabel="Rental Income">
                {formatCurrency(row.rentalIncome)}
              </ResponsiveTableCell>
            )}
            {property.hasMortgage && (
              <ResponsiveTableCell priority="medium" mobileLabel="Mortgage Payment">
                {formatCurrency(row.mortgagePayment)}
              </ResponsiveTableCell>
            )}
            <ResponsiveTableCell priority="high" mobileLabel="Cash Flow">
              {formatCurrency(row.cashFlow)}
            </ResponsiveTableCell>
            <ResponsiveTableCell priority="medium" mobileLabel="Equity">
              {formatCurrency(row.equity)}
            </ResponsiveTableCell>
            <ResponsiveTableCell priority="low" mobileLabel="ROI">
              {row.roi.toFixed(2)}%
            </ResponsiveTableCell>
          </ResponsiveTableRow>
        ))}
      </ResponsiveTableBody>
    </ResponsiveTable>
  );
});
```

### Asset Breakdown Components

#### AssetBreakdownItem.tsx
**File**: `src/features/portfolio/components/breakdown/AssetBreakdownItem.tsx`

```typescript
// BEFORE
export const AssetBreakdownItem: React.FC<AssetBreakdownItemProps> = observer(({ 
  asset, 
  breakdown, 
  onClick, 
  onCheckboxChange 
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={breakdown.selected}
          onChange={(e) => onCheckboxChange(asset.id, e.target.checked)}
          className="w-4 h-4"
        />
        <div>
          <h3 className="font-semibold">{asset.name}</h3>
          <p className="text-sm text-gray-600">{asset.type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(breakdown.balance)}</p>
        <p className="text-sm text-gray-600">{breakdown.percentage.toFixed(1)}%</p>
      </div>
    </div>
  );
});

// AFTER
import { MobileDataCard } from '@/features/shared/components/responsive';
import { useMediaQuery } from '@/features/shared/hooks/responsive';

export const AssetBreakdownItem: React.FC<AssetBreakdownItemProps> = observer(({ 
  asset, 
  breakdown, 
  onClick, 
  onCheckboxChange 
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  if (isMobile) {
    return (
      <MobileDataCard
        title={asset.name}
        data={[
          { 
            label: 'Type', 
            value: asset.type.charAt(0).toUpperCase() + asset.type.slice(1), 
            priority: 'high' 
          },
          { 
            label: 'Balance', 
            value: formatCurrency(breakdown.balance), 
            priority: 'high' 
          },
          { 
            label: 'Percentage', 
            value: `${breakdown.percentage.toFixed(1)}%`, 
            priority: 'medium' 
          },
          { 
            label: 'Real Balance', 
            value: formatCurrency(breakdown.realBalance), 
            priority: 'low' 
          }
        ]}
        className="cursor-pointer"
        onClick={() => onClick(asset.id)}
      />
    );
  }
  
  // Desktop view remains the same
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={breakdown.selected}
          onChange={(e) => onCheckboxChange(asset.id, e.target.checked)}
          className="w-4 h-4"
        />
        <div>
          <h3 className="font-semibold">{asset.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{asset.type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">{formatCurrency(breakdown.balance)}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{breakdown.percentage.toFixed(1)}%</p>
      </div>
    </div>
  );
});
```

## Component Props Reference

### ResponsiveTable Components

#### ResponsiveTableCell
```typescript
interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  priority?: 'high' | 'medium' | 'low';  // Controls mobile visibility
  mobileLabel?: string;                   // Label shown on mobile
}
```

#### MobileDataCard
```typescript
interface MobileDataCardProps {
  title: string;
  data: DataItem[];
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface DataItem {
  label: string;
  value: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  icon?: React.ReactNode;
}
```

#### MobileFinancialCard
```typescript
interface MobileFinancialCardProps {
  title: string;
  year: number;
  balance: React.ReactNode;
  earnings: React.ReactNode;
  contributions?: React.ReactNode;
  realBalance?: React.ReactNode;
  className?: string;
}
```

#### MobilePropertyCard
```typescript
interface MobilePropertyCardProps {
  title: string;
  year: number;
  value: React.ReactNode;
  rentalIncome?: React.ReactNode;
  mortgagePayment?: React.ReactNode;
  cashFlow?: React.ReactNode;
  equity?: React.ReactNode;
  roi?: React.ReactNode;
  className?: string;
}
```

## Priority System

The components use a priority system to determine what information to show on mobile:

- **High Priority**: Always visible on mobile (Year, Balance, Cash Flow)
- **Medium Priority**: Visible on larger mobile screens (Earnings, Contributions)
- **Low Priority**: Hidden on mobile, shown on desktop (Real values, ROI)

## Best Practices

1. **Always provide mobileLabel** for ResponsiveTableCell components
2. **Use priority system** to ensure important data is visible on mobile
3. **Test on actual mobile devices** to verify touch interactions
4. **Consider data density** - mobile cards should not be overwhelmed with information
5. **Use semantic HTML** - table structure is preserved for accessibility

## Implementation Order

1. **Phase 2A**: Investment tables (InvestmentTableBody, InvestmentTableHeader)
2. **Phase 2B**: Property tables (PropertyResultsTable)
3. **Phase 2C**: Asset breakdown components (AssetBreakdownItem, AssetBreakdownSelector)
4. **Phase 2D**: Portfolio components (CombinedProjectionTable)

This systematic approach ensures that each component is properly tested and integrated before moving to the next phase.