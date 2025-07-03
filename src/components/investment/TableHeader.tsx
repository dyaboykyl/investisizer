import { observer } from 'mobx-react-lite';
import React from 'react';
import { useInvestmentStore } from '../../stores/hooks';

export const TableHeader: React.FC = observer(() => {
  const store = useInvestmentStore();

  return (
    <thead>
      <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <th rowSpan={2} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
          Year
        </th>
        {store.showBalance && (
          <th colSpan={(store.showNominal && store.showReal) ? 2 : 1} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
            Balance
          </th>
        )}
        {store.showContributions && (
          <th colSpan={(store.showNominal && store.showReal) ? 2 : 1} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
            Annual Contribution
          </th>
        )}
        {store.showNetGain && (
          <th colSpan={(store.showNominal && store.showReal) ? 2 : 1} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
            Net Gain
          </th>
        )}
      </tr>
      <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {store.showBalance && (
          <>
            {store.showNominal && <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
            {store.showReal && <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">Real</th>}
          </>
        )}
        {store.showContributions && (
          <>
            {store.showNominal && <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
            {store.showReal && <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">Real</th>}
          </>
        )}
        {store.showNetGain && (
          <>
            {store.showNominal && <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
            {store.showReal && <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Real</th>}
          </>
        )}
      </tr>
    </thead>
  );
});