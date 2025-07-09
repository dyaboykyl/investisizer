import { observer } from 'mobx-react-lite';
import React from 'react';
import type { InvestmentResult } from '@/features/investment/stores/Investment';
import { usePortfolioStore } from '@/features/core/stores/hooks';
import { formatCurrency } from '@/features/shared/utils/formatCurrency';

interface InvestmentTableBodyProps {
  results: InvestmentResult[];
}

export const InvestmentTableBody: React.FC<InvestmentTableBodyProps> = observer(({ results }) => {
  const portfolioStore = usePortfolioStore();

  return (
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
      {results.map((result, index) => {
        const isEvenRow = index % 2 === 0;
        const rowClass = isEvenRow ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800';

        return (
          <tr key={result.year} className={`${rowClass} border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
            <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
              {result.actualYear || result.year}
            </td>
            
            {/* Balance */}
            {portfolioStore.showNominal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                {formatCurrency(result.balance)}
              </td>
            )}
            {portfolioStore.showReal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                {formatCurrency(result.realBalance)}
              </td>
            )}

            {/* Direct Contribution */}
            {portfolioStore.showNominal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                {formatCurrency(result.annualContribution)}
              </td>
            )}
            {portfolioStore.showReal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                {formatCurrency(result.realAnnualContribution)}
              </td>
            )}

            {/* Property Cash Flow */}
            {portfolioStore.showNominal && (
              <td className={`px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right ${
                result.propertyCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(result.propertyCashFlow, { showPositiveSign: true })}
              </td>
            )}
            {portfolioStore.showReal && (
              <td className={`px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right border-r border-gray-200 dark:border-gray-700 ${
                result.realPropertyCashFlow >= 0 ? 'text-green-500 dark:text-green-300' : 'text-red-500 dark:text-red-300'
              }`}>
                {formatCurrency(result.realPropertyCashFlow, { showPositiveSign: true })}
              </td>
            )}

            {/* Investment Gains */}
            {portfolioStore.showNominal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                {formatCurrency(result.annualInvestmentGain)}
              </td>
            )}
            {portfolioStore.showReal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                {formatCurrency(result.realAnnualInvestmentGain)}
              </td>
            )}

            {/* Net Gain (year-over-year change) */}
            {portfolioStore.showNominal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                {formatCurrency(result.yearlyGain || 0)}
              </td>
            )}
            {portfolioStore.showReal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                {formatCurrency(result.realYearlyGain || 0)}
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
  );
});