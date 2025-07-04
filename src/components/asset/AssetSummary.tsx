import { observer } from 'mobx-react-lite';
import React from 'react';
import { Asset } from '../../stores/Asset';

interface AssetSummaryProps {
  asset: Asset;
}

export const AssetSummary: React.FC<AssetSummaryProps> = observer(({ asset }) => {
  const finalResult = asset.finalResult;

  if (!finalResult) {
    return null;
  }

  // Calculate contributions and withdrawals properly (separate from initial investment)
  const initialAmount = parseFloat(asset.inputs.initialAmount) || 0;
  const annualContribution = parseFloat(asset.inputs.annualContribution) || 0;
  const years = parseInt(asset.inputs.years) || 0;

  let totalContributed = 0; // Only ongoing contributions
  let totalWithdrawn = 0;

  // Calculate total contributions/withdrawals over the years (not including initial amount)
  for (let year = 1; year <= years; year++) {
    let yearContribution = annualContribution;
    if (asset.inflationAdjustedContributions) {
      const inflationRate = parseFloat(asset.inputs.inflationRate) || 0;
      yearContribution = annualContribution * Math.pow(1 + inflationRate / 100, year);
    }

    if (yearContribution > 0) {
      totalContributed += yearContribution;
    } else {
      totalWithdrawn += Math.abs(yearContribution);
    }
  }

  const netContributions = totalContributed - totalWithdrawn;
  const totalEarnings = finalResult.balance - initialAmount - netContributions;
  const totalReturn = initialAmount > 0 ? (totalEarnings / initialAmount) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-6 h-6 mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Asset Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Final Balance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Final Balance
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${finalResult.balance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real: ${finalResult.realBalance.toLocaleString()}
          </p>
        </div>

        {/* Initial Investment */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Initial Investment
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${Math.round(initialAmount).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalContributed > 0 && (
              <>Added: ${Math.round(totalContributed).toLocaleString()}</>
            )}
            {totalWithdrawn > 0 && (
              <>Withdrawn: ${Math.round(totalWithdrawn).toLocaleString()}</>
            )}
            {totalContributed === 0 && totalWithdrawn === 0 && (
              <>Starting amount</>
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
            ${Math.round(totalEarnings).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real: ${finalResult.realTotalEarnings.toLocaleString()}
          </p>
        </div>

        {/* Total Return */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Total Return
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalReturn.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {asset.inputs.rateOfReturn}% annual
          </p>
        </div>
      </div>
    </div>
  );
});