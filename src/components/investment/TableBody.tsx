import { observer } from 'mobx-react-lite';
import React from 'react';
import { useInvestmentStore } from '../../stores/hooks';
import type { CalculationResult } from '../../stores/InvestmentStore';

interface TableBodyProps {
  results: CalculationResult[];
}

export const TableBody: React.FC<TableBodyProps> = observer(({ results }) => {
  const store = useInvestmentStore();

  return (
    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
      {results.map((result) => (
        <tr key={result.year} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
            {result.year}
          </td>
          {store.showBalance && (
            <>
              {store.showNominal && (
                <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-medium">
                  ${result.balance.toLocaleString()}
                </td>
              )}
              {store.showReal && (
                <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  ${result.realBalance.toLocaleString()}
                </td>
              )}
            </>
          )}
          {store.showContributions && (
            <>
              {store.showNominal && (
                <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                  ${result.annualContribution.toLocaleString()}
                </td>
              )}
              {store.showReal && (
                <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                  ${result.realAnnualContribution.toLocaleString()}
                </td>
              )}
            </>
          )}
          {store.showNetGain && (
            <>
              {store.showNominal && (
                <td className={`px-6 py-4 text-sm text-right font-medium ${
                  result.yearlyGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  ${result.yearlyGain.toLocaleString()}
                </td>
              )}
              {store.showReal && (
                <td className={`px-6 py-4 text-sm text-right ${
                  result.realYearlyGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  ${result.realYearlyGain.toLocaleString()}
                </td>
              )}
            </>
          )}
        </tr>
      ))}
    </tbody>
  );
});