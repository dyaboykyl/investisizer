import { observer } from 'mobx-react-lite';
import React from 'react';
import type { InvestmentResult } from '@/features/investment/stores/Investment';
import { usePortfolioStore } from '@/features/core/stores/hooks';

interface InvestmentTableBodyProps {
  results: InvestmentResult[];
}

export const InvestmentTableBody: React.FC<InvestmentTableBodyProps> = observer(({ results }) => {
  const portfolioStore = usePortfolioStore();

  return (
    <tbody>
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
                ${result.balance.toLocaleString()}
              </td>
            )}
            {portfolioStore.showReal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                ${result.realBalance.toLocaleString()}
              </td>
            )}

            {/* Annual Contribution */}
            {portfolioStore.showNominal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                ${result.annualContribution.toLocaleString()}
              </td>
            )}
            {portfolioStore.showReal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                ${result.realAnnualContribution.toLocaleString()}
              </td>
            )}

            {/* Investment Gains */}
            {portfolioStore.showNominal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                ${result.annualInvestmentGain.toLocaleString()}
              </td>
            )}
            {portfolioStore.showReal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                ${result.realAnnualInvestmentGain.toLocaleString()}
              </td>
            )}

            {/* Net Gain (year-over-year change) */}
            {portfolioStore.showNominal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                ${result.yearlyGain?.toLocaleString() || '0'}
              </td>
            )}
            {portfolioStore.showReal && (
              <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                ${result.realYearlyGain?.toLocaleString() || '0'}
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
  );
});