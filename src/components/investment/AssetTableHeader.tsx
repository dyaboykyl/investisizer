import { observer } from 'mobx-react-lite';
import React from 'react';
import { usePortfolioStore } from '../../stores/hooks';

export const AssetTableHeader: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();

  return (
    <thead>
      <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <th rowSpan={2} className="px-3 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
          Year
        </th>
        <th colSpan={(portfolioStore.showNominal && portfolioStore.showReal) ? 2 : 1} className="px-3 md:px-6 py-3 md:py-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
          Balance
        </th>
        <th colSpan={(portfolioStore.showNominal && portfolioStore.showReal) ? 2 : 1} className="px-3 md:px-6 py-3 md:py-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
          Annual Contribution
        </th>
        <th colSpan={(portfolioStore.showNominal && portfolioStore.showReal) ? 2 : 1} className="px-3 md:px-6 py-3 md:py-4 text-center text-sm font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700">
          Investment Gains
        </th>
        <th colSpan={(portfolioStore.showNominal && portfolioStore.showReal) ? 2 : 1} className="px-3 md:px-6 py-3 md:py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
          Net Gain
        </th>
      </tr>
      <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {/* Balance columns */}
        {portfolioStore.showNominal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
        {portfolioStore.showReal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">Real</th>}

        {/* Contribution columns */}
        {portfolioStore.showNominal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
        {portfolioStore.showReal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">Real</th>}

        {/* Investment Gains columns */}
        {portfolioStore.showNominal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
        {portfolioStore.showReal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">Real</th>}

        {/* Net Gain columns */}
        {portfolioStore.showNominal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Nominal</th>}
        {portfolioStore.showReal && <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Real</th>}
      </tr>
    </thead>
  );
});