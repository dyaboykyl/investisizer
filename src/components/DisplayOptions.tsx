import React from 'react';
import { observer } from 'mobx-react-lite';
import { usePortfolioStore } from '../stores/hooks';

export const DisplayOptions: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  
  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 p-4 z-20">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Display Options</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={portfolioStore.showNominal}
            onChange={(e) => portfolioStore.setShowNominal(e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Nominal Values</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={portfolioStore.showReal}
            onChange={(e) => portfolioStore.setShowReal(e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Real Values (Inflation-Adjusted)</span>
        </label>
      </div>
    </div>
  );
});