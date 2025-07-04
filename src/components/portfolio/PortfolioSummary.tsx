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
  const totalWithdrawn = portfolioStore.totalWithdrawn;
  const netContributions = portfolioStore.netContributions;
  const totalReturnPercentage = portfolioStore.totalReturnPercentage;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
        </svg>
        Portfolio Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Final Balance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Final Balance
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${finalResult.totalBalance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real: ${finalResult.totalRealBalance.toLocaleString()}
          </p>
        </div>

        {/* Total Initial Investment */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Initial Investment
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${Math.round(totalInitialInvestment).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalContributed > 0 && (
              <>Added: ${Math.round(totalContributed).toLocaleString()}</>
            )}
            {totalWithdrawn > 0 && (
              <>Withdrawn: ${Math.round(totalWithdrawn).toLocaleString()}</>
            )}
            {totalContributed === 0 && totalWithdrawn === 0 && (
              <>Combined starting amounts</>
            )}
          </p>
        </div>

        {/* Net Deposits/Withdrawals */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Net Deposits/Withdrawals
          </h3>
          <p className={`text-2xl font-bold ${netContributions >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {netContributions >= 0 ? '+' : ''}${Math.round(netContributions).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {netContributions > 0 && <>Net contributions</>}
            {netContributions < 0 && <>Net withdrawals</>}
            {netContributions === 0 && <>No net change</>}
          </p>
        </div>

        {/* Total Earnings */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Earnings
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${finalResult.totalEarnings.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real: ${finalResult.totalRealEarnings.toLocaleString()}
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

      {/* Asset Breakdown */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Asset Breakdown (Final Year)
        </h3>
        <div className="space-y-3">
          {finalResult.assetBreakdown.map((asset) => (
            <div key={asset.assetId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{asset.assetName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Contribution: ${asset.contribution.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${asset.balance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {((asset.balance / finalResult.totalBalance) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});