import { observer } from 'mobx-react-lite';
import React from 'react';
import { usePortfolioStore } from '../stores/hooks';
import { AssetAnalysis } from './asset/AssetAnalysis';
import { PropertyAssetAnalysis } from './asset/PropertyAssetAnalysis';
import { DisplayOptions } from './DisplayOptions';
import { CombinedPortfolioView } from './portfolio/CombinedPortfolioView';
import { TabBar } from './tabs/TabBar';
import { UnsavedChangesIndicator } from './UnsavedChangesIndicator';

export const MultiAssetCalculator: React.FC = observer(() => {
  const portfolioStore = usePortfolioStore();
  const { activeTabId, activeAsset } = portfolioStore;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in pb-32 md:pb-36">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Multi-Asset Portfolio Projection
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Plan your financial future with multiple assets. Analyze individual investments and see their combined performance.
        </p>
      </div>

      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900">
        <TabBar />
      </div>

      <div className="mt-8">
        {activeTabId === 'combined' ? (
          <CombinedPortfolioView />
        ) : activeAsset ? (
          activeAsset.type === 'property' ? (
            <PropertyAssetAnalysis asset={activeAsset} />
          ) : (
            <AssetAnalysis asset={activeAsset} />
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Select an asset to view its analysis
            </p>
          </div>
        )}
      </div>

      <DisplayOptions />
      <UnsavedChangesIndicator />
    </div>
  );
});