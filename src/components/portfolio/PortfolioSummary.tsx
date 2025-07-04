import { observer } from 'mobx-react-lite';
import React from 'react';
import type { CombinedResult } from '../../stores/PortfolioStore';
import { usePortfolioStore } from '../../stores/hooks';

interface PortfolioSummaryProps {
  finalResult: CombinedResult | undefined;
  enabledAssetsCount: number;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = observer(({ finalResult, enabledAssetsCount }) => {
  const portfolioStore = usePortfolioStore();

  if (!finalResult || enabledAssetsCount === 0) {
    return null;
  }

  const totalInitialInvestment = portfolioStore.totalInitialInvestment;
  const totalContributed = portfolioStore.totalContributed;
  const totalReturnPercentage = portfolioStore.totalReturnPercentage;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
        </svg>
        Net Wealth Summary
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {/* Total Net Wealth */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Total Net Wealth
          </h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            ${finalResult.totalBalance.toLocaleString()}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Real: ${finalResult.totalRealBalance.toLocaleString()}
          </p>
        </div>

        {/* Investment Balance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Investment Balance
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${finalResult.totalInvestmentBalance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real: ${finalResult.totalRealInvestmentBalance.toLocaleString()}
          </p>
        </div>

        {/* Property Equity */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Property Equity
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${finalResult.totalPropertyEquity.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real: ${finalResult.totalRealPropertyEquity.toLocaleString()}
          </p>
        </div>

        {/* Property Value */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Property Value
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${finalResult.totalPropertyValue.toLocaleString()}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Debt: ${finalResult.totalMortgageBalance.toLocaleString()}
          </p>
        </div>

        {/* Total Initial Investment */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Initial Investment
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${Math.round(totalInitialInvestment).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalContributed > 0 && (
              <>Added: ${Math.round(totalContributed).toLocaleString()}</>
            )}
            {totalContributed === 0 && (
              <>Down payments & deposits</>
            )}
          </p>
        </div>

        {/* Total Return */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Return
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalReturnPercentage.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            On initial investment
          </p>
        </div>
      </div>
    </div>
  );
});