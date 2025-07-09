import { observer } from 'mobx-react-lite';
import React from 'react';
import { Property } from '@/features/property/stores/Property';
import { FinancialTable } from '@/features/shared/components/tables';
import { type ColumnDefinition, type DualValueColumn } from '@/features/shared/components/tables/types';

interface PropertyResultsTableProps {
  asset: Property;
}

export const PropertyResultsTable: React.FC<PropertyResultsTableProps> = observer(({ asset }) => {
  
  if (!asset.hasResults) {
    return null;
  }

  const isRentalProperty = asset.inputs.isRentalProperty;

  // Helper function to format currency values
  const formatCurrency = (value: number) => {
    const formatted = Math.abs(value).toLocaleString();
    return value >= 0 ? `$${formatted}` : `-$${formatted}`;
  };

  // Transform results data to include calculated real values
  const transformedData = asset.results.map(result => {
    const inflationRate = parseFloat(asset.inputs.inflationRate || '0') || 0;
    const inflationFactor = Math.pow(1 + inflationRate / 100, result.year);
    
    return {
      ...result,
      realBalance: result.balance / inflationFactor,
      realMortgagePayment: (result.monthlyPayment * 12) / inflationFactor,
      realPrincipal: result.principalPaid / inflationFactor,
      realInterest: result.interestPaid / inflationFactor,
      realMortgageBalance: result.mortgageBalance / inflationFactor,
      realRentalIncome: result.annualRentalIncome / inflationFactor,
      realRentalExpenses: result.totalRentalExpenses / inflationFactor,
      realCashFlow: result.annualCashFlow / inflationFactor,
      nominalMortgagePayment: result.monthlyPayment * 12
    };
  });

  // Define base columns
  const columns: ColumnDefinition[] = [
    {
      key: 'actualYear',
      label: 'Year',
      type: 'year',
      alignment: 'left',
      sticky: true
    }
  ];

  // Define dual-value columns
  const dualValueColumns: DualValueColumn[] = [
    {
      key: 'propertyValue',
      label: 'Property Value',
      nominalKey: 'balance',
      realKey: 'realBalance',
      type: 'currency',
      alignment: 'right'
    },
    {
      key: 'mortgagePayment',
      label: 'Mortgage Payment',
      nominalKey: 'nominalMortgagePayment',
      realKey: 'realMortgagePayment',
      type: 'currency',
      alignment: 'right'
    },
    {
      key: 'principal',
      label: 'Principal',
      nominalKey: 'principalPaid',
      realKey: 'realPrincipal',
      type: 'currency',
      alignment: 'right'
    },
    {
      key: 'interest',
      label: 'Interest',
      nominalKey: 'interestPaid',
      realKey: 'realInterest',
      type: 'currency',
      alignment: 'right',
      colorize: () => 'text-red-600 dark:text-red-400'
    },
    {
      key: 'mortgageBalance',
      label: 'Mortgage Balance',
      nominalKey: 'mortgageBalance',
      realKey: 'realMortgageBalance',
      type: 'currency',
      alignment: 'right',
      formatter: (value, row) => {
        const formatted = formatCurrency(value);
        return row.mortgageBalance === 0 ? `${formatted} PAID OFF` : formatted;
      },
      colorize: (value) => {
        return value === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white';
      }
    }
  ];

  // Add rental columns conditionally
  if (isRentalProperty) {
    dualValueColumns.push(
      {
        key: 'rentalIncome',
        label: 'Rental Income',
        nominalKey: 'annualRentalIncome',
        realKey: 'realRentalIncome',
        type: 'currency',
        alignment: 'right',
        colorize: () => 'text-green-600 dark:text-green-400'
      },
      {
        key: 'rentalExpenses',
        label: 'Rental Expenses',
        nominalKey: 'totalRentalExpenses',
        realKey: 'realRentalExpenses',
        type: 'currency',
        alignment: 'right',
        colorize: () => 'text-red-600 dark:text-red-400'
      }
    );
  }

  // Add cash flow column
  dualValueColumns.push({
    key: 'cashFlow',
    label: 'Cash Flow',
    nominalKey: 'annualCashFlow',
    realKey: 'realCashFlow',
    type: 'currency',
    alignment: 'right',
    formatter: (value) => {
      const sign = value >= 0 ? '+' : '';
      return `${sign}${formatCurrency(value)}`;
    },
    colorize: (value) => {
      return value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    }
  });

  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="mt-6 animate-slide-up animation-delay-200">
      <FinancialTable
        data={transformedData}
        columns={columns}
        dualValueColumns={dualValueColumns}
        title="Property Results"
        icon={icon}
        defaultExpanded={false}
        className="rounded-xl border border-gray-200 dark:border-gray-700"
        alternatingRows={true}
        hover={true}
      />
    </div>
  );
});