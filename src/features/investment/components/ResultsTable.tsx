import { observer } from 'mobx-react-lite';
import React from 'react';
import type { InvestmentResult } from '@/features/investment/stores/Investment';
import { FinancialTable } from '@/features/shared/components/tables';
import { type ColumnDefinition, type DualValueColumn } from '@/features/shared/components/tables/types';
import { formatCurrency } from '@/features/shared/utils/formatCurrency';

interface ResultsTableProps {
  results: InvestmentResult[];
}

export const ResultsTable: React.FC<ResultsTableProps> = observer(({ results }) => {
  // Define base columns
  const columns: ColumnDefinition[] = [
    {
      key: 'actualYear',
      label: 'Year',
      type: 'year',
      alignment: 'left',
      sticky: true,
      formatter: (value, row) => (value || row.year).toString()
    }
  ];

  // Define dual-value columns
  const dualValueColumns: DualValueColumn[] = [
    {
      key: 'balance',
      label: 'Balance',
      nominalKey: 'balance',
      realKey: 'realBalance',
      type: 'currency',
      alignment: 'right'
    },
    {
      key: 'directContribution',
      label: 'Direct Contribution',
      nominalKey: 'annualContribution',
      realKey: 'realAnnualContribution',
      type: 'currency',
      alignment: 'right'
    },
    {
      key: 'propertyCashFlow',
      label: 'Property Cash Flow',
      nominalKey: 'propertyCashFlow',
      realKey: 'realPropertyCashFlow',
      type: 'currency',
      alignment: 'right',
      formatter: (value) => {
        return formatCurrency(value, { showPositiveSign: true });
      },
      colorize: (value) => {
        if (value >= 0) {
          return 'text-green-600 dark:text-green-400';
        } else {
          return 'text-red-600 dark:text-red-400';
        }
      }
    },
    {
      key: 'investmentGains',
      label: 'Investment Gains',
      nominalKey: 'annualInvestmentGain',
      realKey: 'realAnnualInvestmentGain',
      type: 'currency',
      alignment: 'right'
    },
    {
      key: 'netGain',
      label: 'Net Gain',
      nominalKey: 'yearlyGain',
      realKey: 'realYearlyGain',
      type: 'currency',
      alignment: 'right',
      formatter: (value) => formatCurrency(value || 0)
    }
  ];

  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="mt-6 animate-slide-up animation-delay-200">
      <FinancialTable
        data={results}
        columns={columns}
        dualValueColumns={dualValueColumns}
        title="Projection Results"
        icon={icon}
        defaultExpanded={false}
        className="rounded-xl border border-gray-200 dark:border-gray-700"
        alternatingRows={true}
        hover={true}
      />
    </div>
  );
});