import { observer } from 'mobx-react-lite';
import React from 'react';
import type { CombinedResult } from '../stores/PortfolioStore';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { FinancialTable } from '@/features/shared/components/tables';
import { type ColumnDefinition, type DualValueColumn } from '@/features/shared/components/tables/types';

interface CombinedProjectionTableProps {
  combinedResults: CombinedResult[];
}

export const CombinedProjectionTable: React.FC<CombinedProjectionTableProps> = observer(({ combinedResults }) => {
  const portfolioStore = usePortfolioStore();
  const startingYear = parseInt(portfolioStore.startingYear) || new Date().getFullYear();

  if (combinedResults.length === 0) {
    return null;
  }

  // Transform data to include calculated year display
  const transformedData = combinedResults.map(result => ({
    ...result,
    displayYear: startingYear + result.year
  }));

  // Define base columns
  const columns: ColumnDefinition[] = [
    {
      key: 'displayYear',
      label: 'Year',
      type: 'year',
      alignment: 'left',
      sticky: true
    }
  ];

  // Define dual-value columns
  const dualValueColumns: DualValueColumn[] = [
    {
      key: 'netWealth',
      label: 'Net Wealth',
      nominalKey: 'totalBalance',
      realKey: 'totalRealBalance',
      type: 'currency',
      alignment: 'right',
      colorize: () => 'font-semibold text-blue-900 dark:text-blue-100'
    },
    {
      key: 'investmentBalance',
      label: 'Investment Balance',
      nominalKey: 'totalInvestmentBalance',
      realKey: 'totalRealInvestmentBalance',
      type: 'currency',
      alignment: 'right'
    },
    {
      key: 'propertyEquity',
      label: 'Property Equity',
      nominalKey: 'totalPropertyEquity',
      realKey: 'totalRealPropertyEquity',
      type: 'currency',
      alignment: 'right'
    },
    {
      key: 'propertyValue',
      label: 'Property Value',
      nominalKey: 'totalPropertyValue',
      realKey: 'totalRealPropertyValue',
      type: 'currency',
      alignment: 'right'
    }
  ];

  // Add mortgage debt as a single column
  const mortgageColumn: ColumnDefinition = {
    key: 'totalMortgageBalance',
    label: 'Mortgage Debt',
    type: 'currency',
    alignment: 'right',
    colorize: () => 'text-red-600 dark:text-red-400'
  };

  const icon = (
    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="mt-6">
      <FinancialTable
        data={transformedData}
        columns={[...columns, mortgageColumn]}
        dualValueColumns={dualValueColumns}
        title="Net Wealth Projection Table"
        icon={icon}
        defaultExpanded={false}
        alternatingRows={true}
        hover={true}
      />
    </div>
  );
});