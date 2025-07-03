import { observer } from 'mobx-react-lite';
import React from 'react';
import { useInvestmentStore } from '../../stores/hooks';

export const ColumnVisibilityControls: React.FC = observer(() => {
  const store = useInvestmentStore();

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1">
        <label className="flex items-center text-sm cursor-pointer group">
          <input
            type="checkbox"
            checked={store.showNominal}
            onChange={(e) => {
              if (!e.target.checked && !store.showReal) {
                store.setShowReal(true);
              }
              store.setShowNominal(e.target.checked);
            }}
            className="mr-2 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Nominal
          </span>
        </label>
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
        <label className="flex items-center text-sm cursor-pointer group">
          <input
            type="checkbox"
            checked={store.showReal}
            onChange={(e) => {
              if (!e.target.checked && !store.showNominal) {
                store.setShowNominal(true);
              }
              store.setShowReal(e.target.checked);
            }}
            className="mr-2 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Real
          </span>
        </label>
      </div>
      
      <div className="flex items-center gap-3">
        <label className="flex items-center text-sm cursor-pointer group bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
          <input
            type="checkbox"
            checked={store.showBalance}
            onChange={(e) => store.setShowBalance(e.target.checked)}
            className="mr-2 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">Balance</span>
        </label>
        
        <label className="flex items-center text-sm cursor-pointer group bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
          <input
            type="checkbox"
            checked={store.showContributions}
            onChange={(e) => store.setShowContributions(e.target.checked)}
            className="mr-2 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">Contributions</span>
        </label>
        
        <label className="flex items-center text-sm cursor-pointer group bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
          <input
            type="checkbox"
            checked={store.showNetGain}
            onChange={(e) => store.setShowNetGain(e.target.checked)}
            className="mr-2 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">Net Gain</span>
        </label>
      </div>
    </div>
  );
});