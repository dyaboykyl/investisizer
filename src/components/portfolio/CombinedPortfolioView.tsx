import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePortfolioStore } from '../../stores/hooks';
import { ProjectionChart } from '../ProjectionChart';
import type { AssetCalculationResult } from '../../stores/Asset';
import { SharedInputs } from './SharedInputs';

export const CombinedPortfolioView: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { combinedResults, enabledAssets, assetsList } = portfolioStore;

  // Convert combined results to the format expected by ProjectionChart
  const chartData: AssetCalculationResult[] = combinedResults.map(result => ({
    year: result.year,
    balance: result.totalBalance,
    realBalance: result.totalRealBalance,
    annualContribution: result.totalAnnualContribution,
    realAnnualContribution: result.totalRealAnnualContribution,
    totalEarnings: result.totalEarnings,
    realTotalEarnings: result.totalRealEarnings,
    yearlyGain: result.totalYearlyGain,
    realYearlyGain: result.totalRealYearlyGain
  }));

  const finalResult = combinedResults[combinedResults.length - 1];

  return (
    <div className="animate-fade-in">
      {/* Global Settings */}
      <SharedInputs />
      
      {/* Asset Selection */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Select Assets
        </h2>
        <div className="space-y-3">
          {assetsList.map((asset) => (
            <label key={asset.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={asset.enabled}
                onChange={(e) => {
                  asset.setEnabled(e.target.checked);
                  portfolioStore.markAsChanged();
                }}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-3 text-gray-900 dark:text-white font-medium">{asset.name}</span>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                ${asset.finalResult?.balance.toLocaleString() || '0'}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {enabledAssets.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Assets Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Select at least one asset above to see the combined portfolio analysis.
          </p>
        </div>
      ) : (
      <>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
          </svg>
          Portfolio Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Final Balance */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Total Final Balance
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${finalResult?.totalBalance.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real: ${finalResult?.totalRealBalance.toLocaleString() || '0'}
            </p>
          </div>

          {/* Total Contributions */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Total Annual Contributions
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${finalResult?.totalAnnualContribution.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {enabledAssets.length} active asset{enabledAssets.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Total Earnings */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Total Earnings
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${finalResult?.totalEarnings.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real: ${finalResult?.totalRealEarnings.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Asset Breakdown (Final Year)
          </h3>
          <div className="space-y-3">
            {finalResult?.assetBreakdown.map((asset) => (
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

      {chartData.length > 0 && <ProjectionChart data={chartData} />}
      
      {/* Combined Results Table */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 mt-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Combined Projection Table
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Real Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Contributions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Earnings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {combinedResults.map((result) => (
                <tr key={result.year}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {result.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${result.totalBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${result.totalRealBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${result.totalAnnualContribution.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${result.totalEarnings.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
});