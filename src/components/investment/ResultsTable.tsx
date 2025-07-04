import { observer } from 'mobx-react-lite';
import React from 'react';
import { useInvestmentStore } from '../../stores/hooks';
import type { CalculationResult } from '../../stores/InvestmentStore';
import { ResultsSummary } from './ResultsSummary';
import { AssetTableBody } from './AssetTableBody';
import { AssetTableHeader } from './AssetTableHeader';

interface ResultsTableProps {
  results: CalculationResult[];
}

export const ResultsTable: React.FC<ResultsTableProps> = observer(({ results }) => {
  const store = useInvestmentStore();

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mt-6 border border-gray-200 dark:border-gray-700 animate-slide-up animation-delay-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Projection Results
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full">
          <AssetTableHeader />
          <AssetTableBody results={results} />
        </table>
      </div>

      {store.finalResult && <ResultsSummary finalResult={store.finalResult} />}
    </div>
  );
});