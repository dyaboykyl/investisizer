import { observer } from 'mobx-react-lite';
import React from 'react';
import type { InvestmentResult } from '../../stores/Investment';

interface ResultsSummaryProps {
  finalResult: InvestmentResult;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = observer(({ finalResult }) => {

  return (
    <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-primary-200 dark:border-gray-600 animate-scale-in animation-delay-300">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Investment Summary
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Final Balance</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ${finalResult.balance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real: ${finalResult.realBalance.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Contributions</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            ${(finalResult.annualContribution * finalResult.year).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Per year: ${finalResult.annualContribution.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Earnings</p>
          <p className={`text-xl font-bold ${finalResult.totalEarnings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${finalResult.totalEarnings.toLocaleString()}
          </p>
          <p className={`text-sm ${finalResult.realTotalEarnings >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            Real: ${finalResult.realTotalEarnings.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
});