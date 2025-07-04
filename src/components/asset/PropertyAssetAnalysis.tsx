import { observer } from 'mobx-react-lite';
import React from 'react';
import { Asset } from '../../stores/Asset';
import { usePortfolioStore } from '../../stores/hooks';

interface PropertyAssetAnalysisProps {
  asset: Asset;
}

export const PropertyAssetAnalysis: React.FC<PropertyAssetAnalysisProps> = observer(({ asset }) => {
  const portfolioStore = usePortfolioStore();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <input
            type="text"
            value={asset.name}
            onChange={(e) => {
              asset.setName(e.target.value);
              portfolioStore.markAsChanged();
            }}
            className="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 px-2 py-1 text-gray-900 dark:text-white outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={asset.enabled}
              onChange={(e) => {
                asset.setEnabled(e.target.checked);
                portfolioStore.markAsChanged();
              }}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Include in portfolio
            </span>
          </label>
        </div>
      </div>

      {/* Empty property analysis - to be implemented later */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Property Analysis
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Property investment analysis coming soon
          </p>
        </div>
      </div>
    </div>
  );
}); 