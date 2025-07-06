import { observer } from 'mobx-react-lite';
import React from 'react';
import { Property } from '@/features/property/stores/Property';

interface PropertyProjectionResultsProps {
  asset: Property;
}

export const PropertyProjectionResults: React.FC<PropertyProjectionResultsProps> = observer(({ asset }) => {
  if (!asset.hasResults) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-3 md:p-6 mt-6 border border-gray-200 dark:border-gray-700 animate-slide-up animation-delay-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Mortgage Amortization Schedule
        </h2>
      </div>

      <div className="overflow-x-auto -mx-3 md:mx-0 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Yearly Payment
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Principal Paid
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Interest Paid
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Remaining Balance
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Annual Cash Flow
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {asset.results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {result.year}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${((result.monthlyPayment || 0) * 12).toLocaleString()}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${(result.principalPaid || 0).toLocaleString()}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                    ${(result.interestPaid || 0).toLocaleString()}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`${(result.mortgageBalance || 0) === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      ${(result.mortgageBalance || 0).toLocaleString()}
                    </span>
                    {(result.mortgageBalance || 0) === 0 && (
                      <span className="ml-2 text-green-600 dark:text-green-400 text-xs">
                        PAID OFF
                      </span>
                    )}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`${
                      (result.annualCashFlow || 0) >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {(result.annualCashFlow || 0) >= 0 ? '+' : ''}${(result.annualCashFlow || 0).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});