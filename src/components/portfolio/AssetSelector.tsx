import { observer } from 'mobx-react-lite';
import React from 'react';
import { usePortfolioStore } from '../../stores/hooks';

export const AssetSelector: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { assetsList } = portfolioStore;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
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
              disabled={asset.type === 'property'}
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 dark:text-white font-medium">{asset.name}</span>
                {asset.type === 'property' && (
                  <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                    Property
                  </span>
                )}
              </div>
              {asset.type === 'property' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Property assets are not included in combined portfolio calculations
                </p>
              )}
            </div>
            {asset.type === 'investment' && (
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                ${asset.finalResult?.balance.toLocaleString() || '0'}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
});