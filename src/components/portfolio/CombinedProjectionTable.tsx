import { observer } from 'mobx-react-lite';
import React from 'react';
import type { CombinedResult } from '../../stores/PortfolioStore';
import { usePortfolioStore } from '../../stores/hooks';

interface CombinedProjectionTableProps {
  combinedResults: CombinedResult[];
}

export const CombinedProjectionTable: React.FC<CombinedProjectionTableProps> = observer(({ combinedResults }) => {
  const portfolioStore = usePortfolioStore();
  const startingYear = parseInt(portfolioStore.startingYear) || new Date().getFullYear();

  if (combinedResults.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-3 md:p-6 mt-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Combined Projection Table
      </h2>
      <div className="overflow-x-auto -mx-3 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th rowSpan={2} className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                  Year
                </th>
                <th colSpan={(portfolioStore.showNominal && portfolioStore.showReal) ? 2 : 1} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                  Total Balance
                </th>
                <th colSpan={(portfolioStore.showNominal && portfolioStore.showReal) ? 2 : 1} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                  Total Contributions
                </th>
                <th colSpan={(portfolioStore.showNominal && portfolioStore.showReal) ? 2 : 1} className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Earnings
                </th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-900">
                {/* Balance columns */}
                {portfolioStore.showNominal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
                {portfolioStore.showReal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">Real</th>}

                {/* Contribution columns */}
                {portfolioStore.showNominal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
                {portfolioStore.showReal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">Real</th>}

                {/* Earnings columns */}
                {portfolioStore.showNominal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
                {portfolioStore.showReal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Real</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {combinedResults.map((result, index) => {
                const isEvenRow = index % 2 === 0;
                const rowClass = isEvenRow ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800';

                return (
                  <tr key={result.year} className={`${rowClass} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                    <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
                      {startingYear + result.year}
                    </td>

                    {/* Balance */}
                    {portfolioStore.showNominal && (
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        ${result.totalBalance.toLocaleString()}
                      </td>
                    )}
                    {portfolioStore.showReal && (
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                        ${result.totalRealBalance.toLocaleString()}
                      </td>
                    )}

                    {/* Contributions */}
                    {portfolioStore.showNominal && (
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        ${result.totalAnnualContribution.toLocaleString()}
                      </td>
                    )}
                    {portfolioStore.showReal && (
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                        ${result.totalRealAnnualContribution.toLocaleString()}
                      </td>
                    )}

                    {/* Earnings */}
                    {portfolioStore.showNominal && (
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        ${result.totalEarnings.toLocaleString()}
                      </td>
                    )}
                    {portfolioStore.showReal && (
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                        ${result.totalRealEarnings.toLocaleString()}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});